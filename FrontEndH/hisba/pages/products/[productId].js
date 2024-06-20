import React, { useEffect, useState } from 'react';
import axiosInstance from '../../lib/axios';
import { useRouter } from 'next/router';
import { FaStar } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { BsCartPlus } from 'react-icons/bs';
import styles from '../../styles/ProductDetails.module.css';
import { useCart } from '../../context/CartContext';

const ProductDetails = () => {
  const { productId } = useRouter().query;
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();
  const { data: session } = useSession();

  useEffect(() => {
    if (productId) {
      console.log('Fetching product details for productId:', productId);
      axiosInstance.get(`http://localhost:8000/api/products/${productId}/`)
        .then(res => {
          console.log('Product data:', res.data);
          setProduct(res.data);
        })
        .catch(err => console.error('Error fetching product details:', err));
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!session || !session.user || !session.user.accessToken) {
      alert('Please log in to add products to your cart.');
      return;
    }

    try {
      await axiosInstance.post('http://localhost:8000/api/cart/', {
        product_id: productId,
        quantity: 1,
      }, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`
        }
      });

      addToCart({ ...product, quantity: 1 });
      alert('Product added to cart successfully');
    } catch (error) {
      console.error('Error adding product to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className={styles.productDetailsContainer}>
      <div className={styles.productImageContainer}>
        <img src={'http://localhost:8000/' + product.image} alt={product.name} className={styles.productImage} />
      </div>
      <div className={styles.productInfo}>
        <h1 className={styles.productName}>{product.name}</h1>
        <p className={styles.productPrice}>${product.price}</p>
        <p className={styles.productDescription}>{product.description}</p>
        <button className={styles.cartButton} onClick={handleAddToCart}><BsCartPlus /> Add to Cart</button>
        <div className={styles.sellerInfo}>
          <h2>Seller Information</h2>
          <p>{product.store.name}</p>
          <div className={styles.sellerRating}>
            {Array.from({ length: 5 }, (_, index) => (
              <FaStar key={index} color={index < Math.round(product.store.average_rating) ? '#ffc107' : '#e4e5e9'} size="20px" />
            ))}
            <span>{product.store.average_rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
