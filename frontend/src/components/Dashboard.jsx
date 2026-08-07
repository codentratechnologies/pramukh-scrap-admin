import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Users, 
  Box, 
  Menu, 
  Calendar, 
  ChevronDown,
  TrendingUp,
  ClipboardList,
  Weight,
  Banknote,
  CreditCard,
  Package,
  User,
  LogOut,
  TrendingDown,
  UsersRound,
  FileText,
  IndianRupee,
  Wallet,
  UserPlus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Label, ReferenceLine } from 'recharts';
import Loader from './Loader';
import LaborManagement from './LaborManagement';
import AddLaborEntry from './AddLaborEntry';
import ViewLaborEntry from './ViewLaborEntry';
import StockList from './StockList';
import AddStockEntry from './AddStockEntry';
import EditStockEntry from './EditStockEntry';
import ViewStockEntry from './ViewStockEntry';
import { apiFetch } from '../utils/api';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomSelect from './common/CustomSelect';
import './Dashboard.css';

// Dummy Data for Line Chart (Fallback)
const fallbackLaborCostData = [
  { name: 'No Data', cost: 0 }
];

// Dummy Data for Donut Chart (Fallback)
const fallbackWorkTypeData = [
  { name: 'No Data', value: 1, color: '#E5E7EB' }
];

