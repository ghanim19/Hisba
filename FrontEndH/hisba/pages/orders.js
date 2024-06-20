import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import styles from '../styles/myOrders.module.css';
import withAuth from '../components/withAuth';

const MyOrders = () => {
    const { data: session } = useSession();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        if (session) {
            axios.get('http://localhost:8000/api/orders/user/', {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            })
            .then(response => {
                setOrders(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError('Failed to load orders');
                setLoading(false);
            });
        }
    }, [session]);

    const toggleDetails = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>My Orders</h2>
            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <div className={styles.orders}>
                    {orders.map(order => (
                        <div key={order.id} className={styles.orderCard}>
                            <div className={styles.orderSummary}>
                                <h3>Order #{order.id}</h3>
                                <p><strong>Status:</strong> {order.is_store_approved && order.is_admin_approved ? 'Approved' : 'Pending'}</p>
                                <button className={styles.detailsButton} onClick={() => toggleDetails(order.id)}>
                                    {expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
                                </button>
                            </div>
                            <div className={`${styles.orderDetails} ${expandedOrderId === order.id ? styles.show : ''}`}>
                                <p><strong>Total Amount:</strong> ${order.total_amount}</p>
                                <p><strong>Delivery Fee:</strong> ${order.delivery_fee}</p>
                                <p><strong>Total with Delivery:</strong> ${order.total_with_delivery}</p>
                                <p><strong>Payment Method:</strong> {order.payment_method}</p>
                                {order.payment_method === 'visa' && (
                                    <p><strong>Visa Number:</strong> {order.visa_number}</p>
                                )}
                                <p><strong>Address:</strong> {order.address}</p>
                                <p><strong>Phone Number:</strong> {order.phone_number}</p>
                                <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                                <h4>Items:</h4>
                                <div className={styles.items}>
                                    {order.items.map(item => (
                                        <div key={item.id} className={styles.item}>
                                            <img src={item.product_image} alt={item.product_name} className={styles.productImage} />
                                            <div>
                                                <p><strong>{item.product_name}</strong></p>
                                                <p>Quantity: {item.quantity}</p>
                                                <p>Price: ${item.price}</p>
                                                <p>Seller: {item.store_name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default withAuth(MyOrders);
