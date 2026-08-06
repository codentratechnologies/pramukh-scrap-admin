from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from firebase import db
from datetime import datetime
from auth import verify_token

router = APIRouter()

class EmployeeModel(BaseModel):
    name: str

@router.post("/employees", dependencies=[Depends(verify_token)])
def add_employee(employee: EmployeeModel):
    if not db:
        raise HTTPException(status_code=500, detail="Database is not initialized.")
        
    try:
        data = employee.dict()
        data['createdAt'] = datetime.utcnow().isoformat()
        
        # Check if employee already exists
        employees_ref = db.child("employees").get()
        if employees_ref and employees_ref.val():
            existing = [s.get('name', '').lower() for s in employees_ref.val().values()]
            if data['name'].lower() in existing:
                raise HTTPException(status_code=400, detail="Employee already exists")
                
        new_employee = db.child("employees").push(data)
        
        return {"success": True, "message": "Employee added successfully.", "id": new_employee['name'], "data": {"id": new_employee['name'], **data}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/employees", dependencies=[Depends(verify_token)])
def get_employees():
    if not db:
        raise HTTPException(status_code=500, detail="Database is not initialized.")
        
    try:
        employees_ref = db.child("employees").get()
        if employees_ref and employees_ref.val():
            employees_data = employees_ref.val()
            result = []
            for k, v in employees_data.items():
                v['id'] = k
                result.append(v)
            # Sort by name
            result.sort(key=lambda x: x.get('name', '').lower())
            return {"success": True, "data": result}
        return {"success": True, "data": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
