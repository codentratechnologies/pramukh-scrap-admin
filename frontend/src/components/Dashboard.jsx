import React, { useState } from 'react';
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
import './Dashboard.css';

// Dummy Data for Line Chart
const laborCostData = [
  { name: '15 May', cost: 85420 },
  { name: '16 May', cost: 92310 },
  { name: '17 May', cost: 78650 },
  { name: '18 May', cost: 96870 },
  { name: '19 May', cost: 112450 },
  { name: '20 May', cost: 108230 },
  { name: '21 May', cost: 124560 },
];

// Dummy Data for Donut Chart
const workTypeData = [
  { name: 'Grinding', value: 1205, color: '#22C55E' }, // Green
  { name: 'Kabadu', value: 820, color: '#3B82F6' }, // Blue
  { name: 'Patakadku', value: 425, color: '#F59E0B' }, // Orange
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
            {/* Top 4 Stat Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon green">
                <Users size={24} />
              </div>
              <div className="stat-details">
                <div className="stat-title">Total Labor Entries</div>
                <div className="stat-value">24</div>
                <div className="stat-change">
                  <TrendingUp size={14} /> 20% vs yesterday
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon blue">
                <Users size={24} />
              </div>
              <div className="stat-details">
                <div className="stat-title">Total Employees</div>
                <div className="stat-value">156</div>
                <div className="stat-change">
                  <TrendingUp size={14} /> 12% vs yesterday
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon orange">
                <span style={{fontSize: '20px', fontWeight: 'bold'}}>₹</span>
              </div>
              <div className="stat-details">
                <div className="stat-title">Total Labor Cost</div>
                <div className="stat-value">₹ 1,24,560</div>
                <div className="stat-change">
                  <TrendingUp size={14} /> 18% vs yesterday
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon purple">
                <Banknote size={24} />
              </div>
              <div className="stat-details">
                <div className="stat-title">Total Payable Amount</div>
                <div className="stat-value">₹ 1,10,340</div>
                <div className="stat-change">
                  <TrendingUp size={14} /> 15% vs yesterday
                </div>
              </div>
            </div>
          </div>

          {/* Today Overview */}
          <h2 className="section-title">Today Overview</h2>
          <div className="overview-card">
            <div className="overview-grid">
              <div className="overview-item">
                <div className="stat-icon green">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <div className="stat-title">Labor Entries</div>
                  <div className="stat-value">5</div>
                  <div className="stat-sub">Today</div>
                </div>
              </div>
              
              <div className="overview-item">
                <div className="stat-icon blue">
                  <Package size={20} />
                </div>
                <div>
                  <div className="stat-title">Total Weight</div>
                  <div className="stat-value">2,450 Kg</div>
                  <div className="stat-sub">Today</div>
                </div>
              </div>
              
              <div className="overview-item">
                <div className="stat-icon purple">
                  <CreditCard size={20} />
                </div>
                <div>
                  <div className="stat-title">Total Deductions</div>
                  <div className="stat-value">₹ 4,230</div>
                  <div className="stat-sub">Today</div>
                </div>
              </div>
              
              <div className="overview-item">
                <div className="stat-icon green">
                  <Banknote size={20} />
                </div>
                <div>
                  <div className="stat-title">Payable Amount</div>
                  <div className="stat-value">₹ 45,670</div>
                  <div className="stat-sub">Today</div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Area */}
          <div className="charts-grid">
            {/* Line Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Labor Cost Overview <span>(This Week)</span></h3>
                <select className="dropdown-select">
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={laborCostData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
                <h3 className="chart-title">Work Type Distribution <span>(Today)</span></h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                <div className="chart-container" style={{ flex: '1 1 250px', height: '220px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={workTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {workTypeData.map((entry, index) => (
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
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0F172A' }}>2,450 Kg</div>
                    <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Total Weight</div>
                  </div>
                </div>
                
                <div className="donut-legend" style={{ flex: '1 1 200px' }}>
                  {workTypeData.map((item, index) => (
                    <div className="legend-item" key={index}>
                      <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                      <div className="legend-info">
                        <span className="legend-name">{item.name}</span>
                        <span className="legend-value">{item.value.toLocaleString()} Kg ({Math.round((item.value / 2450) * 100)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <footer className="dashboard-footer">
            © 2025 Pramukh Scrap Management System. All rights reserved.
          </footer>
          </div>
        ) : activeTab === 'labor' ? (
          <LaborManagement 
            onAddEntry={() => setActiveTab('add-labor')} 
            onEditEntry={() => setActiveTab('edit-labor')}
            onViewEntry={() => setActiveTab('view-labor')}
          />
        ) : activeTab === 'add-labor' || activeTab === 'edit-labor' ? (
          <AddLaborEntry onCancel={() => setActiveTab('labor')} isEditMode={activeTab === 'edit-labor'} />
        ) : activeTab === 'view-labor' ? (
          <ViewLaborEntry onBack={() => setActiveTab('labor')} />
        ) : activeTab === 'stock' ? (
          <StockList onAddEntry={() => setActiveTab('add-stock')} onEditEntry={() => setActiveTab('edit-stock')} onViewEntry={() => setActiveTab('view-stock')} />
        ) : activeTab === 'add-stock' ? (
          <AddStockEntry onCancel={() => setActiveTab('stock')} />
        ) : activeTab === 'edit-stock' ? (
          <EditStockEntry onCancel={() => setActiveTab('stock')} />
        ) : activeTab === 'view-stock' ? (
          <ViewStockEntry onBack={() => setActiveTab('stock')} />
        ) : null}
      </main>
    </div>
  );
};

export default Dashboard;
