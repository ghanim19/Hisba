import React, { useEffect, useState } from 'react';
import axiosInstance from '../lib/axios';
import { FaStar } from 'react-icons/fa';
import Link from 'next/link';
import styles from '../styles/TopRatedStores.module.css';

const TopRatedStores = () => {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axiosInstance.get('/stores/');
        const approvedStores = response.data.filter(store => store.is_approved);
        const sortedStores = approvedStores.sort((a, b) => b.average_rating - a.average_rating);
        const topStores = sortedStores.slice(0, 4);
        setStores(topStores);
      } catch (error) {
        console.error('Error fetching top-rated stores:', error);
      }
    };

    fetchStores();
  }, []);

  return (
    <div className={styles.container}>
      <h2>Top Rated Stores</h2>
      <div className={styles.cardsContainer}>
        {stores.map(store => (
          <div key={store.id} className={styles.card}>
            <img src={store.cover_image || '/default-store.png' } alt={store.name} className={styles.image} />
            <div className={styles.info}>
              <h3>{store.name}</h3>
              <p>{store.address}</p>
              <p>Phone: {store.phone}</p>
              <div className={styles.rating}>
                {Array.from({ length: 5 }, (_, index) => (
                  <FaStar key={index} color={index < Math.round(store.average_rating || 0) ? '#ffc107' : '#e4e5e9'} />
                ))}
              </div>
              <Link href={`/store/${store.id}`} legacyBehavior>
                <a className={styles.storeButton}>Visit Store</a>
              </Link>
            </div>
          </div>
        ))}
      </div>
      <Link href="/stores" legacyBehavior>
        <a className={styles.viewMoreButton}>View More Stores</a>
      </Link>
    </div>
  );
};

export default TopRatedStores;
