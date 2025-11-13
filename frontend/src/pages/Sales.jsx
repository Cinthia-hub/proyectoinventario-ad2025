import React, { useState, useEffect } from 'react';
import { salesService } from '../services/api';
import Sidebar from '../components/Sidebar';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const response = await salesService.getAll();
      setSales(response.data);
    } catch (err) {
      setError('Error al cargar ventas');
    }
  };

  const viewSaleDetails = async (saleId) => {
    try {
      const response = await salesService.getById(saleId);
      setSelectedSale(response.data);
      setShowModal(true);
    } catch (err) {
      setError('Error al cargar detalles de venta');
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="card">
          <div className="card-header">
            <h2>Ventas</h2>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Método de Pago</th>
                  <th>Usuario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.id}</td>
                    <td>{new Date(sale.createdAt).toLocaleString()}</td>
                    <td>${parseFloat(sale.total).toFixed(2)}</td>
                    <td>
                      {sale.paymentMethod === 'cash' ? 'Efectivo' :
                       sale.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}
                    </td>
                    <td>{sale.user?.username || 'N/A'}</td>
                    <td>
                      <button onClick={() => viewSaleDetails(sale.id)} className="btn btn-secondary">
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && selectedSale && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Detalles de Venta #{selectedSale.id}</h2>
                <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
              </div>
              <div>
                <p><strong>Fecha:</strong> {new Date(selectedSale.createdAt).toLocaleString()}</p>
                <p><strong>Usuario:</strong> {selectedSale.user?.username}</p>
                <p><strong>Método de Pago:</strong> {selectedSale.paymentMethod}</p>
                {selectedSale.notes && <p><strong>Notas:</strong> {selectedSale.notes}</p>}
                
                <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Productos</h3>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unitario</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.product?.name}</td>
                        <td>{item.quantity}</td>
                        <td>${parseFloat(item.unitPrice).toFixed(2)}</td>
                        <td>${parseFloat(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <h3 style={{ marginTop: '1rem', textAlign: 'right' }}>
                  Total: ${parseFloat(selectedSale.total).toFixed(2)}
                </h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
