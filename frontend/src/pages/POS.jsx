import React, { useState, useEffect } from 'react';
import { productService, salesService } from '../services/api';
import Sidebar from '../components/Sidebar';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data.filter(p => p.stock > 0));
    } catch (err) {
      setError('Error al cargar productos');
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        setError(`Stock insuficiente para ${product.name}`);
        return;
      }
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        maxStock: product.stock
      }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    const item = cart.find(i => i.productId === productId);
    if (quantity > item.maxStock) {
      setError('Cantidad excede el stock disponible');
      return;
    }
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: parseInt(quantity) }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    try {
      setError('');
      const saleData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        paymentMethod,
        notes
      };

      await salesService.create(saleData);
      setSuccess('Venta realizada exitosamente');
      setCart([]);
      setNotes('');
      loadProducts();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la venta');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <h1>Punto de Venta (POS)</h1>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          {/* Products Section */}
          <div className="card">
            <div className="card-header">
              <h2>Productos</h2>
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Buscar productos por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '1rem',
              maxHeight: '500px',
              overflowY: 'auto'
            }}>
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => addToCart(product)}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                  <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>{product.code}</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#667eea' }}>
                    ${parseFloat(product.price).toFixed(2)}
                  </p>
                  <p style={{ fontSize: '0.9rem' }}>Stock: {product.stock}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="card">
            <div className="card-header">
              <h2>Carrito</h2>
            </div>
            
            {cart.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6c757d' }}>El carrito está vacío</p>
            ) : (
              <>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {cart.map((item) => (
                    <div key={item.productId} style={{
                      borderBottom: '1px solid #eee',
                      padding: '0.5rem 0',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong>{item.name}</strong>
                        <button 
                          onClick={() => removeFromCart(item.productId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, e.target.value)}
                          min="1"
                          max={item.maxStock}
                          style={{ width: '60px', padding: '0.25rem' }}
                        />
                        <span>× ${parseFloat(item.price).toFixed(2)}</span>
                        <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #2c3e50' }}>
                  <h3 style={{ textAlign: 'right', fontSize: '1.5rem' }}>
                    Total: ${calculateTotal().toFixed(2)}
                  </h3>
                </div>

                <div className="form-group">
                  <label>Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notas (opcional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleCheckout} className="btn btn-success btn-block">
                    Procesar Venta
                  </button>
                  <button onClick={() => setCart([])} className="btn btn-danger">
                    Limpiar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
