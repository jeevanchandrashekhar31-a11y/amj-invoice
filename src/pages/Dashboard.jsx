import React, { useState, useEffect } from 'react';
import generatePDF from '../utils/pdfGenerator';
import { Printer } from 'lucide-react';

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = () => {
    try {
      const stored = localStorage.getItem('invoices');
      if (stored) {
        const data = JSON.parse(stored);
        // Sort descending by createdAt
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setInvoices(data);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReprint = (invoiceData) => {
    generatePDF(invoiceData);
  };

  return (
    <div className="dashboard-container">
      <div className="premium-card">
        <h2>Invoice History</h2>
        <p className="text-muted" style={{marginBottom: '20px'}}>View and reprint generated invoices.</p>
        
        {loading ? (
          <p>Loading invoices...</p>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Date</th>
                <th>Client (Consignee)</th>
                <th>Taxable Value</th>
                <th>Total Value</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No invoices found.</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="bold">{inv.invoiceNumber}</td>
                    <td>{inv.invoiceDate}</td>
                    <td>{inv.consignee?.name || 'Unknown'}</td>
                    <td>₹{inv.totals?.totalTaxableValue?.toFixed(2)}</td>
                    <td className="bold">₹{inv.totals?.invoiceTotal?.toFixed(2)}</td>
                    <td>
                      <button 
                        className="btn-secondary" 
                        onClick={() => handleReprint(inv)}
                        style={{padding: '6px 12px', fontSize: '0.85rem'}}
                      >
                        <Printer size={16} /> Reprint
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
