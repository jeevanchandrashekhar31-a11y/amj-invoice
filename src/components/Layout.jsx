import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, Users, LayoutDashboard, PlusCircle, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/invoices/new', label: 'New Invoice', icon: PlusCircle },
    { path: '/clients', label: 'Clients', icon: Users },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="layout-container">
      <aside className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-branding">
            <div className="logo-placeholder">
              <span className="logo-text">AMJ</span>
            </div>
            {isSidebarOpen && <h2>AMJ Admin</h2>}
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar} title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}>
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={!isSidebarOpen ? item.label : ''}
              >
                <Icon size={20} />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
