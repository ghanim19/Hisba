// pages/stores/[id].js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Container, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid } from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import styles from '../styles/StoreDetail.module.css';  // Adjusted the import path
import withAuth from '../../../components/withAuth'

const StoreDetail = () => {
    const { data: session } = useSession();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteConfirmModalIsOpen, setDeleteConfirmModalIsOpen] = useState(false);
    const [productDeleteConfirmModalIsOpen, setProductDeleteConfirmModalIsOpen] = useState(false);
    const [commentDeleteConfirmModalIsOpen, setCommentDeleteConfirmModalIsOpen] = useState(false);
    const [coverConfirmModalIsOpen, setCoverConfirmModalIsOpen] = useState(false);
    const [storeEditModalIsOpen, setStoreEditModalIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newCoverImage, setNewCoverImage] = useState(null);
    const [editingStore, setEditingStore] = useState({
        name: '',
        address: '',
        phone: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleRatings, setVisibleRatings] = useState(3);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [selectedRatingId, setSelectedRatingId] = useState(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const fetchStore = async () => {
            if (!id) {
                setError('Store ID is missing');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`http://localhost:8000/api/stores/${id}/`);
                setStore(response.data);
                setNewCoverImage(response.data.cover_image);
                const productsResponse = await axios.get(`http://localhost:8000/api/products/?store=${id}`);
                setProducts(productsResponse.data);
                const ratingsResponse = await axios.get(`http://localhost:8000/api/ratings/?store_id=${id}`);
                setRatings(ratingsResponse.data);
            } catch (error) {
                console.error('Error fetching store:', error.response ? error.response.data : error.message);
                setError(error.response ? error.response.data.detail : 'Failed to fetch store');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchStore();
        }
    }, [id]);

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/stores/delete/${id}/`, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`
                }
            });
            router.push('/admin/stores');
        } catch (error) {
            console.error('Error deleting store:', error.response ? error.response.data : error.message);
        } finally {
            setDeleteConfirmModalIsOpen(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const formData = new FormData();
            formData.append('name', store.name);
            formData.append('store_type', store.store_type);
            formData.append('address', store.address);
            formData.append('phone', store.phone);
            formData.append('average_rating', store.average_rating);
            if (newCoverImage instanceof File) {
                formData.append('cover_image', newCoverImage);
            }

            await axios.patch(`http://localhost:8000/api/stores/update/${id}/`, formData, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Store updated successfully');
        } catch (error) {
            console.error('Error updating store:', error.response ? error.response.data : error.message);
            setError('Failed to update store');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStore(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        setNewCoverImage(e.target.files[0]);
    };

    const handleProductDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/products/delete/${selectedProductId}/`, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`
                }
            });
            setProducts(products.filter(product => product.id !== selectedProductId));
            setProductDeleteConfirmModalIsOpen(false);
        } catch (error) {
            console.error('Error deleting product:', error.response ? error.response.data : error.message);
        }
    };

    const handleProductEdit = (product) => {
        setEditingProduct(product);
        setEditOpen(true);
    };

    const handleProductInputChange = (e) => {
        const { name, value } = e.target;
        setEditingProduct(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleProductUpdate = async () => {
        try {
            const formData = new FormData();
            formData.append('name', editingProduct.name);
            formData.append('description', editingProduct.description);
            formData.append('price', editingProduct.price);
            formData.append('quantity', editingProduct.quantity);
            if (editingProduct.image instanceof File) {
                formData.append('image', editingProduct.image);
            }

            const response = await axios.patch(`http://localhost:8000/api/products/update/${editingProduct.id}/`, formData, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProducts(products.map(product => product.id === editingProduct.id ? response.data : product));
            setEditingProduct(null);
            setEditOpen(false);
        } catch (error) {
            console.error('Error updating product:', error.response ? error.response.data : error.message);
        }
    };

    const handleCommentDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/ratings/delete/${selectedRatingId}/`, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`
                }
            });
            setRatings(ratings.filter(rating => rating.id !== selectedRatingId));
            setCommentDeleteConfirmModalIsOpen(false);
        } catch (error) {
            console.error('Error deleting comment:', error.response ? error.response.data : error.message);
        }
    };

    const filteredRatings = ratings.filter(rating =>
        (rating.comment?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        rating.user.username?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleLoadMore = () => {
        setVisibleRatings(visibleRatings + 3);
    };

    if (loading) {
        return <Container><Typography variant="h6">Loading...</Typography></Container>;
    }

    if (error) {
        return <Container><Typography variant="h6">{error}</Typography></Container>;
    }

    if (!store) {
        return <Container><Typography variant="h6">Store not found</Typography></Container>;
    }

    return (
        <div className={styles.container}>
            <Container className={styles['store-detail-container']}>
                <Button variant="contained" color="primary" onClick={() => router.back()} className={styles['back-button']}>
                    Back to Stores
                </Button>
                <Card className={styles['store-detail-card']}>
                    <CardContent>
                        <Typography variant="h4" className={styles['store-detail-title']}>Store Details</Typography>
                        <TextField
                            label="Name"
                            name="name"
                            value={store.name}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Type"
                            name="store_type"
                            value={store.store_type}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Address"
                            name="address"
                            value={store.address}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Phone"
                            name="phone"
                            value={store.phone}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Average Rating"
                            name="average_rating"
                            value={store.average_rating}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            type="number"
                        />
                        <div className={styles['image-container']}>
                            <label htmlFor="coverImage" className={styles['upload-label']}>
                                Upload Cover Image
                                <input
                                    type="file"
                                    id="coverImage"
                                    name="coverImage"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className={styles['upload-input']}
                                />
                            </label>
                            {newCoverImage && (
                                <img
                                    src={newCoverImage instanceof File ? URL.createObjectURL(newCoverImage) : newCoverImage}
                                    alt="Cover Image"
                                    className={styles['cover-image']}
                                />
                            )}
                        </div>
                        <Button variant="contained" color="primary" onClick={handleUpdate} className={styles['update-button']}>
                            Update Store
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => setDeleteConfirmModalIsOpen(true)} className={styles['delete-button']}>
                            Delete Store
                        </Button>
                    </CardContent>
                </Card>
                <Typography variant="h5" className={styles['store-detail-title']}>Products</Typography>
                <Grid container spacing={3}>
                    {products.map(product => (
                        <Grid item xs={12} sm={6} md={4} key={product.id}>
                            <Card className={styles['product-card']}>
                                <CardContent>
                                    <Typography variant="h5">{product.name}</Typography>
                                    <img src={product.image} alt={product.name} className={styles['product-image']} />
                                    <Typography variant="body2">{product.description}</Typography>
                                    <Typography variant="body2">Price: ${product.price}</Typography>
                                    <Button variant="contained" color="primary" onClick={() => handleProductEdit(product)} className={styles['edit-button']}>
                                        Edit
                                    </Button>
                                    <Button variant="contained" color="secondary" onClick={() => {
                                        setSelectedProductId(product.id);
                                        setProductDeleteConfirmModalIsOpen(true);
                                    }} className={styles['delete-button']}>
                                        Delete
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <Typography variant="h5" className={styles['store-detail-title']}>Ratings and Comments</Typography>
                <TextField
                    label="Search Comments"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                {filteredRatings.slice(0, visibleRatings).map(rating => (
                    <Card key={rating.id} className={styles['comment-card']}>
                        <CardContent>
                            <Typography variant="body1"><strong>{rating.user.username}:</strong> {rating.value} stars</Typography>
                            <Typography variant="body2">{rating.comment}</Typography>
                            <Typography variant="body2" color="textSecondary">{new Date(rating.created_at).toLocaleString()}</Typography>
                            <Button variant="contained" color="secondary" onClick={() => {
                                setSelectedRatingId(rating.id);
                                setCommentDeleteConfirmModalIsOpen(true);
                            }} className={styles['comment-delete-button']}>
                                Delete Comment
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {filteredRatings.length > visibleRatings && (
                    <Button variant="contained" color="primary" onClick={handleLoadMore} className={styles['load-more-button']}>
                        Load More
                    </Button>
                )}
                <Dialog
                    open={deleteConfirmModalIsOpen}
                    onClose={() => setDeleteConfirmModalIsOpen(false)}
                >
                    <DialogTitle>{"Delete Store"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this store? This action cannot be undone.
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
                <Dialog
                    open={productDeleteConfirmModalIsOpen}
                    onClose={() => setProductDeleteConfirmModalIsOpen(false)}
                >
                    <DialogTitle>{"Delete Product"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this product? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setProductDeleteConfirmModalIsOpen(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleProductDelete} color="secondary" autoFocus>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                >
                    <DialogTitle>{"Edit Product"}</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Name"
                            name="name"
                            value={editingProduct?.name || ''}
                            onChange={handleProductInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={editingProduct?.description || ''}
                            onChange={handleProductInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Price"
                            name="price"
                            value={editingProduct?.price || ''}
                            onChange={handleProductInputChange}
                            fullWidth
                            margin="normal"
                            type="number"
                        />
                        <TextField
                            label="Quantity"
                            name="quantity"
                            value={editingProduct?.quantity || ''}
                            onChange={handleProductInputChange}
                            fullWidth
                            margin="normal"
                            type="number"
                        />
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.files[0] })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditOpen(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleProductUpdate} color="secondary" autoFocus>
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={commentDeleteConfirmModalIsOpen}
                    onClose={() => setCommentDeleteConfirmModalIsOpen(false)}
                >
                    <DialogTitle>{"Delete Comment"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this comment? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCommentDeleteConfirmModalIsOpen(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleCommentDelete} color="secondary" autoFocus>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </div>
    );
};

export default withAuth(StoreDetail);
