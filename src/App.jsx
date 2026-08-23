import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/items';

export default function App() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location_rack: '',
    quantity: '',
    min_quantity: '2',
    unit: 'pcs',
    selling_price: '',
    cost_price: '',
    image: null,
  });

  useEffect(() => {
    fetchItems();
  }, [search]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_URL}?search=${search}`);
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      location_rack: '',
      quantity: '',
      min_quantity: '2',
      unit: 'pcs',
      selling_price: '',
      cost_price: '',
      image: null,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      category: item.category || '',
      location_rack: item.location_rack || '',
      quantity: item.quantity || '',
      min_quantity: item.min_quantity || '2',
      unit: item.unit || 'pcs',
      selling_price: item.selling_price || '',
      cost_price: item.cost_price || '',
      image: null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location_rack) {
      alert('⚠️ Item Name aur Rack Location zaroori hai!');
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('location_rack', formData.location_rack);
    data.append('quantity', formData.quantity);
    data.append('min_quantity', formData.min_quantity);
    data.append('unit', formData.unit);
    data.append('selling_price', formData.selling_price);
    data.append('cost_price', formData.cost_price);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('⚡ Success! Item updated successfully.');
      } else {
        await axios.post(API_URL, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('⚡ Success! Item added successfully.');
      }
      resetForm();
      fetchItems();
    } catch (err) {
      console.error('Save error:', err);
      alert('❌ Failed to save item. Check backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Kya aap is item ko hamesha ke liye delete karna chahte hain?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchItems();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const totalItems = items.length;
  const lowStockAlerts = items.filter((item) => item.isLowStock).length;
  const totalCategories = [...new Set(items.map((i) => i.category || 'General'))].length;

  return (
    <div style={styles.appContainer}>
      <style>{`
        .custom-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .custom-card:hover { transform: translateY(-6px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
        .btn-glow { transition: all 0.3s ease; }
        .btn-glow:hover { filter: brightness(1.2); box-shadow: 0 0 15px rgba(99, 102, 241, 0.6); }
        .input-focus:focus { outline: none; border-color: #818cf8 !important; box-shadow: 0 0 10px rgba(129, 140, 248, 0.3); }
      `}</style>

      {/* Header */}
      <header style={styles.navbar}>
        <div style={styles.logoGroup}>
          <div style={styles.logoIcon}>⚡</div>
          <div>
            <h1 style={styles.brandTitle}>INVENTORY NEXUS</h1>
            <p style={styles.brandSubtitle}>Smart Rack & Location Manager</p>
          </div>
        </div>
        <button
          className="btn-glow"
          style={showForm ? styles.closeBtn : styles.addBtn}
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
        >
          {showForm ? '✖ Close Form' : '⚡ + Add New Stock Item'}
        </button>
      </header>

      <main style={styles.mainContent}>
        {/* Analytics Cards */}
        <section style={styles.metricsGrid}>
          <div className="custom-card" style={styles.metricCardBox1}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>TOTAL STOCK ITEMS</span>
              <span style={styles.metricBadge1}>Active</span>
            </div>
            <div style={styles.metricBody}>
              <h2 style={styles.metricValue}>{totalItems}</h2>
              <span style={styles.metricIcon}>📦</span>
            </div>
          </div>

          <div className="custom-card" style={{
            ...styles.metricCardBox2,
            boxShadow: lowStockAlerts > 0 ? '0 0 20px rgba(225, 29, 72, 0.4)' : 'none'
          }}>
            <div style={styles.metricHeader}>
              <span style={{ ...styles.metricLabel, color: '#fecdd3' }}>LOW STOCK ALERTS</span>
              <span style={styles.metricBadge2}>{lowStockAlerts > 0 ? 'Action Needed' : 'Normal'}</span>
            </div>
            <div style={styles.metricBody}>
              <h2 style={{ ...styles.metricValue, color: '#ffffff' }}>{lowStockAlerts}</h2>
              <span style={styles.metricIcon}>🚨</span>
            </div>
          </div>

          <div className="custom-card" style={styles.metricCardBox3}>
            <div style={styles.metricHeader}>
              <span style={{ ...styles.metricLabel, color: '#a7f3d0' }}>CATEGORIES</span>
              <span style={styles.metricBadge3}>Organized</span>
            </div>
            <div style={styles.metricBody}>
              <h2 style={{ ...styles.metricValue, color: '#ffffff' }}>{totalCategories}</h2>
              <span style={styles.metricIcon}>🏷️</span>
            </div>
          </div>
        </section>

        {/* Add/Edit Form */}
        {showForm && (
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>
                {editingId ? '✏️ Edit Stock Item Details' : '✨ Add New Inventory Item'}
              </h3>
              <p style={styles.formSubtitle}>Update quantity, name, image or rack location</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Item Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="input-focus"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Display Combo, Screwdriver"
                    required
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Category</label>
                  <input
                    type="text"
                    name="category"
                    className="input-focus"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g. Mobile Parts, Tools"
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Rack / Box Location *</label>
                  <input
                    type="text"
                    name="location_rack"
                    className="input-focus"
                    value={formData.location_rack}
                    onChange={handleInputChange}
                    placeholder="e.g. Box-A2, Rack-3"
                    required
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    className="input-focus"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Low Stock Alert Level</label>
                  <input
                    type="number"
                    name="min_quantity"
                    className="input-focus"
                    value={formData.min_quantity}
                    onChange={handleInputChange}
                    placeholder="2"
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Product Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={styles.fileInput}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-glow"
                  style={{
                    ...styles.submitBtn,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    background: editingId ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  }}
                >
                  {loading ? '⏳ Saving...' : editingId ? '🔄 Update Item' : '💾 Save Item to Rack'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={styles.cancelBtn}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className="input-focus"
            placeholder="Search parts by name, category, or rack location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Items Grid */}
        <div style={styles.itemsGrid}>
          {items.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📂</div>
              <h3 style={{ color: '#f8fafc', margin: '0 0 8px 0' }}>No Stock Items Found</h3>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Click "+ Add New Stock Item" above to add your first item.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="custom-card" style={styles.itemCard}>
                <div style={styles.cardImageWrapper}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={styles.cardImage} />
                  ) : (
                    <div style={styles.noImagePlaceholder}>📷 No Image Attached</div>
                  )}
                  <span style={styles.categoryPill}>{item.category || 'General'}</span>
                </div>

                <div style={styles.cardContent}>
                  <h4 style={styles.itemName}>{item.name}</h4>

                  <div style={styles.rackBadge}>
                    <span>📍 Location:</span>
                    <strong style={{ color: '#38bdf8' }}>{item.location_rack}</strong>
                  </div>

                  <div style={styles.stockRow}>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Current Stock:</span>
                    <span style={{
                      ...styles.stockStatusBadge,
                      backgroundColor: item.isLowStock ? 'rgba(225, 29, 72, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: item.isLowStock ? '#fb7185' : '#34d399',
                      border: item.isLowStock ? '1px solid #e11d48' : '1px solid #10b981'
                    }}>
                      {item.quantity} {item.unit} {item.isLowStock ? '⚠️ LOW' : '✓'}
                    </span>
                  </div>

                  {/* Action Buttons Row: Edit & Delete */}
                  <div style={styles.actionButtonsRow}>
                    <button
                      onClick={() => handleEditClick(item)}
                      style={styles.editBtn}
                    >
                      ✏️ Edit Item
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={styles.deleteBtn}
                    >
                      🗑️ Delete Item
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  appContainer: {
    backgroundColor: '#0b0f19',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#f8fafc',
    paddingBottom: '60px',
  },
  navbar: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '16px 36px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '14px' },
  logoIcon: {
    fontSize: '22px',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    padding: '10px 14px',
    borderRadius: '12px',
    boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
  },
  brandTitle: { margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '1px', color: '#ffffff' },
  brandSubtitle: { margin: 0, fontSize: '12px', color: '#94a3b8' },
  addBtn: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '12px 22px',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
  },
  closeBtn: {
    backgroundColor: '#334155',
    color: '#f8fafc',
    border: 'none',
    padding: '12px 22px',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
  },
  mainContent: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' },
  metricCardBox1: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    border: '1px solid #0284c7',
    borderRadius: '16px',
    padding: '20px',
  },
  metricCardBox2: {
    background: 'linear-gradient(135deg, #881337 0%, #4c0519 100%)',
    border: '1px solid #f43f5e',
    borderRadius: '16px',
    padding: '20px',
  },
  metricCardBox3: {
    background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
    border: '1px solid #10b981',
    borderRadius: '16px',
    padding: '20px',
  },
  metricHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  metricLabel: { fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', color: '#38bdf8' },
  metricBadge1: { backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' },
  metricBadge2: { backgroundColor: 'rgba(244, 63, 94, 0.3)', color: '#fecdd3', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' },
  metricBadge3: { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' },
  metricBody: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  metricValue: { fontSize: '36px', fontWeight: '900', margin: 0, color: '#f8fafc' },
  metricIcon: { fontSize: '32px' },

  formCard: {
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '28px',
    marginBottom: '32px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  formHeader: { marginBottom: '24px' },
  formTitle: { margin: '0 0 6px 0', fontSize: '20px', fontWeight: '700', color: '#f8fafc' },
  formSubtitle: { margin: 0, fontSize: '13px', color: '#94a3b8' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '24px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  fileInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    border: '1px dashed #475569',
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    fontSize: '13px',
    boxSizing: 'border-box',
  },
  submitBtn: {
    flex: 1,
    color: '#ffffff',
    padding: '14px',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '800',
    fontSize: '15px',
  },
  cancelBtn: {
    backgroundColor: '#334155',
    color: '#f8fafc',
    border: 'none',
    padding: '14px 20px',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  searchContainer: { position: 'relative', marginBottom: '32px' },
  searchIcon: { position: 'absolute', left: '18px', top: '15px', fontSize: '18px', color: '#64748b' },
  searchInput: {
    width: '100%',
    padding: '14px 20px 14px 50px',
    borderRadius: '14px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    fontSize: '15px',
    boxSizing: 'border-box',
  },

  itemsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
  itemCard: {
    backgroundColor: '#1e293b',
    borderRadius: '18px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  cardImageWrapper: { position: 'relative', height: '170px', backgroundColor: '#0f172a' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  noImagePlaceholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', fontSize: '14px' },
  categoryPill: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#a855f7',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    backdropFilter: 'blur(8px)',
  },
  cardContent: { padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 },
  itemName: { margin: 0, fontSize: '17px', fontWeight: '700', color: '#f8fafc' },
  rackBadge: {
    backgroundColor: '#0f172a',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    display: 'flex',
    justifyContent: 'space-between',
    border: '1px solid #334155',
  },
  stockRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  stockStatusBadge: { padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' },
  actionButtonsRow: { display: 'flex', gap: '8px', marginTop: 'auto' },
  editBtn: {
    flex: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: 'rgba(225, 29, 72, 0.15)',
    color: '#fb7185',
    border: '1px solid rgba(225, 29, 72, 0.3)',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
  },
  emptyCard: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#1e293b',
    borderRadius: '20px',
    border: '2px dashed #334155',
  },
};