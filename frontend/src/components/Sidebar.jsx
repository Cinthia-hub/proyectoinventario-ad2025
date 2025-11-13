import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <h2>Inventario POS</h2>
      <nav>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/products">Productos</Link></li>
          <li><Link to="/categories">Categorías</Link></li>
          <li><Link to="/suppliers">Proveedores</Link></li>
          <li><Link to="/inventory">Movimientos</Link></li>
          <li><Link to="/sales">Ventas</Link></li>
          <li><Link to="/pos">Punto de Venta</Link></li>
        </ul>
      </nav>
      <div style={{ padding: '1rem', marginTop: 'auto', borderTop: '1px solid #2c3e50' }}>
        <p style={{ marginBottom: '0.5rem' }}>Usuario: {user?.username}</p>
        <button onClick={handleLogout} className="btn btn-secondary btn-block">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
