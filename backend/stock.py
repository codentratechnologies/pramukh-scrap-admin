from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from firebase import db
from datetime import datetime
from auth import verify_token

router = APIRouter()

class StockEntry(BaseModel):
    materialName: str
    description: str = ""
    quantity: str
    unit: str
    stockDate: str

class StockAdjustment(BaseModel):
    actionType: str
    quantity: str
    unit: str
    remarks: str

@router.post("/stocks", dependencies=[Depends(verify_token)])
def add_stock(entry: StockEntry):
    print(">>> RECEIVED STOCK ADD REQUEST:", entry)
    if not db:
        print(">>> ERROR: Database not initialized")
        raise HTTPException(status_code=500, detail="Database is not initialized. Check your credentials.")
    
    try:
        new_stock = entry.dict()
        new_stock["createdAt"] = datetime.utcnow().isoformat() + "Z"
        
        # In Pyrebase, we use child() to target a table, and push() to add a new record
        result = db.child("stock_management").push(new_stock)
        stock_id = result.get("name")
        
        # Push initial history record
        history_record = {
            "action": "ADDED",
            "quantity": new_stock["quantity"],
            "unit": new_stock["unit"],
            "remarks": "Initial stock entry",
            "date": new_stock["createdAt"]
        }
        db.child("stock_management").child(stock_id).child("history").push(history_record)
        
        return {"success": True, "id": stock_id, "message": "Stock added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stocks", dependencies=[Depends(verify_token)])
def get_stocks():
    if not db:
        raise HTTPException(status_code=500, detail="Database is not initialized. Check your credentials.")
    
    try:
        stocks = db.child("stock_management").get()
        result = []
        
        # Pyrebase get() returns an object with a .val() method
        data = stocks.val()
        if data:
            for key, val in data.items():
                val["id"] = key
                result.append(val)
                
        # Sort by createdAt descending
        result.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
                
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stocks/{stock_id}/adjust", dependencies=[Depends(verify_token)])
def adjust_stock(stock_id: str, adjustment: StockAdjustment):
    if not db:
        raise HTTPException(status_code=500, detail="Database is not initialized.")
        
    try:
        stock_ref = db.child("stock_management").child(stock_id).get()
        stock_data = stock_ref.val()
        
        if not stock_data:
            raise HTTPException(status_code=404, detail="Stock not found")
            
        current_quantity = float(stock_data.get("quantity", 0))
        adj_qty = float(adjustment.quantity)
        
        if adjustment.actionType == "add":
            new_quantity = current_quantity + adj_qty
            action_str = "ADDED"
        elif adjustment.actionType == "remove":
            new_quantity = current_quantity - adj_qty
            action_str = "REMOVED"
        else:
            raise HTTPException(status_code=400, detail="Invalid action type")
            
        # Update quantity
        db.child("stock_management").child(stock_id).update({"quantity": str(new_quantity)})
        
        # Push history
        history_record = {
            "action": action_str,
            "quantity": str(adj_qty),
            "unit": adjustment.unit,
            "remarks": adjustment.remarks,
            "date": datetime.utcnow().isoformat() + "Z"
        }
        db.child("stock_management").child(stock_id).child("history").push(history_record)
        
        return {"success": True, "message": "Stock adjusted successfully", "new_quantity": new_quantity}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
