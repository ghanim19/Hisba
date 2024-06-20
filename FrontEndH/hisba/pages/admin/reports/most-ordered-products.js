import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useSession } from 'next-auth/react';
import styles from '../styles/Reports.module.css';

const MostOrderedProductsReport = () => {
    const { data: session } = useSession();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMostOrderedProducts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/reports/most-ordered-products/', {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`
                    }
                });
                setProducts(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching most ordered products report:', error.response ? error.response.data : error.message);
                setError('Failed to fetch most ordered products report');
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchMostOrderedProducts();
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
                <Typography variant="h4" gutterBottom className={styles.title}>Most Ordered Products Report</Typography>
                <TableContainer component={Paper}>
                    <Table className={styles.table} aria-label="most ordered products table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Order Count</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id} hover>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.order_count}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </div>
    );
};

export default MostOrderedProductsReport;
