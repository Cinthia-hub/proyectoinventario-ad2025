import React, { useState, useEffect } from 'react';
import { productService, salesService } from '../services/api';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalSales: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [productsRes, lowStockRes, salesRes] = await Promise.all([
        productService.getAll(),
        productService.getLowStock(),
        salesService.getSummary()
      ]);

      setStats({
        totalProducts: productsRes.data.length,
        lowStockProducts: lowStockRes.data.length,
        totalSales: salesRes.data.totalSales || 0,
        totalRevenue: parseFloat(salesRes.data.totalRevenue || 0).toFixed(2)
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <h1>Dashboard</h1>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total de Productos</h3>
            <div className="value">{stats.totalProducts}</div>
          </div>
          <div className="stat-card">
            <h3>Productos con Stock Bajo</h3>
            <div className="value" style={{ color: '#dc3545' }}>{stats.lowStockProducts}</div>
          </div>
          <div className="stat-card">
            <h3>Total de Ventas</h3>
            <div className="value">{stats.totalSales}</div>
          </div>
          <div className="stat-card">
            <h3>Ingresos Totales</h3>
            <div className="value">${stats.totalRevenue}</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2>Bienvenido al Sistema de Inventario y POS</h2>
          </div>
          <p>Gestiona tu inventario, proveedores, categorías y ventas desde un solo lugar.</p>
          <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
            <li>Registra productos con categorías y proveedores</li>
            <li>Controla entradas y salidas de inventario</li>
            <li>Realiza ventas desde el punto de venta</li>
            <li>Genera reportes de stock y ventas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
