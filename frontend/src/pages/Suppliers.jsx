import React, { useState, useEffect } from 'react';
import { supplierService } from '../services/api';
import Sidebar from '../components/Sidebar';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await supplierService.getAll();
      setSuppliers(response.data);
    } catch (err) {
      setError('Error al cargar proveedores');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await supplierService.update(editingSupplier.id, formData);
      } else {
        await supplierService.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar proveedor');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      try {
        await supplierService.delete(id);
        loadSuppliers();
      } catch (err) {
        setError('Error al eliminar proveedor');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', contact: '', phone: '', email: '', address: '' });
    setEditingSupplier(null);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="card">
          <div className="card-header">
            <h2>Proveedores</h2>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              Agregar Proveedor
            </button>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Dirección</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>{supplier.name}</td>
                    <td>{supplier.contact || 'N/A'}</td>
                    <td>{supplier.phone || 'N/A'}</td>
                    <td>{supplier.email || 'N/A'}</td>
                    <td>{supplier.address || 'N/A'}</td>
                    <td>
                      <button onClick={() => handleEdit(supplier)} className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(supplier.id)} className="btn btn-danger">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{editingSupplier ? 'Editar Proveedor' : 'Agregar Proveedor'}</h2>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="close-btn">&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contacto</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Dirección</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary">Guardar</button>
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn btn-secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Suppliers;
