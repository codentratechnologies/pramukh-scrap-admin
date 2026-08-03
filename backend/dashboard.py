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
        
        # Today / Yesterday boundaries
        dt_today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        dt_yesterday_start = dt_today_start - timedelta(days=1)
        dt_yesterday_end = dt_today_start - timedelta(microseconds=1)
        
        today_overview = {
            "laborEntries": 0,
            "totalWeight": 0.0,
            "totalDeductions": 0.0,
            "payableAmount": 0.0,
            "uniqueEmployees": set(),
            "laborCost": 0.0
        }
        
        yesterday_summary = {
            "laborEntries": 0,
            "totalWeight": 0.0,
            "totalDeductions": 0.0,
            "payableAmount": 0.0,
            "uniqueEmployees": set(),
            "laborCost": 0.0
        }
        
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
            
            entry_cost = float(entry.get('grandTotalAmount', 0))
            entry_payable = float(entry.get('payableAmount', 0))
            
            # Apply date filter for main summary
            in_range = True
            if dt_start and dt_end and entry_dt:
                if not (dt_start <= entry_dt <= dt_end):
                    in_range = False
            
            if in_range:
                total_labor_entries += 1
                total_labor_cost += entry_cost
                total_payable_amount += entry_payable
                
                if entry_dt:
                    day_str = entry_dt.strftime("%d %b")
                    cost_by_day[day_str] = cost_by_day.get(day_str, 0) + entry_cost
                
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

            # Today vs Yesterday Stats
            if entry_dt:
                if dt_today_start <= entry_dt <= now:
                    today_overview["laborEntries"] += 1
                    today_overview["laborCost"] += entry_cost
                    today_overview["payableAmount"] += entry_payable
                    for emp in entry.get("employees", []):
                        name = emp.get('name', '')
                        if name:
                            today_overview["uniqueEmployees"].add(name.lower().strip())
                        today_overview["totalDeductions"] += float(emp.get("deductions", 0) or 0)
                        for wt in emp.get("workTypes", []):
                            today_overview["totalWeight"] += float(wt.get("weight", 0) or 0)
                elif dt_yesterday_start <= entry_dt <= dt_yesterday_end:
                    yesterday_summary["laborEntries"] += 1
                    yesterday_summary["laborCost"] += entry_cost
                    yesterday_summary["payableAmount"] += entry_payable
                    for emp in entry.get("employees", []):
                        name = emp.get('name', '')
                        if name:
                            yesterday_summary["uniqueEmployees"].add(name.lower().strip())
                        yesterday_summary["totalDeductions"] += float(emp.get("deductions", 0) or 0)
                        for wt in emp.get("workTypes", []):
                            yesterday_summary["totalWeight"] += float(wt.get("weight", 0) or 0)

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

        def calc_growth(today_val, yesterday_val):
            if yesterday_val == 0:
                return 100 if today_val > 0 else 0
            return round(((today_val - yesterday_val) / yesterday_val) * 100)

        stats = {
            "summary": {
                "totalLaborEntries": today_overview["laborEntries"] if filter_type == "today" else total_labor_entries,
                "totalEmployees": len(today_overview["uniqueEmployees"]) if filter_type == "today" else len(unique_employees),
                "totalLaborCost": today_overview["laborCost"] if filter_type == "today" else total_labor_cost,
                "totalPayableAmount": today_overview["payableAmount"] if filter_type == "today" else total_payable_amount,
                "growth": {
                    "entries": calc_growth(today_overview["laborEntries"], yesterday_summary["laborEntries"]),
                    "employees": calc_growth(len(today_overview["uniqueEmployees"]), len(yesterday_summary["uniqueEmployees"])),
                    "cost": calc_growth(today_overview["laborCost"], yesterday_summary["laborCost"]),
                    "payable": calc_growth(today_overview["payableAmount"], yesterday_summary["payableAmount"])
                }
            },
            "todayOverview": {
                "laborEntries": today_overview["laborEntries"],
                "totalWeight": today_overview["totalWeight"],
                "totalDeductions": today_overview["totalDeductions"],
                "payableAmount": today_overview["payableAmount"]
            },
            "workTypeData": work_type_data,
            "lineChartData": line_chart_data
        }
        
        return {"success": True, "data": stats}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
