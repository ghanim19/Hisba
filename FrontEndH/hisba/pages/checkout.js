import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router'; // استيراد useRouter
import { CartContext } from '../context/CartContext';
import styles from '../styles/checkout.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faCalendarAlt, faLock, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons';
import withAuth from '../components/withAuth';

const CheckoutPage = () => {
    const { cartItems } = useContext(CartContext);
    const { data: session } = useSession();
    const router = useRouter(); // استخدام useRouter
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [visaNumber, setVisaNumber] = useState('');
    const [expiryMonth, setExpiryMonth] = useState('');
    const [expiryYear, setExpiryYear] = useState('');
    const [cvc, setCvc] = useState('');
    const [error, setError] = useState('');

    const validateVisaNumber = (number) => {
        const regex = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$/;
        return regex.test(number);
    };

    const validateExpiryDate = (month, year) => {
        const monthRegex = /^(0[1-9]|1[0-2])$/;
        const yearRegex = /^[0-9]{2}$/;
        return monthRegex.test(month) && yearRegex.test(year);
    };

    const validateCVC = (cvc) => {
        const regex = /^[0-9]{3}$/;
        return regex.test(cvc);
    };

    const handleCheckout = async () => {
        if (!address || !phone || (paymentMethod === 'visa' && (!visaNumber || !validateVisaNumber(visaNumber) || !expiryMonth || !expiryYear || !validateExpiryDate(expiryMonth, expiryYear) || !cvc || !validateCVC(cvc)))) {
            setError('Please fill in all required fields correctly.');
            return;
        }
    
        try {
            const expiryDate = `${expiryMonth}/${expiryYear}`;
            const response = await axios.post('http://localhost:8000/api/checkout/', {
                address,
                phone_number: phone,
                payment_method: paymentMethod,
                visa_number: paymentMethod === 'visa' ? visaNumber : undefined,
                expiry_date: paymentMethod === 'visa' ? expiryDate : undefined,
                cvc: paymentMethod === 'visa' ? cvc : undefined
            }, {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            });
    
            alert('Order submitted successfully!');
            router.push('/orders'); // إعادة التوجيه لصفحة الطلبات الخاصة بي
        } catch (error) {
            console.error('Failed to submit order:', error);
            setError('Failed to submit order');
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Checkout</h2>
            <div className={styles.form}>
                <label className={styles.label}>Address:</label>
                <div className={styles.inputWrapper}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.icon} />
                    <input type="text" className={styles.input} value={address} onChange={e => setAddress(e.target.value)} />
                </div>
            </div>
            <div className={styles.form}>
                <label className={styles.label}>Phone Number:</label>
                <div className={styles.inputWrapper}>
                    <FontAwesomeIcon icon={faPhone} className={styles.icon} />
                    <input type="tel" className={styles.input} value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
            </div>
            <div className={styles.form}>
                <label className={styles.label}>Payment Method:</label>
                <select className={styles.select} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="visa">Visa</option>
                </select>
            </div>
            {paymentMethod === 'visa' && (
                <div>
                    <div className={styles.form}>
                        <label className={styles.label}>Visa Number:</label>
                        <div className={styles.inputWrapper}>
                            <FontAwesomeIcon icon={faCreditCard} className={styles.icon} />
                            <input type="text" className={styles.input} value={visaNumber} onChange={e => setVisaNumber(e.target.value)} />
                        </div>
                    </div>
                    <div className={styles.form}>
                        <label className={styles.label}>Expiry Date:</label>
                        <div className={styles.inputWrapper}>
                            <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
                            <input type="text" className={styles.inputSmall} placeholder="MM" value={expiryMonth} onChange={e => setExpiryMonth(e.target.value)} maxLength="2" />
                            <span className={styles.slash}>/</span>
                            <input type="text" className={styles.inputSmall} placeholder="YY" value={expiryYear} onChange={e => setExpiryYear(e.target.value)} maxLength="2" />
                        </div>
                    </div>
                    <div className={styles.form}>
                        <label className={styles.label}>CVC:</label>
                        <div className={styles.inputWrapper}>
                            <FontAwesomeIcon icon={faLock} className={styles.icon} />
                            <input type="text" className={styles.input} placeholder="CVC" value={cvc} onChange={e => setCvc(e.target.value)} maxLength="3" />
                        </div>
                    </div>
                </div>
            )}
            <div className={styles.card}>
                <h3>Card Details</h3>
                <p><strong>Visa Number:</strong> {visaNumber}</p>
                <p><strong>Expiry Date:</strong> {expiryMonth}/{expiryYear}</p>
                <p><strong>CVC:</strong> {cvc}</p>
            </div>
            <button className={styles.button} onClick={handleCheckout}>Submit Order</button>
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
};

export default withAuth(CheckoutPage);
