from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from firebase import db
from datetime import datetime
from auth import verify_token

router = APIRouter()

class WorkTypeModel(BaseModel):
    id: int
    type: str
    weight: float
    rate: float

class EmployeeModel(BaseModel):
    id: int
    name: str
    workTypes: List[WorkTypeModel]

class LaborEntryModel(BaseModel):
    entryDate: str
    supervisorName: str
    deductions: float
    deductionReason: str
    remarks: str
    employees: List[EmployeeModel]
    grandTotalWeight: float
    grandTotalAmount: float
    payableAmount: float

@router.post("/labor", dependencies=[Depends(verify_token)])
def add_labor_entry(entry: LaborEntryModel):
    if not db:
        raise HTTPException(status_code=500, detail="Database is not initialized.")
        
    try:
        data = entry.dict()
        data['createdAt'] = datetime.utcnow().isoformat()
        data['updatedAt'] = datetime.utcnow().isoformat()
        
        db.child("labor_management").push(data)
        
        return {"success": True, "message": "Labor entry added successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/labor", dependencies=[Depends(verify_token)])
def get_labor_entries():
    if not db:
        raise HTTPException(status_code=500, detail="Database is not initialized.")
        
    try:
        labor_ref = db.child("labor_management").get()
        if labor_ref and labor_ref.val():
            labor_data = labor_ref.val()
            result = []
            for k, v in labor_data.items():
                v['id'] = k
                result.append(v)
            # Sort by entryDate descending, or createdAt descending
            result.sort(key=lambda x: x.get('entryDate', x.get('createdAt', '')), reverse=True)
            return {"success": True, "data": result}
        return {"success": True, "data": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/labor/{entry_id}", dependencies=[Depends(verify_token)])
def get_labor_entry(entry_id: str):
    if not db:
        raise HTTPException(status_code=500, detail="Database is not initialized.")
        
    try:
        labor_ref = db.child("labor_management").child(entry_id).get()
        if labor_ref and labor_ref.val():
            data = labor_ref.val()
            data['id'] = entry_id
            return {"success": True, "data": data}
        raise HTTPException(status_code=404, detail="Labor entry not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/labor/{entry_id}", dependencies=[Depends(verify_token)])
def update_labor_entry(entry_id: str, entry: LaborEntryModel):
    if not db:
        raise HTTPException(status_code=500, detail="Database is not initialized.")
        
    try:
        labor_ref = db.child("labor_management").child(entry_id).get()
        if not labor_ref or not labor_ref.val():
            raise HTTPException(status_code=404, detail="Labor entry not found")
            
        data = entry.dict()
        data['updatedAt'] = datetime.utcnow().isoformat()
        
        # Merge or overwrite the existing node
        db.child("labor_management").child(entry_id).update(data)
        
        return {"success": True, "message": "Labor entry updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/labor/{entry_id}", dependencies=[Depends(verify_token)])
def delete_labor_entry(entry_id: str):
    if not db:
        raise HTTPException(status_code=500, detail="Database is not initialized.")
        
    try:
        labor_ref = db.child("labor_management").child(entry_id).get()
        if not labor_ref or not labor_ref.val():
            raise HTTPException(status_code=404, detail="Labor entry not found")
            
        db.child("labor_management").child(entry_id).remove()
        
        return {"success": True, "message": "Labor entry deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
