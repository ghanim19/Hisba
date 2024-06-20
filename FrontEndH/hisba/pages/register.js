import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/RegisterPage.module.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    idNumber: ''
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const passwordCriteria = {
    length: formData.password.length >= 8,
    hasLetter: /[A-Za-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecialChar: /[@$!%*?&]/.test(formData.password),
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!Object.values(passwordCriteria).every(Boolean)) {
      setError('Password does not meet criteria');
      return;
    }

    const data = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      profile: {
        phone: formData.phone,
        age: formData.age,
        id_number: formData.idNumber
      }
    };

    try {
      const response = await axios.post('http://localhost:8000/api/signup/', data);
      console.log('User registered:', response.data);
      // Save token in cookie
      Cookies.set('token', response.data.access, { expires: 7 });
      // Redirect to home page
      router.push('/');
    } catch (error) {
      if (error.response) {
        setError(`Registration error: ${error.response.data}`);
      } else {
        setError('Registration error');
      }
      console.error('Registration error:', error);
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
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Register
        </motion.h2>
        <div className={styles.inputContainer}>
          <motion.input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className={styles.input}
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className={styles.inputContainer}>
          <motion.input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.input}
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className={styles.inputContainer}>
          <motion.input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className={styles.input}
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <span className={styles.togglePassword} onClick={togglePasswordVisibility}>
            {showPassword ? 'Hide' : 'Show'}
          </span>
          <div className={styles.passwordCriteria}>
            <span className={passwordCriteria.length ? 'correct' : 'incorrect'}>
              At least 8 characters
              {passwordCriteria.length ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faTimesCircle} />
              )}
            </span>
            <span className={passwordCriteria.hasLetter ? 'correct' : 'incorrect'}>
              At least one letter
              {passwordCriteria.hasLetter ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faTimesCircle} />
              )}
            </span>
            <span className={passwordCriteria.hasNumber ? 'correct' : 'incorrect'}>
              At least one number
              {passwordCriteria.hasNumber ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faTimesCircle} />
              )}
            </span>
            <span className={passwordCriteria.hasSpecialChar ? 'correct' : 'incorrect'}>
              At least one special character (@$!%*?&)
              {passwordCriteria.hasSpecialChar ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faTimesCircle} />
              )}
            </span>
          </div>
        </div>
        <div className={styles.inputContainer}>
          <motion.input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className={styles.input}
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className={styles.inputContainer}>
          <motion.input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            className={styles.input}
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className={styles.inputContainer}>
          <motion.input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            required
            className={styles.input}
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className={styles.inputContainer}>
          <motion.input
            type="text"
            name="idNumber"
            placeholder="ID Number"
            value={formData.idNumber}
            onChange={handleChange}
            required
            className={styles.input}
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <motion.button
          type="submit"
          className={styles.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Register
        </motion.button>
        {error && <motion.p className={styles.errorMessage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>{error}</motion.p>}
        <a href="/login" className={styles.link}>Already have an account? Login!</a>
      </motion.form>
    </div>
  );
}

export default RegisterPage;
