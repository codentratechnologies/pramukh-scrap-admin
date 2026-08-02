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
  User
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import LaborManagement from './LaborManagement';
import AddLaborEntry from './AddLaborEntry';
import ViewLaborEntry from './ViewLaborEntry';
import StockList from './StockList';
import AddStockEntry from './AddStockEntry';
import EditStockEntry from './EditStockEntry';
import ViewStockEntry from './ViewStockEntry';
import { apiFetch } from '../utils/api';
import './Dashboard.css';

// Dummy Data for Line Chart (Fallback)
const fallbackLaborCostData = [
  { name: 'No Data', cost: 0 }
];

// Dummy Data for Donut Chart (Fallback)
const fallbackWorkTypeData = [
  { name: 'No Data', value: 1, color: '#E5E7EB' }
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

const Dashboard = ({ onLogout }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedLabor, setSelectedLabor] = useState(null);
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  
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
          <div className="nav-user-profile">
            <div className="avatar">
              <User size={18} />
            </div>
            <div className="user-info nav-text">
              <span className="user-name">Admin</span>
              <span className="user-role">Super Admin</span>
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

            {loadingDashboard ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard data...</div>
            ) : (
              <>
            {/* Top 4 Stat Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon green">
                <Users size={24} />
              </div>
              <div className="stat-details">
                <div className="stat-title">Total Labor Entries</div>
                <div className="stat-value">{dashboardData?.summary?.totalLaborEntries || 0}</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon blue">
                <Users size={24} />
              </div>
              <div className="stat-details">
                <div className="stat-title">Total Employees</div>
                <div className="stat-value">{dashboardData?.summary?.totalEmployees || 0}</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon orange">
                <span style={{fontSize: '20px', fontWeight: 'bold'}}>₹</span>
              </div>
              <div className="stat-details">
                <div className="stat-title">Total Labor Cost</div>
                <div className="stat-value">₹ {(dashboardData?.summary?.totalLaborCost || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon purple">
                <Banknote size={24} />
              </div>
              <div className="stat-details">
                <div className="stat-title">Total Payable Amount</div>
                <div className="stat-value">₹ {(dashboardData?.summary?.totalPayableAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
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
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
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
                    <Line 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#22C55E" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#22C55E', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#22C55E' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Work Type Distribution <span>({
                  dateFilter === 'all' ? 'All Time' :
                  dateFilter === 'today' ? 'Today' :
                  dateFilter === 'week' ? 'This Week' :
                  dateFilter === 'month' ? 'This Month' : 'Custom Date'
                })</span></h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                <div className="chart-container" style={{ flex: '1 1 250px', height: '220px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData?.workTypeData || fallbackWorkTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {(dashboardData?.workTypeData || fallbackWorkTypeData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
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
                      {((dashboardData?.workTypeData || []).reduce((a, b) => a + b.value, 0)).toLocaleString('en-IN')} Kg
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Total Weight</div>
                  </div>
                </div>
                
                <div className="donut-legend" style={{ flex: '1 1 200px' }}>
                  {(dashboardData?.workTypeData || []).map((item, index) => {
                    const totalW = (dashboardData?.workTypeData || []).reduce((a, b) => a + b.value, 0);
                    const pct = totalW ? Math.round((item.value / totalW) * 100) : 0;
                    return (
                    <div className="legend-item" key={index}>
                      <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                      <div className="legend-info">
                        <span className="legend-name">{item.name}</span>
                        <span className="legend-value">{item.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Kg ({pct}%)</span>
                      </div>
                    </div>
                  )})}
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
