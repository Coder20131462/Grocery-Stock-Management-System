import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    categories: 0,
    totalValue: 0
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [productsResponse, lowStockResponse, categoriesResponse] = await Promise.all([
        productAPI.getAll(),
        productAPI.getLowStock(),
        productAPI.getCategories()
      ]);

      const products = productsResponse.data;
      const lowStock = lowStockResponse.data;
      const categories = categoriesResponse.data;

      const totalValue = products.reduce((sum, product) => {
        return sum + (product.price * product.quantity);
      }, 0);

      setStats({
        totalProducts: products.length,
        lowStockProducts: lowStock.length,
        categories: categories.length,
        totalValue: totalValue
      });

      setLowStockItems(lowStock.slice(0, 5));
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error('Failed to fetch dashboard data');
      }
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!user) {
    return (
      <div className="error">
        <h3>Please log in to access the dashboard</h3>
        <p>You need to be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.categories}</div>
          <div className="stat-label">Categories</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">${stats.totalValue.toFixed(2)}</div>
          <div className="stat-label">Total Inventory Value</div>
        </div>
        
        <div className="stat-card low-stock-card">
          <div className="stat-number">{stats.lowStockProducts}</div>
          <div className="stat-label">Low Stock Alert</div>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginTop: '2rem' }}>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>⚠️ Low Stock Alerts</h2>
          <div className="products-grid">
            {lowStockItems.map(product => (
              <div key={product.id} className="product-card" style={{ borderLeft: '4px solid #dc3545' }}>
                <div className="product-name">{product.name}</div>
                <div className="product-category">{product.category}</div>
                <div className="product-details">
                  <div>Current Stock: <span className="low-stock">{product.quantity} {product.unit}</span></div>
                  <div>Min Level: {product.minStockLevel} {product.unit}</div>
                  <div>Price: <span className="product-price">${product.price}</span></div>
                  <div>Supplier: {product.supplier}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/products" className="btn btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <Link to="/products" className="btn btn-primary">
          View All Products
        </Link>
        {isAdmin() && (
          <Link to="/products/new" className="btn btn-success">
            Add New Product
          </Link>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 