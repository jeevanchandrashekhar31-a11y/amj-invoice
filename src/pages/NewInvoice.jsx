import React, { useState, useEffect } from 'react';
import { INVOICE_SETTINGS, TAX_RATES, generateInvoiceNumber } from '../config/constants';
import { PlusCircle, Trash2, Save, Printer } from 'lucide-react';
import generatePDF from '../utils/pdfGenerator';
import './NewInvoice.css';

export default function NewInvoice() {
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  
  // Consignee
  const [consignee, setConsignee] = useState({ name: '', address: '', gstin: '', state: 'Andhra Pradesh' });
  // Buyer
  const [buyer, setBuyer] = useState({ name: '', address: '', gstin: '', state: 'Andhra Pradesh' });
  const [sameAsConsignee, setSameAsConsignee] = useState(false);
  
  // Dispatch details
  const [dispatch, setDispatch] = useState({
    vehicleNo: '',
    through: 'By Road',
    docNoDate: '',
    destination: '',
    ewayBillNo: '',
    dispatchFrom: ''
  });

  // Settings
  const [taxType, setTaxType] = useState('IGST');
  const [applyTcs, setApplyTcs] = useState(false);

  // Items
  const [items, setItems] = useState([
    { desc: 'ALUMINIUM BREQUITE SCRAP', hsn: '76020090', qty: 0, unit: 'KGS', rate: 0, taxableValue: 0 }
  ]);

  useEffect(() => {
    if (sameAsConsignee) {
      setBuyer({ ...consignee });
    }
  }, [sameAsConsignee, consignee]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Auto-calculate taxable value when qty or rate changes
    if (field === 'qty' || field === 'rate') {
      const q = parseFloat(newItems[index].qty) || 0;
      const r = parseFloat(newItems[index].rate) || 0;
      newItems[index].taxableValue = (q * r).toFixed(2);
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { desc: '', hsn: '76020090', qty: 0, unit: 'KGS', rate: 0, taxableValue: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const calculateTotals = () => {
    let totalTaxableValue = 0;
    
    items.forEach(item => {
      totalTaxableValue += parseFloat(item.taxableValue) || 0;
    });

    const gst = Math.round(totalTaxableValue * 0.18);
    
    let cgst = 0, sgst = 0, igst = 0;
    if (taxType === 'IGST') {
      igst = gst;
    } else {
      cgst = Math.round(gst / 2);
      sgst = gst - cgst; // To avoid 1 rupee rounding difference
    }
    
    let invoiceTotal = totalTaxableValue + gst; 
    
    // TCS is 2% for scrap (calculated on taxable value + GST)
    const tcs = applyTcs ? Math.round(invoiceTotal * 0.02) : 0;
    invoiceTotal += tcs;
    
    return { totalTaxableValue, gst, cgst, sgst, igst, tcs, invoiceTotal };
  };

  const totals = calculateTotals();

  const handlePreview = () => {
    setPreviewLoading(true);
    try {
      let nextNum = parseInt(localStorage.getItem('invoiceCounter') || INVOICE_SETTINGS.STARTING_NUMBER);
      const invNumber = dispatch.docNoDate ? dispatch.docNoDate : generateInvoiceNumber(nextNum);
      const invoiceData = {
        id: new Date().getTime().toString(),
        invoiceNumber: invNumber,
        invoiceDate,
        dueDate,
        consignee,
        buyer,
        dispatch,
        items,
        totals,
        taxType,
        createdAt: new Date().toISOString()
      };
      const dataUri = generatePDF(invoiceData, true);
      setPreviewUrl(dataUri);
    } catch (error) {
      console.error("Preview error: ", error);
      alert("Failed to generate preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSaveAndPrint = async () => {
    setLoading(true);
    try {
      // 1. Get next invoice number from localStorage
      let nextNum = parseInt(localStorage.getItem('invoiceCounter') || INVOICE_SETTINGS.STARTING_NUMBER);
      
      // Use Doc No & Date as the invoice number if provided, else auto-generate
      const invNumber = dispatch.docNoDate ? dispatch.docNoDate : generateInvoiceNumber(nextNum);

      // 2. Build invoice data object
      const invoiceData = {
        id: new Date().getTime().toString(), // local id
        invoiceNumber: invNumber,
        invoiceDate,
        dueDate,
        consignee,
        buyer,
        dispatch,
        items,
        totals,
        taxType,
        createdAt: new Date().toISOString()
      };

      // 3. Save to localStorage
      const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      existingInvoices.push(invoiceData);
      localStorage.setItem('invoices', JSON.stringify(existingInvoices));
      
      // Update counter
      localStorage.setItem('invoiceCounter', (nextNum + 1).toString());

      // 4. Generate PDF
      generatePDF(invoiceData);
      
      alert(`Invoice ${invNumber} generated successfully!`);
    } catch (error) {
      console.error("Error generating invoice: ", error);
      alert("Failed to generate invoice. Please check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-invoice-container">
      <div className="premium-card">
        <h2>Create New Invoice</h2>
        
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label>Invoice Date</label>
              <input type="date" className="form-control" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" className="form-control" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Tax Type</label>
              <select className="form-control" value={taxType} onChange={e => setTaxType(e.target.value)}>
                <option value="IGST">IGST (Inter-state)</option>
                <option value="CGST_SGST">CGST + SGST (Intra-state)</option>
              </select>
            </div>
            <div className="form-group d-flex align-items-center" style={{marginTop: '25px', display: 'flex', alignItems: 'center'}}>
              <label style={{marginRight: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                <input type="checkbox" checked={applyTcs} onChange={e => setApplyTcs(e.target.checked)} />
                Apply TCS (2%)
              </label>
            </div>
          </div>
        </div>

        <div className="parties-grid">
          <div className="party-box">
            <h3>Consignee (Ship To)</h3>
            <div className="form-group">
              <input type="text" placeholder="Name" className="form-control" value={consignee.name} onChange={e => setConsignee({...consignee, name: e.target.value})} />
            </div>
            <div className="form-group">
              <textarea placeholder="Address" className="form-control" value={consignee.address} onChange={e => setConsignee({...consignee, address: e.target.value})} />
            </div>
            <div className="form-group">
              <input type="text" placeholder="GSTIN" className="form-control" value={consignee.gstin} onChange={e => setConsignee({...consignee, gstin: e.target.value})} />
            </div>
            <div className="form-group">
              <input type="text" placeholder="State" className="form-control" value={consignee.state} onChange={e => setConsignee({...consignee, state: e.target.value})} />
            </div>
          </div>
          
          <div className="party-box">
            <h3>
              Buyer (Bill To) 
              <label className="same-as-checkbox">
                <input type="checkbox" checked={sameAsConsignee} onChange={e => setSameAsConsignee(e.target.checked)} />
                Same as Consignee
              </label>
            </h3>
            <div className="form-group">
              <input type="text" placeholder="Name" className="form-control" value={buyer.name} onChange={e => setBuyer({...buyer, name: e.target.value})} disabled={sameAsConsignee} />
            </div>
            <div className="form-group">
              <textarea placeholder="Address" className="form-control" value={buyer.address} onChange={e => setBuyer({...buyer, address: e.target.value})} disabled={sameAsConsignee} />
            </div>
            <div className="form-group">
              <input type="text" placeholder="GSTIN" className="form-control" value={buyer.gstin} onChange={e => setBuyer({...buyer, gstin: e.target.value})} disabled={sameAsConsignee} />
            </div>
            <div className="form-group">
              <input type="text" placeholder="State" className="form-control" value={buyer.state} onChange={e => setBuyer({...buyer, state: e.target.value})} disabled={sameAsConsignee} />
            </div>
          </div>
        </div>

        <div className="form-section dispatch-section">
          <h3>Dispatch Details</h3>
          <div className="form-row">
            <input type="text" placeholder="Vehicle No." className="form-control" value={dispatch.vehicleNo} onChange={e => setDispatch({...dispatch, vehicleNo: e.target.value})} />
            <input type="text" placeholder="Dispatch Through" className="form-control" value={dispatch.through} onChange={e => setDispatch({...dispatch, through: e.target.value})} />
            <input type="text" placeholder="Doc No & Date" className="form-control" value={dispatch.docNoDate} onChange={e => setDispatch({...dispatch, docNoDate: e.target.value})} />
            <input type="text" placeholder="Dispatch From" className="form-control" value={dispatch.dispatchFrom} onChange={e => setDispatch({...dispatch, dispatchFrom: e.target.value})} />
            <input type="text" placeholder="Destination" className="form-control" value={dispatch.destination} onChange={e => setDispatch({...dispatch, destination: e.target.value})} />
            <input type="text" placeholder="E-Way Bill No." className="form-control" value={dispatch.ewayBillNo} onChange={e => setDispatch({...dispatch, ewayBillNo: e.target.value})} />
          </div>
        </div>

        <div className="form-section items-section">
          <h3>Line Items</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>HSN</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Rate (₹)</th>
                <th>Taxable Value (₹)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                return (
                  <tr key={i}>
                    <td><input type="text" className="form-control" value={item.desc} onChange={e => handleItemChange(i, 'desc', e.target.value)} /></td>
                    <td><input type="text" className="form-control" value={item.hsn} onChange={e => handleItemChange(i, 'hsn', e.target.value)} /></td>
                    <td><input type="number" className="form-control" value={item.qty} onChange={e => handleItemChange(i, 'qty', e.target.value)} /></td>
                    <td><input type="text" className="form-control" value={item.unit} onChange={e => handleItemChange(i, 'unit', e.target.value)} placeholder="e.g. KGS" style={{width: '70px'}} /></td>
                    <td><input type="number" className="form-control" value={item.rate} onChange={e => handleItemChange(i, 'rate', e.target.value)} /></td>
                    <td className="bold">₹{parseFloat(item.taxableValue || 0).toFixed(2)}</td>
                    <td>
                      <button className="btn-icon text-danger" onClick={() => removeItem(i)}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button className="btn-secondary mt-3" onClick={addItem}><PlusCircle size={18} /> Add Item</button>
        </div>

        <div className="totals-section">
          <div className="totals-box">
            <div className="total-row highlight"><span>Taxable Value:</span> <span>₹{totals.totalTaxableValue.toFixed(2)}</span></div>
            {taxType === 'IGST' ? (
              <div className="total-row"><span>IGST (18%):</span> <span>₹{totals.igst.toFixed(2)}</span></div>
            ) : (
              <>
                <div className="total-row"><span>CGST (9%):</span> <span>₹{totals.cgst.toFixed(2)}</span></div>
                <div className="total-row"><span>SGST (9%):</span> <span>₹{totals.sgst.toFixed(2)}</span></div>
              </>
            )}
            {applyTcs && (
              <div className="total-row"><span>TCS (2%):</span> <span>₹{totals.tcs.toFixed(2)}</span></div>
            )}
            <div className="total-row grand-total"><span>Invoice Total:</span> <span>₹{totals.invoiceTotal.toFixed(2)}</span></div>
          </div>
        </div>

        {previewUrl && (
          <div className="preview-section" style={{ marginTop: '30px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>Invoice Preview</h3>
              <button className="btn-secondary" onClick={() => setPreviewUrl(null)} style={{ padding: '8px 16px', background: '#e2e8f0', color: '#334155' }}>
                Close Preview
              </button>
            </div>
            <iframe 
              src={previewUrl} 
              width="100%" 
              height="700px" 
              style={{ border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              title="Invoice Preview"
            />
          </div>
        )}

        <div className="actions-bar" style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
          <button className="btn-secondary flex-btn" onClick={handlePreview} disabled={previewLoading} style={{ flex: 1, justifyContent: 'center' }}>
            {previewLoading ? 'Generating...' : '👁️ Preview Invoice'}
          </button>
          <button className="btn-primary flex-btn" onClick={handleSaveAndPrint} disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
            {loading ? 'Saving...' : <><Save size={20} /> Save & Print Invoice</>}
          </button>
        </div>
      </div>
    </div>
  );
}
