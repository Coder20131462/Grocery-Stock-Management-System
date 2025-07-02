import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleStockUpdate = async (id, currentQuantity) => {
    const newQuantity = prompt('Enter new stock quantity:', currentQuantity);
    if (newQuantity !== null && !isNaN(newQuantity)) {
      try {
        await productAPI.updateStock(id, parseInt(newQuantity));
        toast.success('Stock updated successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to update stock');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div>
      <div className="products-header">
        <h1 className="products-title">Products</h1>
        <div className="products-actions">
          <input
            type="text"
            placeholder="Search products..."
            className="search-box"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {isAdmin() && (
            <Link to="/products/new" className="btn btn-success">
              Add Product
            </Link>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Try adjusting your search criteria or add some products.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-name">{product.name}</div>
              <div className="product-category">{product.category}</div>
              <div className="product-description">{product.description}</div>
              
              <div className="product-details">
                <div>Price: <span className="product-price">${product.price}</span></div>
                <div>Stock: <span className={product.quantity <= product.minStockLevel ? 'low-stock' : 'product-stock'}>
                  {product.quantity} {product.unit}
                </span></div>
                <div>Min Level: {product.minStockLevel} {product.unit}</div>
                <div>Supplier: {product.supplier}</div>
              </div>

              {product.quantity <= product.minStockLevel && (
                <div style={{ color: '#dc3545', fontWeight: 'bold', marginTop: '0.5rem' }}>
                  ⚠️ Low Stock Alert!
                </div>
              )}

              {isAdmin() && (
                <div className="product-actions">
                  <Link 
                    to={`/products/edit/${product.id}`} 
                    className="btn btn-sm btn-warning"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleStockUpdate(product.id, product.quantity)}
                    className="btn btn-sm btn-secondary"
                  >
                    Update Stock
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList; 