import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Grid, Typography, CircularProgress, Container, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import withAuth from '../../components/withAuth';
import { useSession } from 'next-auth/react';
import styles from './styles/AdminDashboard.module.css'; // تأكد من استيراد ملف الستايل

const Dashboard = () => {
    const { data: session, status } = useSession();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentStoreRequests, setRecentStoreRequests] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!session?.user?.accessToken) {
                setError('Access token is missing');
                setLoading(false);
                return;
            }
            try {
                const [statsResponse, ordersResponse, usersResponse, storeRequestsResponse] = await Promise.all([
                    axios.get('http://localhost:8000/api/dashboard-stats/', {
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`
                        }
                    }),
                    axios.get('http://localhost:8000/api/orders/recent/', {
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`
                        }
                    }),
                    axios.get('http://localhost:8000/api/users/recent/', {
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`
                        }
                    }),
                    axios.get('http://localhost:8000/api/store-requests/recent/', {
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`
                        }
                    })
                ]);
                setStats(statsResponse.data);
                setRecentOrders(ordersResponse.data);
                setRecentUsers(usersResponse.data);
                setRecentStoreRequests(storeRequestsResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error.response ? error.response.data : error.message);
                setError('Failed to fetch dashboard data');
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchStats();
        }
    }, [session, status]);

    if (loading) {
        return <Container><CircularProgress /></Container>;
    }

    if (error) {
        return <Container><Typography variant="h6">{error}</Typography></Container>;
    }

    if (!stats) {
        return <Container><Typography variant="h6">No stats available</Typography></Container>;
    }

    const data = [
        { name: 'Users', value: stats.users_count },
        { name: 'Products', value: stats.products_count },
        { name: 'Orders', value: stats.orders_count },
        { name: 'Sales', value: stats.total_sales }
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className={styles.container}>
            <Container className={styles.container}>
                <Typography variant="h4" gutterBottom className={styles.dashboardTitle}>Dashboard</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card className={styles.dashboardCard}>
                            <CardContent>
                                <Typography variant="h5" className={styles.dashboardCardTitle}>Statistics</Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            label
                                        >
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card className={styles.dashboardCard}>
                            <CardContent>
                                <Typography variant="h5" className={styles.dashboardCardTitle}>Sales Overview</Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card className={styles.dashboardCard}>
                            <CardContent>
                                <Typography variant="h5" className={styles.dashboardCardTitle}>Recent Orders</Typography>
                                <Box>
                                    {recentOrders.map(order => (
                                        <Box key={order.id} mb={2} className={styles.dashboardItem}>
                                            <Typography variant="body1">Order #{order.id}</Typography>
                                            <Typography variant="body2">Total: ${order.total_amount}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card className={styles.dashboardCard}>
                            <CardContent>
                                <Typography variant="h5" className={styles.dashboardCardTitle}>Recent Users</Typography>
                                <Box>
                                    {recentUsers.map(user => (
                                        <Box key={user.id} mb={2} className={styles.dashboardItem}>
                                            <Typography variant="body1">{user.username}</Typography>
                                            <Typography variant="body2">Email: {user.email}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card className={styles.dashboardCard}>
                            <CardContent>
                                <Typography variant="h5" className={styles.dashboardCardTitle}>Recent Store Requests</Typography>
                                <Box>
                                    {recentStoreRequests.map(request => (
                                        <Box key={request.id} mb={2} className={styles.dashboardItem}>
                                            <Typography variant="body1">Request #{request.id}</Typography>
                                            <Typography variant="body2">Store Name: {request.store_name}</Typography>
                                            <Typography variant="body2">Status: {request.status}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
};

export default withAuth(Dashboard);
