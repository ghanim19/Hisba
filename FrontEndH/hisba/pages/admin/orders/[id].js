// pages/orders/[id].js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import styles from '../styles/OrderDetail.module.css';
import withAuth from '../../../components/withAuth'

const OrderDetail = () => {
    const { data: session } = useSession();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) {
                setError('Order ID is missing');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`http://localhost:8000/api/orders/${id}/`, {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`
                    }
                });
                setOrder(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching order:', error.response ? error.response.data : error.message);
                setError('Failed to fetch order');
                setLoading(false);
            }
        };

        if (id && session?.user) {
            fetchOrder();
        }
    }, [id, session?.user]);

    const handleApproveOrder = async () => {
        try {
            await axios.post(`http://localhost:8000/api/orders/approve/${id}/`, {}, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`
                }
            });
            setOrder({ ...order, is_admin_approved: true });
        } catch (error) {
            console.error('Error approving order:', error.response ? error.response.data : error.message);
        }
    };

    if (loading) {
        return <Container><Typography variant="h6">Loading...</Typography></Container>;
    }

    if (error) {
        return <Container><Typography variant="h6">{error}</Typography></Container>;
    }

    if (!order) {
        return <Container><Typography variant="h6">Order not found</Typography></Container>;
    }

    return (
        <div className={styles.container}>
            <Container className={styles['order-detail-container']}>
                <Button variant="contained" color="primary" onClick={() => router.back()} className={styles['back-button']}>
                    Back to Orders
                </Button>
                <Card className={styles['order-detail-card']}>
                    <CardContent>
                        <Typography variant="h4" className={styles['order-detail-title']}>Order Details</Typography>
                        <Typography variant="body1"><strong>User:</strong> {order.user.username}</Typography>
                        <Typography variant="body1"><strong>Store:</strong> {order.store.name}</Typography>
                        <Typography variant="body1"><strong>Total Amount:</strong> {order.total_amount}</Typography>
                        <Typography variant="body1"><strong>Delivery Fee:</strong> {order.delivery_fee}</Typography>
                        <Typography variant="body1"><strong>Total with Delivery:</strong> {order.total_with_delivery}</Typography>
                        <Typography variant="body1"><strong>Address:</strong> {order.address}</Typography>
                        <Typography variant="body1"><strong>Phone Number:</strong> {order.phone_number}</Typography>
                        <Typography variant="body1"><strong>Payment Method:</strong> {order.payment_method}</Typography>
                        <Typography variant="body1"><strong>Visa Number:</strong> {order.visa_number}</Typography>
                        <Typography variant="body1"><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</Typography>
                        <Typography variant="body1"><strong>Admin Approved:</strong> {order.is_admin_approved ? 'Yes' : 'No'}</Typography>
                        <Typography variant="body1"><strong>Store Approved:</strong> {order.is_store_approved ? 'Yes' : 'No'}</Typography>
                        {order.is_admin_approved || (
                            <Button variant="contained" color="primary" onClick={handleApproveOrder} className={styles['approve-button']}>
                                Approve Order
                            </Button>
                        )}
                        <Typography variant="h5" className={styles['order-detail-title']}>Items</Typography>
                        <Grid container spacing={3}>
                            {order.items.map(item => (
                                <Grid item xs={12} sm={6} md={4} key={item.id}>
                                    <Card className={styles['item-card']}>
                                        <CardContent>
                                            <Typography variant="h6">{item.product_name}</Typography>
                                            <img src={item.product_image} alt={item.product_name} className={styles['item-image']} />
                                            <Typography variant="body2">{item.quantity} x {item.price}</Typography>
                                            <Typography variant="body2">    Seller: {item.store_name}</Typography>
                                            <Typography variant="body2">Total: {item.total_price}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            </Container>
        </div>
    );
};

export default withAuth(OrderDetail);
