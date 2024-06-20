// pages/users/index.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Container, Button, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import style from '../styles/Users.module.css';  // تأكد من استيراد ملف الستايل
import withAuth from '../../../components/withAuth'

const Users = () => {
    const { data: session } = useSession();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const usersPerPage = 10;
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            if (!session?.user?.accessToken) {
                setError('Access token is missing');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get('http://localhost:8000/api/users/', {
                    headers: {
                        Authorization: `Bearer ${session.user.accessToken}`
                    }
                });
                setUsers(response.data);
                setTotalPages(Math.ceil(response.data.length / usersPerPage));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error.response ? error.response.data : error.message);
                setError('Failed to fetch users');
                setLoading(false);
            }
        };

        fetchUsers();
    }, [session]);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const displayedUsers = filteredUsers.slice((page - 1) * usersPerPage, page * usersPerPage);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    if (loading) {
        return <Container><Typography variant="h6">Loading...</Typography></Container>;
    }

    if (error) {
        return <Container><Typography variant="h6">{error}</Typography></Container>;
    }

    return (
        <div className={style.container1}>
            <Container className={style['users-container']}>
                <Typography variant="h4" gutterBottom className={style['users-title']}>Users</Typography>
                <TextField
                    label="Search Users"
                    variant="outlined"
                    fullWidth
                    className={style['search-bar']}
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <Button variant="contained" color="primary" className={style['create-user-button']} onClick={() => router.push('/admin/users/create')}>
                    Create New User
                </Button>
                <div className={style['table-container']}>
                    <table className={style['users-table']}>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <Button variant="contained" color="primary" onClick={() => router.push(`/admin/users/${user.id}`)}>
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={style.pagination}>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <Button key={index + 1} onClick={() => handlePageChange(index + 1)}>{index + 1}</Button>
                    ))}
                </div>
            </Container>
        </div>
    );
};

export default withAuth(Users);
