import React, { useEffect, useState } from 'react';
import axiosInstance from '../lib/axios';

const TestAuth = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await axiosInstance.get('/test-auth/');
        setMessage(response.data.message);
      } catch (error) {
        console.error('Error fetching message:', error);
      }
    };

    fetchMessage();
  }, []);

  return (
    <div>
      <h2>Test Authentication</h2>
      <p>{message}</p>
    </div>
  );
};

export default TestAuth;
