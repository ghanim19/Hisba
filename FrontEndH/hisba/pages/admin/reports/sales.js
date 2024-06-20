import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useSession } from 'next-auth/react';
import styles from '../styles/Reports.module.css';

const SalesReport = () => {
    const { data: session } = useSession();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/reports/sales/', {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`
                    }
                });
                setSales(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching sales report:', error.response ? error.response.data : error.message);
                setError('Failed to fetch sales report');
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchSales();
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
                <Typography variant="h4" gutterBottom className={styles.title}>Sales Report</Typography>
                <TableContainer component={Paper}>
                    <Table className={styles.table} aria-label="sales table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Store Name</TableCell>
                                <TableCell>Total Sales</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sales.map((sale) => (
                                <TableRow key={sale.store__name} hover>
                                    <TableCell>{sale.store__name}</TableCell>
                                    <TableCell>{sale.total_sales}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </div>
    );
};

export default SalesReport;
