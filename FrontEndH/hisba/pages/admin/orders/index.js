// pages/orders/index.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import styles from '../styles/Orders.module.css';
import withAuth from '../../../components/withAuth'

const Orders = () => {
    const { data: session } = useSession();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/adminorders/', {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`
                    }
                });
                setOrders(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching orders:', error.response ? error.response.data : error.message);
                setError('Failed to fetch orders');
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchOrders();
        }
    }, [session?.user]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleApproveOrder = async (orderId) => {
        try {
            await axios.post(`http://localhost:8000/api/orders/approve/${orderId}/`, {}, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`
                }
            });
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, is_admin_approved: true } : order
            ));
        } catch (error) {
            console.error('Error approving order:', error.response ? error.response.data : error.message);
        }
    };

    const filteredOrders = orders.filter(order => 
        order.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <Container><Typography variant="h6">Loading...</Typography></Container>;
    }

    if (error) {
        return <Container><Typography variant="h6">{error}</Typography></Container>;
    }

    return (
        <div className={styles.container}>
            <Container>
                <Typography variant="h4" gutterBottom className={styles['orders-title']}>Orders</Typography>
                <TextField
                    label="Search Orders"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    fullWidth
                    margin="normal"
                />
                <TableContainer component={Paper}>
                    <Table className={styles['orders-table']} aria-label="orders table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Store</TableCell>
                                <TableCell>Total Amount</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell>Admin Approved</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredOrders.map(order => (
                                <TableRow key={order.id} hover>
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>{order.user.username}</TableCell>
                                    <TableCell>{order.store.name}</TableCell>
                                    <TableCell>{order.total_amount}</TableCell>
                                    <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                                    <TableCell>{order.is_admin_approved ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            className={styles['view-button']}
                                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                                        >
                                            View
                                        </Button>
                                        {!order.is_admin_approved && (
                                            <Button 
                                                variant="contained" 
                                                color="secondary" 
                                                className={styles['approve-button']}
                                                onClick={() => handleApproveOrder(order.id)}
                                            >
                                                Approve
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </div>
    );
};

export default withAuth(Orders);
