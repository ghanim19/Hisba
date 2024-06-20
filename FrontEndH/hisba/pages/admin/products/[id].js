// pages/products/[id].js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Container, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import styles from '../styles/Products.module.css';
import withAuth from '../../../components/withAuth'

const ProductDetail = () => {
    const { data: session } = useSession();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteConfirmModalIsOpen, setDeleteConfirmModalIsOpen] = useState(false);
    const [newImage, setNewImage] = useState(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) {
                setError('Product ID is missing');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`http://localhost:8000/api/products/${id}/`);
                setProduct(response.data);
            } catch (error) {
                console.error('Error fetching product:', error.response ? error.response.data : error.message);
                setError(error.response ? error.response.data.detail : 'Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleUpdate = async () => {
        try {
            const formData = new FormData();
            formData.append('name', product.name);
            formData.append('description', product.description);
            formData.append('price', product.price);
            formData.append('quantity', product.quantity);
            if (newImage instanceof File) {
                formData.append('image', newImage);
            }

            await axios.patch(`http://localhost:8000/api/products/update/${id}/`, formData, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Product updated successfully');
        } catch (error) {
            console.error('Error updating product:', error.response ? error.response.data : error.message);
            setError('Failed to update product');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        setNewImage(e.target.files[0]);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/products/delete/${id}/`, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`
                }
            });
            router.push('/admin/products');
        } catch (error) {
            console.error('Error deleting product:', error.response ? error.response.data : error.message);
        } finally {
            setDeleteConfirmModalIsOpen(false);
        }
    };

    if (loading) {
        return <Container><Typography variant="h6">Loading...</Typography></Container>;
    }

    if (error) {
        return <Container><Typography variant="h6">{error}</Typography></Container>;
    }

    if (!product) {
        return <Container><Typography variant="h6">Product not found</Typography></Container>;
    }

    return (
        <div className={styles.container}>
            <Container className={styles['product-detail-container']}>
                <Button variant="contained" color="primary" onClick={() => router.back()} className={styles['back-button']}>
                    Back to Products
                </Button>
                <Card className={styles['product-detail-card']}>
                    <CardContent>
                        <Typography variant="h4" className={styles['product-detail-title']}>Product Details</Typography>
                        <TextField
                            label="Name"
                            name="name"
                            value={product.name}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={product.description}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Price"
                            name="price"
                            value={product.price}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            type="number"
                        />
                        <TextField
                            label="Quantity"
                            name="quantity"
                            value={product.quantity}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            type="number"
                        />
                        <div className={styles['image-container']}>
                            <label htmlFor="image" className={styles['upload-label']}>
                                Upload Image
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className={styles['upload-input']}
                                />
                            </label>
                            {newImage && (
                                <img
                                    src={newImage instanceof File ? URL.createObjectURL(newImage) : newImage}
                                    alt="Product Image"
                                    className={styles['product-image']}
                                />
                            )}
                        </div>
                        <Button variant="contained" color="primary" onClick={handleUpdate} className={styles['update-button']}>
                            Update Product
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => setDeleteConfirmModalIsOpen(true)} className={styles['delete-button']}>
                            Delete Product
                        </Button>
                    </CardContent>
                </Card>
                <Dialog
                    open={deleteConfirmModalIsOpen}
                    onClose={() => setDeleteConfirmModalIsOpen(false)}
                >
                    <DialogTitle>{"Delete Product"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this product? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteConfirmModalIsOpen(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} color="secondary" autoFocus>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </div>
    );
};

export default withAuth(ProductDetail);
