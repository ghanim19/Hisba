// pages/users/create.js
import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import style from '../styles/Users.module.css';
import withAuth from '../../../components/withAuth'

const CreateUser = () => {
    const { data: session } = useSession();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [isSeller, setIsSeller] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!session?.user?.accessToken) {
            setError('Access token is missing');
            return;
        }
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('profile.phone', phone);
        formData.append('profile.age', age);
        formData.append('profile.id_number', idNumber);
        formData.append('profile.is_seller', isSeller);
        if (profileImage) {
            formData.append('profile.profile_image', profileImage);
        }
        try {
            await axios.post('http://localhost:8000/api/users/', formData, {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            router.push('/admin/users');
        } catch (error) {
            console.error('Error creating user:', error.response ? error.response.data : error.message);
            setError('Failed to create user');
        }
    };

    return (
        <div className={style.container1}>
            <Container className="create-user-container">
                <Typography variant="h4" gutterBottom className="create-user-title">Create New User</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                        type="email"
                    />
                    <TextField
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                        type="password"
                    />
                    <TextField
                        label="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="ID Number"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <div className={style.checkboxContainer}>
                        <label>
                            <input
                                type="checkbox"
                                checked={isSeller}
                                onChange={(e) => setIsSeller(e.target.checked)}
                            />
                            Is Seller
                        </label>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfileImage(e.target.files[0])}
                    />
                    {error && <Typography variant="body2" color="error">{error}</Typography>}
                    <Button variant="contained" color="primary" type="submit" className="create-user-button">
                        Create User
                    </Button>
                </form>
            </Container>
        </div>
    );
};

export default withAuth(CreateUser);
