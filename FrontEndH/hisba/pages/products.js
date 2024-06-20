import React, { useEffect, useState } from 'react';
import axiosInstance from '../lib/axios';
import Link from 'next/link';
import styles from '../styles/Products.module.css';
import { FaStar } from 'react-icons/fa';  // إضافة الاستيراد

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get('/products/');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const addToCart = async (productId) => {
    // Implement the addToCart functionality here
    console.log('Add to cart', productId);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>All Products</h2>
      <div className={styles.filters}>
        <input 
          type="text"
          placeholder="Search by product name"
          value={searchTerm}
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.cardsContainer}>
        {currentProducts.map(product => (
          <div key={product.id} className={styles.card}>
            <img src={product.image || '/default-product.png'} alt={product.name} className={styles.image} />
            <div className={styles.info}>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productPrice}>Price: ${product.price}</p>
              
              <div>
                <Link href={`/products/${product.id}`} passHref legacyBehavior>
                  <button className={styles.viewButton}>View Product</button>
                </Link>
                <button 
                  className={styles.addToCartButton} 
                  onClick={() => addToCart(product.id)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.pagination}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            className={index + 1 === currentPage ? styles.activePage : styles.pageButton}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Products;
