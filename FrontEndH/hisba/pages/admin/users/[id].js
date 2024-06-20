// pages/users/[id].js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Container, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import style from '../styles/Users.module.css';
import withAuth from '../../../components/withAuth'

const UserDetail = () => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const fetchUser = async () => {
            if (status === 'authenticated' && session?.user?.accessToken && id) {
                try {
                    const response = await axios.get(`http://localhost:8000/api/users/${id}/`, {
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`
                        }
                    });
                    setUser(response.data);
                } catch (error) {
                    console.error('Error fetching user:', error.response ? error.response.data : error.message);
                    setError(error.response ? error.response.data.detail : 'Failed to fetch user');
                } finally {
                    setLoading(false);
                }
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id, session, status]);

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/users/${id}/`, {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            });
            router.push('/admin/users');
        } catch (error) {
            console.error('Error deleting user:', error.response ? error.response.data : error.message);
        } finally {
            setOpen(false);
        }
    };

    if (loading) {
        return <Container><Typography variant="h6">Loading...</Typography></Container>;
    }

    if (error) {
        return <Container><Typography variant="h6">{error}</Typography></Container>;
    }

    if (!user) {
        return <Container><Typography variant="h6">User not found</Typography></Container>;
    }

    return (
        <div className={style.container1}>
            <Container className="user-detail-container">
                <Button variant="contained" color="primary" onClick={() => router.back()} className="back-button">
                    Back to Users
                </Button>
                <Card className="user-detail-card">
                    <CardContent>
                        <Typography variant="h4" className="user-detail-title">{user.username}</Typography>
                        <Typography variant="body1">Email: {user.email}</Typography>
                        <Typography variant="body1">Role: {user.profile.is_seller ? 'Seller' : 'Customer'}</Typography>
                        {user.profile.profile_image && <img src={user.profile.profile_image} alt="Profile" className={style.profileImage} />}
                        <Typography variant="body1">Phone: {user.profile.phone}</Typography>
                        <Typography variant="body1">Age: {user.profile.age}</Typography>
                        <Typography variant="body1">ID Number: {user.profile.id_number}</Typography>
                        <Button variant="contained" color="secondary" onClick={() => setOpen(true)} className="delete-button">
                            Delete User
                        </Button>
                    </CardContent>
                </Card>
                <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                >
                    <DialogTitle>{"Delete User"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)} color="primary">
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

export default withAuth(UserDetail);
