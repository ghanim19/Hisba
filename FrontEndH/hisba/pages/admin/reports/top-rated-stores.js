import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useSession } from 'next-auth/react';
import styles from '../styles/Reports.module.css';
import withAuth from '../../../components/withAuth'

const TopRatedStoresReport = () => {
    const { data: session } = useSession();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTopRatedStores = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/reports/top-rated-stores/', {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`
                    }
                });
                setStores(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching top-rated stores report:', error.response ? error.response.data : error.message);
                setError('Failed to fetch top-rated stores report');
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchTopRatedStores();
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
                <Typography variant="h4" gutterBottom className={styles.title}>Top Rated Stores Report</Typography>
                <TableContainer component={Paper}>
                    <Table className={styles.table} aria-label="top rated stores table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Store Name</TableCell>
                                <TableCell>Rating</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stores.map((store) => (
                                <TableRow key={store.id} hover>
                                    <TableCell>{store.name}</TableCell>
                                    <TableCell>{store.average_rating}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </div>
    );
};

export default TopRatedStoresReport;
