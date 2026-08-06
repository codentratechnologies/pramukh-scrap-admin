from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from firebase import db
from datetime import datetime
from auth import verify_token

router = APIRouter()

class SupervisorModel(BaseModel):
    name: str

@router.post("/supervisors", dependencies=[Depends(verify_token)])
def add_supervisor(supervisor: SupervisorModel):
    if not db:
        raise HTTPException(status_code=500, detail="Database is not initialized.")
        
    try:
        data = supervisor.dict()
        data['createdAt'] = datetime.utcnow().isoformat()
        
        # Check if supervisor already exists
        supervisors_ref = db.child("supervisors").get()
        if supervisors_ref and supervisors_ref.val():
            existing = [s.get('name', '').lower() for s in supervisors_ref.val().values()]
            if data['name'].lower() in existing:
                raise HTTPException(status_code=400, detail="Supervisor already exists")
                
        new_supervisor = db.child("supervisors").push(data)
        
        return {"success": True, "message": "Supervisor added successfully.", "id": new_supervisor['name'], "data": {"id": new_supervisor['name'], **data}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/supervisors", dependencies=[Depends(verify_token)])
def get_supervisors():
    if not db:
        raise HTTPException(status_code=500, detail="Database is not initialized.")
        
    try:
        supervisors_ref = db.child("supervisors").get()
        if supervisors_ref and supervisors_ref.val():
            supervisors_data = supervisors_ref.val()
            result = []
            for k, v in supervisors_data.items():
                v['id'] = k
                result.append(v)
            # Sort by name
            result.sort(key=lambda x: x.get('name', '').lower())
            return {"success": True, "data": result}
        return {"success": True, "data": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
