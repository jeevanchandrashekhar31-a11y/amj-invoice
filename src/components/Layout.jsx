import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, Users, LayoutDashboard, PlusCircle } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/invoices/new', label: 'New Invoice', icon: PlusCircle },
    { path: '/clients', label: 'Clients', icon: Users },
  ];

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-placeholder">
            <span className="logo-text">AMJ</span>
          </div>
          <h2>AMJ Admin</h2>
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
              >
                <Icon size={20} />
                <span>{item.label}</span>
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
