// pages/stores/create.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import styles from '../styles/Stores.module.css';
import withAuth from '../../../components/withAuth'

const CreateStore = () => {
    const { data: session } = useSession();
    const [name, setName] = useState('');
    const [storeType, setStoreType] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/users/', {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`
                    }
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error.response ? error.response.data : error.message);
            }
        };

        fetchUsers();
    }, [session]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('store_type', storeType);
            formData.append('address', address);
            formData.append('phone', phone);
            formData.append('user_id', selectedUserId);
            if (coverImage) {
                formData.append('cover_image', coverImage);
            }

            await axios.post('http://localhost:8000/api/stores/create/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${session?.user?.accessToken}`
                }
            });
            router.push('/admin/stores');
        } catch (error) {
            console.error('Error creating store:', error.response ? error.response.data : error.message);
            setError('Failed to create store');
        }
    };

    const handleImageChange = (e) => {
        setCoverImage(e.target.files[0]);
    };

    return (
        <div className={styles.container1}>
            <Container className={styles['create-store-container']}>
                <Typography variant="h4" gutterBottom className={styles['store-detail-title']}>Create New Store</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Store Type</InputLabel>
                        <Select
                            value={storeType}
                            onChange={(e) => setStoreType(e.target.value)}
                            required
                        >
                            <MenuItem value="Farm">Farm</MenuItem>
                            <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>User</InputLabel>
                        <Select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            required
                        >
                            {users.map(user => (
                                <MenuItem key={user.id} value={user.id}>{user.username}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
                        {coverImage && (
                            <img
                                src={coverImage instanceof File ? URL.createObjectURL(coverImage) : coverImage}
                                alt="Cover Image"
                                className={styles['cover-image']}
                            />
                        )}
                    </div>
                    {error && <Typography variant="body2" color="error">{error}</Typography>}
                    <Button variant="contained" color="primary" type="submit" className={styles['create-button']}>
                        Create Store
                    </Button>
                </form>
            </Container>
        </div>
    );
};

export default withAuth(CreateStore);
