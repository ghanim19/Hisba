import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaStar, FaCartPlus, FaRegEye } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from '../../styles/StorePage.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const StorePage = () => {
  const { storeId } = useRouter().query;
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (storeId) {
      axios.get(`http://localhost:8000/api/stores/${storeId}`)
        .then(res => {
          setStore(res.data);
          axios.get(`http://localhost:8000/api/products/?store=${storeId}`)
            .then(res => setProducts(res.data));
          axios.get(`http://localhost:8000/api/ratings/?store_id=${storeId}`)
            .then(res => setRatings(res.data));
        })
        .catch(err => console.error('Error fetching store details:', err));
    }
  }, [storeId]);

  const handleRatingChange = (value) => {
    setRating(value);
  };

  const submitReview = () => {
    const reviewData = {
      store_id: storeId,
      value: rating,
      comment: comment,
      weight: 1.0
    };
    const config = {
      headers: {
        Authorization: `Bearer ${session?.user?.accessToken}`,
      }
    };
    axios.post(`http://localhost:8000/api/ratings/create/`, reviewData, config)
      .then(response => {
        setRatings([...ratings, response.data]);
        setComment('');
        setRating(0);
        alert('Review submitted successfully!');
      })
      .catch(err => {
        console.error('Error submitting review:', err);
        alert('Failed to submit review.');
      });
  };

  const addToCart = async (productId) => {
    if (!session || !session.user || !session.user.accessToken) {
      alert('Please log in to add products to your cart.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/cart/', {
        product_id: productId,
        quantity: 1,
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

  const displayedRatings = showAllReviews ? ratings : ratings.slice(0, 2);

  return (
    <div className={styles.storeContainer}>
      <motion.div 
        className={styles.storeHeader}
        style={{ backgroundImage: `url(${store?.cover_image || '/default-store.png'})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div className={styles.coverContent}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.h1 
            className={styles.storeName}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, type: 'spring', stiffness: 100 }}
          >
            {store?.name}'s {store?.store_type}
            
            </motion.h1>

          <p className={styles.storeType}>{store?.store_type}</p>
          <p className={styles.storeType}>Address: {store?.address}</p>
          <p className={styles.storePhone}>Phone: {store?.phone}</p>
          <div className={styles.headerRating}>
            {Array.from({ length: 5 }, (_, index) => (
              <FaStar key={index} color={index < Math.round(store?.average_rating) ? '#ffc107' : '#e4e5e9'} size="20px" />
            ))}
            <span className={styles.ratingValue}>{store?.average_rating.toFixed(1)}</span>
          </div>
        </motion.div>
      </motion.div>
      <div className={styles.productsContainer}>
        {products.map(product => (
          <div key={product.id} className={styles.productCard}>
            <img src={product.image} alt={product.name} className={styles.productImage} />
            <div className={styles.productDetails}>
              <h3>{product.name}</h3>
              <div className={styles.productPriceTag}>
                <span className={styles.productPrice}>{`$${product.price}`}</span>
              </div>
              <div className={styles.productActions}>
                <button className={styles.addButton} onClick={() => addToCart(product.id)}>
                  <FaCartPlus /> Add to Cart
                </button>
                <Link href={`/products/${product.id}`} legacyBehavior>
                  <a className={styles.detailsLink}>
                    <FaRegEye /> View Details
                  </a>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.commentSection}>
        <div className={styles.feedbackContainer}>
          <h2 className={styles.feedbackHeader}>Customer Feedback</h2>
          {displayedRatings.map(rating => (
            <div key={rating.id} className={styles.ratingDisplay}>
              <div className={styles.ratingStars}>
                {Array.from({ length: 5 }, (_, index) => (
                  <FaStar key={index} color={index < rating.value ? '#ffc107' : '#e4e5e9'} />
                ))}
              </div>
              <p>{rating.comment}</p>
              <p>By: {rating.user.username}</p>
            </div>
          ))}
          {ratings.length > 2 && (
            <button onClick={() => setShowAllReviews(!showAllReviews)} className={styles.showMoreButton}>
              {showAllReviews ? 'Show Less' : 'Show More'}
            </button>
          )}
          <div className={styles.ratingStars}>
            {[...Array(5)].map((_, index) => (
              <label key={index}>
                <input
                  type="radio"
                  value={index + 1}
                  checked={rating === index + 1}
                  onChange={() => handleRatingChange(index + 1)}
                />
                <FaStar className={styles.feedbackStar} color={index < rating ? '#ffc107' : '#e4e5e9'} />
              </label>
            ))}
          </div>
          <textarea
            className={styles.inputField}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <button className={styles.submitButton} onClick={submitReview}>Submit</button>
        </div> 
      </div> 
    </div>
  );
};

export default StorePage;
