import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import styles from '../styles/StoreRequest.module.css';

const StoreRequest = () => {
  const { data: session } = useSession();
  const [storeRequest, setStoreRequest] = useState({
    store_name: '',
    description: '',
    address: '',
    phone: '',
    store_type: ''
  });
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (session) {
      setUserRole(session.user.role); // assuming role is stored in session.user.role
    }
  }, [session]);

  const handleChange = (e) => {
    setStoreRequest({ ...storeRequest, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session) {
      setMessage('You must be logged in to submit a store request');
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/store-request/', storeRequest, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`
        }
      });
      setMessage('Store request submitted successfully');
      setHasSubmitted(true);
    } catch (error) {
      console.error('There was an error submitting the store request!', error);
      setMessage('There was an error submitting the store request');
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {userRole === 'seller' ? (
        <div className={styles.message}>You are already a seller!</div>
      ) : hasSubmitted ? (
        <div className={styles.message}>You have already submitted a store request. Status: Pending</div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <motion.div
            className={styles.inputGroup}
            whileHover={{ scale: 1.05 }}
          >
            <label>Store Name</label>
            <input
              type="text"
              name="store_name"
              value={storeRequest.store_name}
              onChange={handleChange}
              required
            />
          </motion.div>
          <motion.div
            className={styles.inputGroup}
            whileHover={{ scale: 1.05 }}
          >
            <label>Description</label>
            <textarea
              name="description"
              value={storeRequest.description}
              onChange={handleChange}
              required
            />
          </motion.div>
          <motion.div
            className={styles.inputGroup}
            whileHover={{ scale: 1.05 }}
          >
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={storeRequest.address}
              onChange={handleChange}
              required
            />
          </motion.div>
          <motion.div
            className={styles.inputGroup}
            whileHover={{ scale: 1.05 }}
          >
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={storeRequest.phone}
              onChange={handleChange}
              required
            />
          </motion.div>
          <motion.div
            className={styles.inputGroup}
            whileHover={{ scale: 1.05 }}
          >
            <label>Store Type</label>
            <select
              name="store_type"
              value={storeRequest.store_type}
              onChange={handleChange}
              required
            >
              <option value="">Select Store Type</option>
              <option value="Farm">Farm</option>
              <option value="Manufacturing">Manufacturing</option>
            </select>
          </motion.div>
          <motion.button
            type="submit"
            className={styles.submitButton}
            whileHover={{ scale: 1.1 }}
          >
            Submit Store Request
          </motion.button>
        </form>
      )}
      {message && <p className={styles.message}>{message}</p>}
    </motion.div>
  );
};

export default StoreRequest;
