import React, { useEffect, useState } from 'react';
import axiosInstance from '../lib/axios';
import { BsCartPlus } from 'react-icons/bs';
import styles from '../styles/MostOrderedProducts.module.css';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const MostOrderedProducts = () => {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get('/products/');
        const approvedProducts = response.data.filter(product => product.is_approved);
        const sortedProducts = approvedProducts.sort((a, b) => b.order_count - a.order_count);
        const topProducts = sortedProducts.slice(0, 4);
        setProducts(topProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = async (productId, quantity) => {
    if (!session || !session.user || !session.user.accessToken) {
      alert('Please log in to add products to your cart.');
      return;
    }

    try {
      const response = await axiosInstance.post('/cart/', {
        product_id: productId,
        quantity: quantity,
      }, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`
        }
      });

      alert('Product added to cart successfully');
    } catch (error) {
      console.error('Error adding product to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  const handleAddToCart = (productId, productQuantity, availableQuantity) => {
    if (productQuantity >= availableQuantity) {
      alert('Cannot add more than available quantity');
      return;
    }
    addToCart(productId, 1);
  };

  return (
    <div className={styles.container}>
      <h2>Most Ordered Products</h2>
      <div className={styles.cardsContainer}>
        {products.map(product => (
          <div key={product.id} className={styles.card}>
            <img src={product.image} alt={product.name} className={styles.image} />
            <div className={styles.info}>
              <h3 className={styles.productName}>{product.name}</h3>
              {product.store && <p className={styles.productStore}>{product.store.name}</p>}
              <p className={styles.productQuantity}>Available Quantity: {product.quantity}</p>
              <p className={styles.productPrice}>Price: ${product.price}</p>
              <button 
                className={styles.cartButton} 
                onClick={() => handleAddToCart(product.id, 1, product.quantity)}
              >
                <BsCartPlus /> Add to Cart
              </button>
              <Link href={`/products/${product.id}`} passHref>
                <button className={styles.detailsButton}>
                  View Details
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.viewMoreContainer}>
        <Link href="/products" passHref>
          <button className={styles.viewMoreButton}>
            View More Products
          </button>
        </Link>
      </div>
    </div>
  );
};

export default MostOrderedProducts;

