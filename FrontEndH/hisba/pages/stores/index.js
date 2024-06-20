import React, { useState, useEffect } from 'react';
import axiosInstance from '../../lib/axios';
import Link from 'next/link';
import styles from '../../styles/Stores.module.css';
import { FaStar } from 'react-icons/fa';

const Stores = ({ storesData }) => {
  const [stores, setStores] = useState(storesData);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const storesPerPage = 6;

  useEffect(() => {
    const uniqueCategories = [...new Set(storesData.map(store => store.store_type))];
    setCategories(uniqueCategories);
  }, [storesData]);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredStores = storesData.filter(store => {
    return (selectedCategory ? store.store_type === selectedCategory : true) &&
           (searchTerm ? store.address.toLowerCase().includes(searchTerm.toLowerCase()) : true);
  });

  const indexOfLastStore = currentPage * storesPerPage;
  const indexOfFirstStore = indexOfLastStore - storesPerPage;
  const currentStores = filteredStores.slice(indexOfFirstStore, indexOfLastStore);

  const totalPages = Math.ceil(filteredStores.length / storesPerPage);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>All Stores</h2>
      <div className={styles.filters}>
        <select value={selectedCategory} onChange={handleCategoryChange} className={styles.select}>
          <option value="">All Categories</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>
        <input 
          type="text" 
          placeholder="Search by address" 
          value={searchTerm} 
          onChange={handleSearchChange} 
          className={styles.searchInput}
        />
      </div>
      <div className={styles.cardsContainer}>
        {currentStores.map(store => (
          <div key={store.id} className={styles.card}>
            <img src={store.cover_image || '/default-store.png'} alt={store.name} className={styles.image} />
            <div className={styles.info}>
              <h3 className={styles.storeName}>{store.name}</h3>
              <p className={styles.storeAddress}>{store.address}</p>
              <div className={styles.rating}>
                {Array.from({ length: 5 }, (_, index) => (
                  <FaStar key={index} color={index < Math.round(store.average_rating || 0) ? '#ffc107' : '#e4e5e9'} />
                ))}
              </div>
              <Link href={`/store/${store.id}`} passHref>
                <button className={styles.viewButton}>View Store</button>
              </Link>
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

export async function getServerSideProps() {
  try {
    const response = await axiosInstance.get('/stores/');
    return {
      props: {
        storesData: response.data,
      },
    };
  } catch (error) {
    console.error('Error fetching stores:', error);
    return {
      props: {
        storesData: [],
      },
    };
  }
}

export default Stores;
