// pages/products/index.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import styles from '../styles/Products.module.css';
import withAuth from '../../../components/withAuth'

const Products = () => {
    const { data: session } = useSession();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/products/');
                setProducts(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error.response ? error.response.data : error.message);
                setError('Failed to fetch products');
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (productId) => {
        try {
            await axios.delete(`http://localhost:8000/api/products/delete/${productId}/`, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`
                }
            });
            setProducts(products.filter(product => product.id !== productId));
        } catch (error) {
            console.error('Error deleting product:', error.response ? error.response.data : error.message);
        }
    };

    if (loading) {
        return <Container><Typography variant="h6">Loading...</Typography></Container>;
    }

    if (error) {
        return <Container><Typography variant="h6">{error}</Typography></Container>;
    }

    return (
        <div className={styles.container}>
            <Container>
                <Typography variant="h4" gutterBottom className={styles['product-detail-title']}>Products</Typography>
                <TextField
                    label="Search Products"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    fullWidth
                    margin="normal"
                />
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => router.push('/admin/products/create')}
                    className={styles['create-button']}
                >
                    Create New Product
                </Button>
                <TableContainer component={Paper}>
                    <Table className={styles['products-table']} aria-label="products table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProducts.map(product => (
                                <TableRow key={product.id} hover>
                                    <TableCell>{product.id}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.description}</TableCell>
                                    <TableCell>{product.price}</TableCell>
                                    <TableCell>{product.quantity}</TableCell>
                                    <TableCell>
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            className={styles['edit-button']}
                                            onClick={() => router.push(`/admin/products/${product.id}`)}
                                        >
                                            View
                                        </Button>
                                        <Button 
                                            variant="contained" 
                                            color="secondary" 
                                            className={styles['delete-button']}
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            Delete
                                        </Button>
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

export default withAuth(Products);
