// pages/SellerOrders.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import styles from '../styles/SellerOrders.module.css';

const SellerOrders = () => {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (session) {
      axios.get('http://localhost:8000/api/orders/seller/', {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`
        }
      })
      .then(response => {
        setOrders(response.data);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
      });
    }
  }, [session]);

  const approveOrder = (orderId) => {
    axios.post(`http://localhost:8000/api/orders/approve/${orderId}/`, {}, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`
      }
    })
    .then(response => {
      setMessage('Order approved successfully');
      setOrders(orders.map(order => order.id === orderId ? { ...order, is_store_approved: true } : order));
    })
    .catch(error => {
      console.error('Error approving order:', error);
      setMessage('There was an error approving the order');
    });
  };

  const toggleOrderDetails = (order) => {
    if (selectedOrder && selectedOrder.id === order.id) {
      setSelectedOrder(null);
    } else {
      setSelectedOrder(order);
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
      <h1>Received Orders</h1>
      {message && <p className={styles.message}>{message}</p>}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total Amount</th>
            <th>Delivery Fee</th>
            <th>Total with Delivery</th>
            <th>Approval Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <React.Fragment key={order.id}>
              <tr>
                <td>{order.id}</td>
                <td>
                  {order.user.profile && order.user.profile.profile_image ? (
                    <img src={order.user.profile.profile_image} alt={order.user.username} className={styles.profileImage} />
                  ) : (
                    <img src="/default_profile_image.png" alt={order.user.username} className={styles.profileImage} />
                  )}
                  {order.user.username}
                </td>
                <td>{order.total_amount}</td>
                <td>{order.delivery_fee}</td>
                <td>{order.total_with_delivery}</td>
                <td>{order.is_store_approved ? 'Approved' : 'Pending'}</td>
                <td>
                  {!order.is_store_approved && (
                    <button className={styles.approveButton} onClick={() => approveOrder(order.id)}>Approve</button>
                  )}
                  <button className={styles.detailsButton} onClick={() => toggleOrderDetails(order)}>
                    {selectedOrder && selectedOrder.id === order.id ? 'Hide Details' : 'View Details'}
                  </button>
                </td>
              </tr>
              {selectedOrder && selectedOrder.id === order.id && (
                <motion.tr
                  className={styles.orderDetails}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.5 }}
                >
                  <td colSpan="7">
                    <div className={styles.detailsContent}>
                      <p><strong>Customer:</strong> {order.user.username}</p>
                      <p><strong>Address:</strong> {order.address}</p>
                      <p><strong>Phone Number:</strong> {order.phone_number}</p>
                      <h3>Items:</h3>
                      <ul>
                        {order.items.map(item => (
                          <li key={item.id} className={styles.orderItem}>
                            <img src={item.product_image} alt={item.product_name} className={styles.productImage} />
                            <span>{item.product_name}</span>
                            <span>Quantity: {item.quantity}</span>
                            <span>Price: {item.price}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </td>
                </motion.tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default SellerOrders;
