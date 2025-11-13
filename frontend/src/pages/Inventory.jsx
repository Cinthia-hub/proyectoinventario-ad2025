import React, { useState, useEffect } from 'react';
import { inventoryService, productService } from '../services/api';
import Sidebar from '../components/Sidebar';

const Inventory = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    type: 'entry',
    quantity: '',
    reason: '',
    notes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [movementsRes, productsRes] = await Promise.all([
        inventoryService.getAll(),
        productService.getAll()
      ]);
      setMovements(movementsRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError('Error al cargar datos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.create(formData);
      setShowModal(false);
      setFormData({ productId: '', type: 'entry', quantity: '', reason: '', notes: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear movimiento');
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="card">
          <div className="card-header">
            <h2>Movimientos de Inventario</h2>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              Nuevo Movimiento
            </button>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Razón</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{new Date(movement.createdAt).toLocaleString()}</td>
                    <td>{movement.product?.name || 'N/A'}</td>
                    <td>
                      <span style={{
                        color: movement.type === 'entry' ? 'green' : 'red',
                        fontWeight: 'bold'
                      }}>
                        {movement.type === 'entry' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td>{movement.quantity}</td>
                    <td>{movement.reason || 'N/A'}</td>
                    <td>{movement.user?.username || 'N/A'}</td>
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
                <h2>Nuevo Movimiento de Inventario</h2>
                <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Producto</label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Stock: {product.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="entry">Entrada</option>
                    <option value="exit">Salida</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cantidad</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Razón</label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary">Guardar</button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
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

export default Inventory;
