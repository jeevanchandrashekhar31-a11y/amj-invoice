import React, { useState, useEffect } from 'react';
import { Trash2, PlusCircle } from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newClient, setNewClient] = useState({ name: '', address: '', gstin: '', state: 'Andhra Pradesh' });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = () => {
    try {
      const stored = localStorage.getItem('clients');
      if (stored) {
        setClients(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    if (!newClient.name) return;
    try {
      const clientWithId = { id: new Date().getTime().toString(), ...newClient };
      const updatedClients = [...clients, clientWithId];
      setClients(updatedClients);
      localStorage.setItem('clients', JSON.stringify(updatedClients));
      setNewClient({ name: '', address: '', gstin: '', state: 'Andhra Pradesh' });
    } catch (error) {
      console.error("Error adding client: ", error);
    }
  };

  const handleDeleteClient = (id) => {
    if (!window.confirm("Delete this client?")) return;
    try {
      const updatedClients = clients.filter(c => c.id !== id);
      setClients(updatedClients);
      localStorage.setItem('clients', JSON.stringify(updatedClients));
    } catch (error) {
      console.error("Error deleting client: ", error);
    }
  };

  return (
    <div className="clients-container">
      <div className="premium-card">
        <h2>Client Management</h2>
        <p className="text-muted" style={{marginBottom: '20px'}}>Manage your recurring clients for easy invoice generation.</p>

        <form onSubmit={handleAddClient} className="form-section" style={{display: 'flex', gap: '15px', alignItems: 'flex-end'}}>
          <div className="form-group" style={{margin: 0, flex: 1}}>
            <label>Name</label>
            <input type="text" className="form-control" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} required />
          </div>
          <div className="form-group" style={{margin: 0, flex: 2}}>
            <label>Address</label>
            <input type="text" className="form-control" value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value})} required />
          </div>
          <div className="form-group" style={{margin: 0, flex: 1}}>
            <label>GSTIN</label>
            <input type="text" className="form-control" value={newClient.gstin} onChange={e => setNewClient({...newClient, gstin: e.target.value})} />
          </div>
          <div className="form-group" style={{margin: 0, flex: 1}}>
            <label>State</label>
            <input type="text" className="form-control" value={newClient.state} onChange={e => setNewClient({...newClient, state: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary" style={{padding: '11px 20px', display: 'flex', gap: '8px', alignItems: 'center'}}>
            <PlusCircle size={18} /> Add Client
          </button>
        </form>

        <table className="items-table" style={{marginTop: '30px'}}>
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Address</th>
              <th>GSTIN</th>
              <th>State</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5">Loading...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No clients added yet.</td></tr>
            ) : (
              clients.map((c) => (
                <tr key={c.id}>
                  <td className="bold">{c.name}</td>
                  <td>{c.address}</td>
                  <td>{c.gstin}</td>
                  <td>{c.state}</td>
                  <td>
                    <button className="btn-icon text-danger" onClick={() => handleDeleteClient(c.id)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