const dateFilterOptions = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom Date" }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        <p className="value">₹ {payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const PieCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ padding: '8px 12px' }}>
        <p className="value" style={{ color: '#000000', fontSize: '0.95rem', margin: 0 }}>
          {payload[0].name} : {payload[0].name === 'No Data' ? '0' : payload[0].value.toLocaleString('en-IN')} Kg
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = ({ onLogout }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedLabor, setSelectedLabor] = useState(null);
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload && payload.sub) {
          setAdminEmail(payload.sub);
        }
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
  }, []);
  
  const [dateFilter, setDateFilter] = useState('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeTab, dateFilter, customStart, customEnd]);

  const fetchDashboardData = async () => {
    // If custom is selected but dates aren't filled, don't fetch yet or fetch all
    if (dateFilter === 'custom' && (!customStart || !customEnd)) {
      return; 
    }
    
    setLoadingDashboard(true);
    try {
      let query = '';
      if (dateFilter && dateFilter !== 'all') {
        query += `?filter_type=${dateFilter}`;
        if (dateFilter === 'custom' && customStart && customEnd) {
          query += `&start_date=${customStart}&end_date=${customEnd}`;
        }
      }
      const res = await apiFetch(`/dashboard/stats${query}`);
      const json = await res.json();
      if (json.success) {
        setDashboardData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const handleDashboardClick = () => {
    if (desktopSidebarExpanded) {
      setDesktopSidebarExpanded(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${mobileSidebarOpen ? 'open' : ''}`} 
        onClick={toggleMobileSidebar}
      ></div>

      {/* Sidebar */}
      <aside 
        className={`sidebar ${mobileSidebarOpen ? 'open' : ''} ${desktopSidebarExpanded ? 'expanded' : ''}`}
        onMouseEnter={() => setDesktopSidebarExpanded(true)}
        onMouseLeave={() => setDesktopSidebarExpanded(false)}
      >
        <div className="sidebar-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', overflow: 'hidden'}}>
            <img src="/logo icon.png" alt="Logo" className="logo-icon" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            <span className="logo-text" style={{ lineHeight: '1.2', marginLeft: '4px' }}>
              <span style={{ color: '#0F172A', fontSize: '1.2rem', letterSpacing: '0.5px', fontWeight: '800' }}>PRAMUKH</span><br/>
              <span style={{ color: '#16A34A', fontSize: '0.9rem', letterSpacing: '1px', fontWeight: '700' }}>SCRAP</span>
            </span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); setMobileSidebarOpen(false); }}>
            <LayoutGrid className="nav-icon" /> <span className="nav-text">Dashboard</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'labor' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('labor'); setMobileSidebarOpen(false); }}>
            <Users className="nav-icon" /> <span className="nav-text">Labor Management</span>
          </a>
          <a href="#" className={`nav-item ${activeTab === 'stock' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('stock'); setMobileSidebarOpen(false); }}>
            <Box className="nav-icon" /> <span className="nav-text">Stock Management</span>
          </a>
        </nav>
        
        <div className="sidebar-footer">
          <a href="#" className="nav-item logout-btn" onClick={(e) => { e.preventDefault(); onLogout(); }}>
            <LogOut className="nav-icon" /> <span className="nav-text">Logout</span>
          </a>
          <div className="nav-user-profile">
            <div className="avatar">
              <User size={18} />
            </div>
            <div className="user-info nav-text">
              <span className="user-name">Astik Hirpara</span>
              <span className="user-role" style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminEmail || 'Super Admin'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${desktopSidebarExpanded ? 'sidebar-expanded' : ''}`} onClick={handleDashboardClick}>
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={toggleMobileSidebar}>
              <Menu size={24} />
            </button>
            <h1 className="header-title">
              {activeTab === 'dashboard' ? 'Dashboard' : 
               activeTab === 'labor' ? 'Labor Management' : 
               activeTab === 'add-labor' ? 'Add Labor Entry' :
               activeTab === 'edit-labor' ? 'Edit Labor Entry' :
               activeTab === 'view-labor' ? 'View Labor Entry' :
               activeTab === 'stock' ? 'Stock Management' :
               activeTab === 'add-stock' ? 'Add New Stock Entry' :
               activeTab === 'edit-stock' ? 'Edit Stock Adjustment' :
               activeTab === 'view-stock' ? 'Material Profile' :
               'Dashboard'}
            </h1>
          </div>
          
          <div className="header-right">
            {/* Removed Date Selector and User Profile as per request */}
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <div className="dashboard-body">
            {/* 
            <div className="dashboard-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#FFFFFF', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '1.1rem' }}>
                Overview Performance
              </div>
              <div className="dashboard-filters" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select 
                  className="dropdown-select" 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Date</option>
                </select>
                
                {dateFilter === 'custom' && (
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <input 
                      type="date" 
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                    />
                    <span style={{color: '#64748B'}}>to</span>
                    <input 
                      type="date" 
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                    />
                  </div>
                )}
              </div>
            </div>
            */}

            {loadingDashboard ? (
              <Loader text="Loading dashboard data..." />
            ) : (
              <>
            {/* Top 4 Stat Cards */}
          <div className="stats-grid">
            {/* Total Labor Entries */}
            <div className="stat-card">
              <div className="stat-icon-wrapper light-green-bg">
                <UserPlus className="stat-icon green-icon" size={24} />
              </div>
              <div className="stat-details">
                <div className="stat-title">Total Labor Entries</div>
                <div className="stat-value">{dashboardData?.summary?.totalLaborEntries || 0}</div>
                <div className={`stat-growth ${dashboardData?.summary?.growth?.entries >= 0 ? 'positive' : 'negative'}`}>
                  {dashboardData?.summary?.growth?.entries >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{Math.abs(dashboardData?.summary?.growth?.entries || 0)}% vs yesterday</span>
                </div>
              </div>
            </div>
            
            {/* Total Employees */}
            <div className="stat-card">
              <div className="stat-icon-wrapper light-blue-bg">
                <UsersRound className="stat-icon blue-icon" size={24} />
              </div>
              <div className="stat-details">
                <div className="stat-title">Total Employees</div>
                <div className="stat-value">{dashboardData?.summary?.totalEmployees || 0}</div>
                <div className={`stat-growth ${dashboardData?.summary?.growth?.employees >= 0 ? 'positive' : 'negative'}`}>
                  {dashboardData?.summary?.growth?.employees >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{Math.abs(dashboardData?.summary?.growth?.employees || 0)}% vs yesterday</span>
                </div>
              </div>
            </div>
            
            {/* Total Labor Cost */}
            <div className="stat-card">
              <div className="stat-icon-wrapper light-orange-bg">
                <IndianRupee className="stat-icon orange-icon" size={24} />
              </div>
              <div className="stat-details">
                <div className="stat-title">Total Labor Cost</div>
                <div className="stat-value">₹ {(dashboardData?.summary?.totalLaborCost || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                <div className={`stat-growth ${dashboardData?.summary?.growth?.cost >= 0 ? 'positive' : 'negative'}`}>
                  {dashboardData?.summary?.growth?.cost >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{Math.abs(dashboardData?.summary?.growth?.cost || 0)}% vs yesterday</span>
                </div>
              </div>
            </div>
            
            {/* Total Payable Amount */}
            <div className="stat-card">
              <div className="stat-icon-wrapper light-purple-bg">
                <Wallet className="stat-icon purple-icon" size={24} />
              </div>
              <div className="stat-details">
                <div className="stat-title">Total Payable Amount</div>
                <div className="stat-value">₹ {(dashboardData?.summary?.totalPayableAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                <div className={`stat-growth ${dashboardData?.summary?.growth?.payable >= 0 ? 'positive' : 'negative'}`}>
                  {dashboardData?.summary?.growth?.payable >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{Math.abs(dashboardData?.summary?.growth?.payable || 0)}% vs yesterday</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today Overview */}
          <div className="today-overview-container">
            <h3 className="today-overview-title">Today Overview</h3>
            <div className="today-overview-grid">
              
              <div className="today-stat-item">
                <div className="stat-icon-wrapper light-green-bg">
                  <ClipboardList className="stat-icon green-icon" size={24} />
                </div>
                <div className="today-stat-info">
                  <div className="today-stat-label">Labor Entries</div>
                  <div className="today-stat-value">{dashboardData?.todayOverview?.laborEntries || 0}</div>
                  <div className="today-stat-subtitle">Today</div>
                </div>
              </div>

              <div className="today-stat-item">
                <div className="stat-icon-wrapper light-blue-bg">
                  <Weight className="stat-icon blue-icon" size={24} />
                </div>
                <div className="today-stat-info">
                  <div className="today-stat-label">Total Weight</div>
                  <div className="today-stat-value">{(dashboardData?.todayOverview?.totalWeight || 0).toLocaleString('en-IN')} Kg</div>
                  <div className="today-stat-subtitle">Today</div>
                </div>
              </div>

              <div className="today-stat-item">
                <div className="stat-icon-wrapper light-purple-bg">
                  <Banknote className="stat-icon purple-icon" size={24} />
                </div>
                <div className="today-stat-info">
                  <div className="today-stat-label">Total Deductions</div>
                  <div className="today-stat-value">₹ {(dashboardData?.todayOverview?.totalDeductions || 0).toLocaleString('en-IN')}</div>
                  <div className="today-stat-subtitle">Today</div>
                </div>
              </div>

              <div className="today-stat-item" style={{ borderRight: 'none' }}>
                <div className="stat-icon-wrapper light-green-bg">
                  <CreditCard className="stat-icon green-icon" size={24} />
                </div>
                <div className="today-stat-info">
                  <div className="today-stat-label">Payable Amount</div>
                  <div className="today-stat-value">₹ {(dashboardData?.todayOverview?.payableAmount || 0).toLocaleString('en-IN')}</div>
                  <div className="today-stat-subtitle">Today</div>
                </div>
              </div>

            </div>
          </div>

          {/* Charts Area */}
          <div className="charts-grid">
            {/* Line Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Labor Cost Overview <span>({
                  dateFilter === 'all' ? 'All Time' :
                  dateFilter === 'today' ? 'Today' :
                  dateFilter === 'week' ? 'This Week' :
                  dateFilter === 'month' ? 'This Month' : 'Custom Date'
                })</span></h3>
                <div style={{ width: '150px' }}>
                  <CustomSelect
                    name="dateFilter"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    options={dateFilterOptions}
                    className="chart-dropdown-mode"
                  />
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={(() => {
                      const data = dashboardData?.lineChartData || fallbackLaborCostData;
                      if (data.length === 1 && data[0].name !== 'No Data') {
                        // Pad single data point so line chart can render a line
                        return [
                          { name: 'Start', cost: 0 },
                          data[0],
                          { name: 'End', cost: 0 }
                        ];
                      }
                      return data;
                    })()} 
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(value) => `₹ ${value >= 1000 ? value / 1000 + 'K' : value}`}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#22C55E"
                      fillOpacity={1}
                      fill="url(#colorCost)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#22C55E', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#22C55E', stroke: '#fff', strokeWidth: 2 }}
                      label={{ fill: '#0F172A', fontSize: 10, position: 'top', formatter: (val) => `₹ ${val.toLocaleString('en-IN')}` }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="chart-header">
                <h3 className="chart-title">Work Type Distribution <span>({
                  dateFilter === 'all' ? 'All Time' :
                  dateFilter === 'today' ? 'Today' :
                  dateFilter === 'week' ? 'This Week' :
                  dateFilter === 'month' ? 'This Month' : 'Custom Date'
                })</span></h3>
              </div>
              <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', width: '100%', justifyContent: 'center' }}>
                  <div className="chart-container" style={{ flex: '0 0 250px', height: '250px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData?.workTypeData || fallbackWorkTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={90}
                          outerRadius={120}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="#ffffff"
                          strokeWidth={2}
                        >
                        {(dashboardData?.workTypeData || fallbackWorkTypeData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <Tooltip content={<PieCustomTooltip />} />
                      </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0F172A' }}>
                      {((dashboardData?.workTypeData || []).length === 1 && (dashboardData?.workTypeData || [])[0].name === 'No Data') 
                        ? '0' 
                        : ((dashboardData?.workTypeData || []).reduce((a, b) => a + b.value, 0)).toLocaleString('en-IN')} Kg
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Total Weight</div>
                  </div>
                </div>
                
                <div className="donut-legend" style={{ flex: '1 1 auto', minWidth: '120px' }}>
                  {(dashboardData?.workTypeData || []).map((item, index) => {
                    const totalW = (dashboardData?.workTypeData || []).reduce((a, b) => a + b.value, 0);
                    const pct = totalW ? Math.round((item.value / totalW) * 100) : 0;
                    return (
                    <div className="legend-item" key={index}>
                      <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                      <div className="legend-info">
                        <span className="legend-name">{item.name}</span>
                        <span className="legend-value">
                          {item.name === 'No Data' ? '0' : item.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Kg 
                          ({item.name === 'No Data' ? 0 : pct}%)
                        </span>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            </div>
          </div>
          </div>
          </>
          )}
          
          <footer className="dashboard-footer">
            © 2025 Pramukh Scrap Management System. All rights reserved.
          </footer>
          </div>
        ) : activeTab === 'labor' ? (
          <LaborManagement 
            onAddEntry={() => setActiveTab('add-labor')} 
            onEditEntry={(id) => {
              setSelectedLabor(id);
              setActiveTab('edit-labor');
            }}
            onViewEntry={(id) => {
              setSelectedLabor(id);
              setActiveTab('view-labor');
            }}
          />
        ) : activeTab === 'add-labor' || activeTab === 'edit-labor' ? (
          <AddLaborEntry onCancel={() => setActiveTab('labor')} isEditMode={activeTab === 'edit-labor'} laborId={selectedLabor} />
        ) : activeTab === 'view-labor' ? (
          <ViewLaborEntry onBack={() => setActiveTab('labor')} laborId={selectedLabor} />
        ) : activeTab === 'stock' ? (
          <StockList 
            onAddEntry={() => setActiveTab('add-stock')} 
            onEditEntry={(stock) => {
              setSelectedStock(stock);
              setActiveTab('edit-stock');
            }} 
            onViewEntry={(stock) => {
              setSelectedStock(stock);
              setActiveTab('view-stock');
            }} 
          />
        ) : activeTab === 'add-stock' ? (
          <AddStockEntry onCancel={() => setActiveTab('stock')} />
        ) : activeTab === 'edit-stock' ? (
          <EditStockEntry stock={selectedStock} onCancel={() => setActiveTab('stock')} />
        ) : activeTab === 'view-stock' ? (
          <ViewStockEntry stock={selectedStock} onBack={() => setActiveTab('stock')} />
        ) : null}
      </main>
    </div>
  );
};

export default Dashboard;
