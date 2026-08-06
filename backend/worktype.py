from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from firebase import db
from datetime import datetime
from auth import verify_token

router = APIRouter()

class WorkTypeModel(BaseModel):
    name: str

@router.post("/worktypes", dependencies=[Depends(verify_token)])
def add_worktype(worktype: WorkTypeModel):
    if not db:
        raise HTTPException(status_code=500, detail="Database is not initialized.")
        
    try:
        data = worktype.dict()
        data['createdAt'] = datetime.utcnow().isoformat()
        
        # Check if work type already exists
        worktypes_ref = db.child("worktypes").get()
        if worktypes_ref and worktypes_ref.val():
            existing = [s.get('name', '').lower() for s in worktypes_ref.val().values()]
            if data['name'].lower() in existing:
                raise HTTPException(status_code=400, detail="Work type already exists")
                
        new_worktype = db.child("worktypes").push(data)
        
        return {"success": True, "message": "Work type added successfully.", "id": new_worktype['name'], "data": {"id": new_worktype['name'], **data}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/worktypes", dependencies=[Depends(verify_token)])
def get_worktypes():
    if not db:
        raise HTTPException(status_code=500, detail="Database is not initialized.")
        
    try:
        worktypes_ref = db.child("worktypes").get()
        if worktypes_ref and worktypes_ref.val():
            worktypes_data = worktypes_ref.val()
            result = []
            for k, v in worktypes_data.items():
                v['id'] = k
                result.append(v)
            # Sort by name
            result.sort(key=lambda x: x.get('name', '').lower())
            return {"success": True, "data": result}
            
        # Seed default work types if empty
        default_types = ["Grinding", "Kabadu", "Patakadku"]
        result = []
        for name in default_types:
            data = {'name': name, 'createdAt': datetime.utcnow().isoformat()}
            new_ref = db.child("worktypes").push(data)
            data['id'] = new_ref['name']
            result.append(data)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
