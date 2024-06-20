// pages/stores/index.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import styles from '../styles/Stores.module.css';  // Adjusted the import path
import withAuth from '../../../components/withAuth'
const Stores = () => {
    const { data: session } = useSession();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmModalIsOpen, setDeleteConfirmModalIsOpen] = useState(false);
    const [selectedStoreId, setSelectedStoreId] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/stores/');
                setStores(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching stores:', error.response ? error.response.data : error.message);
                setError('Failed to fetch stores');
                setLoading(false);
            }
        };

        fetchStores();
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredStores = stores.filter(store => 
        store.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/stores/delete/${selectedStoreId}/`, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`
                }
            });
            setStores(stores.filter(store => store.id !== selectedStoreId));
            setDeleteConfirmModalIsOpen(false);
        } catch (error) {
            console.error('Error deleting store:', error.response ? error.response.data : error.message);
        }
    };

    const openDeleteConfirmModal = (storeId) => {
        setSelectedStoreId(storeId);
        setDeleteConfirmModalIsOpen(true);
    };

    const closeDeleteConfirmModal = () => {
        setDeleteConfirmModalIsOpen(false);
        setSelectedStoreId(null);
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
                <Typography variant="h4" gutterBottom className={styles['store-detail-title']}>Stores</Typography>
                <TextField
                    label="Search Stores"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    fullWidth
                    margin="normal"
                />
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => router.push('/admin/stores/create')}
                    className={styles['create-button']}
                >
                    Create New Store
                </Button>
                <TableContainer component={Paper}>
                    <Table className={styles['stores-table']} aria-label="stores table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStores.map(store => (
                                <TableRow key={store.id} hover>
                                    <TableCell>{store.id}</TableCell>
                                    <TableCell>{store.name}</TableCell>
                                    <TableCell>{store.store_type}</TableCell>
                                    <TableCell>{store.address}</TableCell>
                                    <TableCell>{store.phone}</TableCell>
                                    <TableCell>
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            className={styles['edit-button']}
                                            onClick={() => router.push(`/admin/stores/${store.id}`)}
                                        >
                                            View
                                        </Button>
                                        <Button 
                                            variant="contained" 
                                            color="secondary" 
                                            className={styles['delete-button']}
                                            onClick={() => openDeleteConfirmModal(store.id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Dialog
                    open={deleteConfirmModalIsOpen}
                    onClose={closeDeleteConfirmModal}
                >
                    <DialogTitle>{"Delete Store"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this store? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeDeleteConfirmModal} color="primary">
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

export default withAuth(Stores);
