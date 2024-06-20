import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useSession } from 'next-auth/react';
import styles from '../styles/Reports.module.css';

const UserActivityReport = () => {
    const { data: session } = useSession();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserActivity = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/reports/user-activity/', {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`
                    }
                });
                setUsers(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user activity report:', error.response ? error.response.data : error.message);
                setError('Failed to fetch user activity report');
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchUserActivity();
        }
    }, [session?.user]);

    if (loading) {
        return <Container><Typography variant="h6">Loading...</Typography></Container>;
    }

    if (error) {
        return <Container><Typography variant="h6">{error}</Typography></Container>;
    }

    return (
        <div className={styles.container}>
            <Container>
                <Typography variant="h4" gutterBottom className={styles.title}>User Activity Report</Typography>
                <TableContainer component={Paper}>
                    <Table className={styles.table} aria-label="user activity table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Username</TableCell>
                                <TableCell>Order Count</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.order_count}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </div>
    );
};

export default UserActivityReport;
