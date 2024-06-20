import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import styles from '../styles/ProductsCreate.module.css';
import withAuth from '../../../components/withAuth'

const AdminCreateProduct = () => {
    const { data: session } = useSession();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/stores/', {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`
                    }
                });
                setStores(response.data);
            } catch (error) {
                console.error('Error fetching stores:', error.response ? error.response.data : error.message);
                setError('Failed to fetch stores');
            }
        };

        if (session?.user) {
            fetchStores();
        }
    }, [session?.user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('quantity', quantity);
            formData.append('store_id', selectedStore);
            if (image) {
                formData.append('image', image);
            }

            await axios.post('http://localhost:8000/api/products/admin-create/', formData, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            router.push('/admin/products');
        } catch (error) {
            console.error('Error creating product:', error.response ? error.response.data : error.message);
            setError('Failed to create product');
        }
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    return (
        <div className={styles.container}>
            <Container className={styles['create-product-container']}>
                <Typography variant="h4" gutterBottom className={styles['product-detail-title']}>Admin Create New Product</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        fullWidth
                        margin="normal"
                        type="number"
                        required
                    />
                    <TextField
                        label="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        fullWidth
                        margin="normal"
                        type="number"
                        required
                    />
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="store-select-label">Store</InputLabel>
                        <Select
                            labelId="store-select-label"
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                        >
                            {stores.map((store) => (
                                <MenuItem key={store.id} value={store.id}>
                                    {store.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <div className={styles['image-container']}>
                        <label htmlFor="productImage" className={styles['upload-label']}>
                            Upload Product Image
                            <input
                                type="file"
                                id="productImage"
                                name="productImage"
                                accept="image/*"
                                onChange={handleImageChange}
                                className={styles['upload-input']}
                            />
                        </label>
                        {image && (
                            <img
                                src={URL.createObjectURL(image)}
                                alt="Product Image"
                                className={styles['product-image']}
                            />
                        )}
                    </div>
                    {error && <Typography variant="body2" color="error">{error}</Typography>}
                    <Button variant="contained" color="primary" type="submit" className={styles['create-button']}>
                        Create Product
                    </Button>
                </form>
            </Container>
        </div>
    );
};

export default withAuth(AdminCreateProduct);
