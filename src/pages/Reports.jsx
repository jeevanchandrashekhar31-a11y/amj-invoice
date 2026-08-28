import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, FileText } from 'lucide-react';

export default function Reports() {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const stored = localStorage.getItem('invoices');
    if (stored) {
      setInvoices(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    // Filter invoices by selected month and year
    const filtered = invoices.filter(inv => {
      if (!inv.invoiceDate) return false;
      const d = new Date(inv.invoiceDate);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
    setFilteredInvoices(filtered);
  }, [invoices, selectedMonth, selectedYear]);

  // Calculate totals
  const metrics = filteredInvoices.reduce((acc, inv) => {
    const t = inv.totals || {};
    acc.revenue += parseFloat(t.invoiceTotal || 0);
    acc.taxable += parseFloat(t.totalTaxableValue || 0);
    acc.cgst += parseFloat(t.cgst || 0);
    acc.sgst += parseFloat(t.sgst || 0);
    acc.igst += (parseFloat(t.igst) || parseFloat(t.gst) || 0); // fallback for older structure
    acc.tcs += parseFloat(t.tcs || 0);
    return acc;
  }, { revenue: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, tcs: 0 });

  const totalGst = metrics.cgst + metrics.sgst + metrics.igst;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="reports-container">
      <div className="premium-card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px'}}>
          <div>
            <h2>Financial Reports</h2>
            <p className="text-muted" style={{margin: 0}}>Track revenue, GST, and TCS collections.</p>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <select className="form-control" style={{width: 'auto', margin: 0}} value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
              {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select className="form-control" style={{width: 'auto', margin: 0}} value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px'}}>
          <MetricCard title="Total Revenue" amount={metrics.revenue} icon={TrendingUp} color="#3b82f6" />
          <MetricCard title="Taxable Value" amount={metrics.taxable} icon={DollarSign} color="#10b981" />
          <MetricCard title="Total GST Payable" amount={totalGst} icon={BarChart3} color="#f59e0b" />
          <MetricCard title="Total TCS Collected" amount={metrics.tcs} icon={FileText} color="#8b5cf6" />
        </div>

        <h3>Tax Breakdown</h3>
        <table className="items-table" style={{marginTop: '15px'}}>
          <thead>
            <tr>
              <th>Tax Component</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>CGST</td><td>₹{metrics.cgst.toFixed(2)}</td></tr>
            <tr><td>SGST</td><td>₹{metrics.sgst.toFixed(2)}</td></tr>
            <tr><td>IGST</td><td>₹{metrics.igst.toFixed(2)}</td></tr>
            <tr className="bold"><td>Total GST</td><td>₹{totalGst.toFixed(2)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ title, amount, icon: Icon, color }) {
  return (
    <div style={{
      backgroundColor: '#f8fafc',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    }}>
      <div style={{backgroundColor: `${color}20`, padding: '12px', borderRadius: '50%', color: color, display: 'flex'}}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '4px', fontWeight: '500'}}>{title}</p>
        <h3 style={{margin: 0, fontSize: '1.4rem', color: '#1e293b'}}>₹{amount.toFixed(2)}</h3>
      </div>
    </div>
  );
}
