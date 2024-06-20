// pages/store-requests/[id].js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import styles from '../styles/StoreRequestDetail.module.css';
import withAuth from '../../../components/withAuth'

const StoreRequestDetail = () => {
    const { data: session } = useSession();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const fetchRequest = async () => {
            if (!id) {
                setError('Request ID is missing');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`http://localhost:8000/api/store-request/${id}/`, {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`
                    }
                });
                setRequest(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching store request:', error.response ? error.response.data : error.message);
                setError('Failed to fetch store request');
                setLoading(false);
            }
        };

        if (id && session?.user) {
            fetchRequest();
        }
    }, [id, session?.user]);

    const handleApproveRequest = async () => {
        try {
            await axios.post(`http://localhost:8000/api/approve-store-request/${id}/`, {}, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`
                }
            });
            setRequest({ ...request, status: 'Approved' });
        } catch (error) {
            console.error('Error approving store request:', error.response ? error.response.data : error.message);
        }
    };

    if (loading) {
        return <Container><Typography variant="h6">Loading...</Typography></Container>;
    }

    if (error) {
        return <Container><Typography variant="h6">{error}</Typography></Container>;
    }

    if (!request) {
        return <Container><Typography variant="h6">Request not found</Typography></Container>;
    }

    return (
        <div className={styles.container}>
            <Container className={styles['request-detail-container']}>
                <Button variant="contained" color="primary" onClick={() => router.back()} className={styles['back-button']}>
                    Back to Requests
                </Button>
                <Card className={styles['request-detail-card']}>
                    <CardContent>
                        <Typography variant="h4" className={styles['request-detail-title']}>Request Details</Typography>
                        <Typography variant="body1"><strong>User:</strong> {request.user}</Typography>
                        <Typography variant="body1"><strong>Store Name:</strong> {request.store_name}</Typography>
                        <Typography variant="body1"><strong>Address:</strong> {request.address}</Typography>
                        <Typography variant="body1"><strong>Phone:</strong> {request.phone}</Typography>
                        <Typography variant="body1"><strong>Store Type:</strong> {request.store_type}</Typography>
                        <Typography variant="body1"><strong>Status:</strong> {request.status}</Typography>
                        {request.status !== 'Approved' && (
                            <Button variant="contained" color="secondary" onClick={handleApproveRequest} className={styles['approve-button']}>
                                Approve Request
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </Container>
        </div>
    );
};

export default withAuth(StoreRequestDetail);
