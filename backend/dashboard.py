from fastapi import APIRouter, Depends, HTTPException, Query
from firebase import db
from auth import verify_token
from datetime import datetime, date, timedelta
from typing import Optional

router = APIRouter()

def parse_date(date_str: str) -> Optional[datetime]:
    try:
        # handle "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM:SS..."
        if "T" in date_str:
            return datetime.fromisoformat(date_str.replace("Z", "+00:00")).replace(tzinfo=None)
        return datetime.strptime(date_str, "%Y-%m-%d")
    except:
        return None

@router.get("/dashboard/stats", dependencies=[Depends(verify_token)])
def get_dashboard_stats(
    filter_type: Optional[str] = Query(None, description="today, week, month, custom"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    if not db:
        raise HTTPException(status_code=500, detail="Database is not initialized.")
        
    try:
        # Determine date range
        now = datetime.now()
        dt_start = None
        dt_end = None
        
        if filter_type == "today":
            dt_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            dt_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)
        elif filter_type == "week":
            # Start of week (Monday)
            dt_start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
            dt_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)
        elif filter_type == "month":
            dt_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            dt_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)
        elif filter_type == "custom" and start_date and end_date:
            dt_start = parse_date(start_date)
            dt_end = parse_date(end_date)
            if dt_start and dt_end:
                dt_start = dt_start.replace(hour=0, minute=0, second=0, microsecond=0)
                dt_end = dt_end.replace(hour=23, minute=59, second=59, microsecond=999999)
                
        # Fetch data
        labor_ref = db.child("labor_management").get()
        labor_data = labor_ref.val() if labor_ref else {}
        
        # Initialize stats
        total_labor_entries = 0
        total_labor_cost = 0.0
        total_payable_amount = 0.0
        unique_employees = set()
        
        work_type_weights = {
            "Grinding": 0.0,
            "Kabadu": 0.0,
            "Patakadku": 0.0
        }
        
        # Line chart data: cost per day
        cost_by_day = {}
        
        for key, entry in labor_data.items():
            entry_date_str = entry.get('entryDate', '')
            entry_dt = parse_date(entry_date_str)
            
            # Apply date filter
            if dt_start and dt_end and entry_dt:
                if not (dt_start <= entry_dt <= dt_end):
                    continue
            elif filter_type and filter_type != "custom": # If a filter was requested but dates didn't parse, skip or handle? We assume filter applies
                 # Wait, if dt_start is set, we check it. If no filter requested, include all.
                 pass

            total_labor_entries += 1
            entry_cost = float(entry.get('grandTotalAmount', 0))
            total_labor_cost += entry_cost
            total_payable_amount += float(entry.get('payableAmount', 0))
            
            # For line chart
            if entry_dt:
                day_str = entry_dt.strftime("%d %b")
                cost_by_day[day_str] = cost_by_day.get(day_str, 0) + entry_cost
            
            # For donut chart
            for emp in entry.get('employees', []):
                name = emp.get('name', '')
                if name:
                    unique_employees.add(name.lower().strip())
                for wt in emp.get('workTypes', []):
                    w_type = wt.get('type')
                    weight = float(wt.get('weight', 0))
                    if w_type in work_type_weights:
                        work_type_weights[w_type] += weight
                    else:
                        work_type_weights[w_type] = weight

        # Format Work Type Data for Recharts
        colors = ["#22C55E", "#3B82F6", "#F97316", "#A855F7", "#EC4899"]
        work_type_data = []
        color_idx = 0
        for wt_name, wt_val in work_type_weights.items():
            if wt_val > 0:
                work_type_data.append({
                    "name": wt_name,
                    "value": wt_val,
                    "color": colors[color_idx % len(colors)]
                })
                color_idx += 1
                
        if not work_type_data:
            work_type_data = [
                {"name": "No Data", "value": 1, "color": "#E5E7EB"}
            ]

        # Format Line Chart Data (continuous date range)
        line_chart_data = []
        if cost_by_day:
            parsed_dates = [datetime.strptime(d, "%d %b") for d in cost_by_day.keys()]
            min_date = min(parsed_dates)
            max_date = max(parsed_dates)
            
            # If only 1 day of data exists, pad with previous and next day for visual line rendering
            if min_date == max_date:
                min_date -= timedelta(days=1)
                max_date += timedelta(days=1)
                
            current_date = min_date
            while current_date <= max_date:
                day_str = current_date.strftime("%d %b")
                line_chart_data.append({
                    "name": day_str,
                    "cost": round(cost_by_day.get(day_str, 0), 2)
                })
                current_date += timedelta(days=1)
        else:
            line_chart_data = [{"name": "No Data", "cost": 0}]

        stats = {
            "summary": {
                "totalLaborEntries": total_labor_entries,
                "totalEmployees": len(unique_employees),
                "totalLaborCost": total_labor_cost,
                "totalPayableAmount": total_payable_amount
            },
            "workTypeData": work_type_data,
            "lineChartData": line_chart_data
        }
        
        return {"success": True, "data": stats}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
