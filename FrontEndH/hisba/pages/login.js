import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import styles from '../styles/LoginPage.module.css';

function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession(); // Use useSession to access the session data

  useEffect(() => {
    // Redirect based on role once the session is available
    if (status === 'authenticated' && session) {
      if (session.user.role === 'admin') {
        router.push('/admin/dashboard');  // Redirect to the admin dashboard
      } else {
        router.push('/');  // Redirect to the home page or other user-specific page
      }
    }
  }, [session, status, router]);

  const handleChange = (e) => {
    setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      username: credentials.username,
      password: credentials.password
    });

    if (result.error) {
      setError(result.error);
      console.error('Login error:', result.error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.container}>
      <motion.form
        className={styles.form}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 className={styles.title}>Login</motion.h2>
        <div className={styles.inputContainer}>
          <motion.input
            type="text"
            name="username"
            placeholder="Username"
            value={credentials.username}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.inputContainer}>
          <motion.input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            required
            className={styles.input}
          />
          <span className={styles.togglePassword} onClick={togglePasswordVisibility}>
            {showPassword ? 'Hide' : 'Show'}
          </span>
        </div>
        <motion.button type="submit" className={styles.button}>
          Login
        </motion.button>
        {error && <motion.p className={styles.errorMessage}>{error}</motion.p>}
        <a href="#" className={styles.link}>Forgot Password?</a>
        <a href="/register" className={styles.link}>Don't have an account? Sign up!</a>
      </motion.form>
    </div>
  );
}

export default LoginPage;
