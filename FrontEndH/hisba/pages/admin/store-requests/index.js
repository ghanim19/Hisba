// pages/store-requests/index.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import styles from '../styles/StoreRequests.module.css';
import withAuth from '../../../components/withAuth'

const StoreRequests = () => {
    const { data: session } = useSession();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/admin/store-requests/', {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`
                    }
                });
                setRequests(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching store requests:', error.response ? error.response.data : error.message);
                setError('Failed to fetch store requests');
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchRequests();
        }
    }, [session?.user]);

    const handleApprove = async (requestId) => {
        try {
            await axios.post(`http://localhost:8000/api/approve-store-request/${requestId}/`, {}, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`
                }
            });
            setRequests(requests.map(request => 
                request.id === requestId ? { ...request, status: 'Approved' } : request
            ));
        } catch (error) {
            console.error('Error approving store request:', error.response ? error.response.data : error.message);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredRequests = requests.filter(request => 
        request.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <Container><Typography variant="h6">Loading...</Typography></Container>;
    }

    if (error) {
        return <Container><Typography variant="h6">{error}</Typography></Container>;
    }

    return (
        <div className={styles.container}>
            <Container>
                <Typography variant="h4" gutterBottom className={styles['title']}>Store Requests</Typography>
                <TextField
                    label="Search Requests"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    fullWidth
                    margin="normal"
                />
                <TableContainer component={Paper}>
                    <Table className={styles['requests-table']} aria-label="requests table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Store Name</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRequests.map(request => (
                                <TableRow key={request.id} hover>
                                    <TableCell>{request.id}</TableCell>
                                    <TableCell>{request.user}</TableCell>
                                    <TableCell>{request.store_name}</TableCell>
                                    <TableCell>{request.status}</TableCell>
                                    <TableCell>
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            onClick={() => router.push(`/admin/store-requests/${request.id}`)}
                                            className={styles['view-button']}
                                        >
                                            View
                                        </Button>
                                        {request.status !== 'Approved' && (
                                            <Button 
                                                variant="contained" 
                                                color="secondary" 
                                                onClick={() => handleApprove(request.id)}
                                                className={styles['approve-button']}
                                            >
                                                Approve
                                            </Button>
                                        )}
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

export default withAuth(StoreRequests);
