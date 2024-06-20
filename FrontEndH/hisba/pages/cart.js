import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/cart.module.css';
import { useSession } from 'next-auth/react';
import withAuth from '../components/withAuth';
import { motion } from 'framer-motion';
import  Checkout from './checkout'; // مكون صفحة الشيكاوت

const CartPage = () => {
    const { data: session } = useSession();
    const [cartItems, setCartItems] = useState([]);
    const [promoCode, setPromoCode] = useState('');
    const [deliveryFee, setDeliveryFee] = useState(5.00); // قيمة التوصيل الافتراضية
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        if (session?.user?.accessToken) {
            axios.get('http://localhost:8000/api/cart/', {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`
                }
            })
            .then(response => {
                setCartItems(response.data.items);
            })
            .catch(error => console.error('Failed to fetch cart:', error));
        }
    }, [session]);

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        axios.put(`http://localhost:8000/api/cart/`, {
            product_id: productId,
            quantity: quantity
        }, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`
            }
        })
        .then(response => {
            setCartItems(response.data.items);
        })
        .catch(error => {
            console.error('Failed to update quantity:', error);
            setError('Failed to update quantity');
        });
    };

    const removeItem = (productId) => {
        axios.delete(`http://localhost:8000/api/cart/`, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`
            },
            data: {
                product_id: productId
            }
        })
        .then(response => {
            setCartItems(response.data.items);
        })
        .catch(error => {
            console.error('Failed to remove item:', error);
            setError('Failed to remove item');
        });
    };

    const applyPromoCode = () => {
        axios.post('http://localhost:8000/api/apply-promo/', {
            promo_code: promoCode
        })
        .then(response => {
            setPromoDiscount(response.data.discount);
        })
        .catch(error => {
            console.error('Failed to apply promo code:', error);
            setError('Invalid promo code');
        });
    };

    const [showCheckout, setShowCheckout] = useState(false);

    const handleShowCheckout = () => {
        setShowCheckout(true);
    };

    if (showCheckout) {
        return <Checkout />;
    }
    const calculateTotal = () => {
        const total = cartItems.reduce((acc, item) => acc + (item.quantity * item.product.price), 0);
        return total - promoDiscount + deliveryFee;
    };

    return (
        <motion.div className={styles.cartContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h1 className={styles.headerTitle}>Your Cart</h1>
            <div className={styles.itemsList}>
                {cartItems.length > 0 ? cartItems.map(item => (
                    <motion.div key={item.id} className={styles.item} initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 100 }}>
                        <img src={`http://localhost:8000${item.product.image}`} alt={item.product.name} className={styles.productImage} />
                        <div className={styles.itemInfo}>
                            <h3 className={styles.headerSubTitle}>{item.product.name}</h3>
                            <p className={styles.textParagraph}>Seller: {item.product.store.name}</p>
                            <p className={styles.textParagraph}>Quantity: 
                                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                                {item.quantity}
                                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                            </p>
                            <p className={styles.textParagraph}>Price: ${item.product.price}</p>
                            <p className={styles.textParagraph}>Total: ${item.quantity * item.product.price}</p>
                            <button onClick={() => removeItem(item.product.id)} className={styles.removeItemButton}>Remove</button>
                        </div>
                    </motion.div>
                )) : <p className={styles.textParagraph}>Your cart is empty.</p>}
            </div>
            {cartItems.length > 0 && (
                <div className={styles.checkoutSection}>
                    <input 
                        type="text" 
                        value={promoCode} 
                        onChange={(e) => setPromoCode(e.target.value)} 
                        placeholder="Enter promo code" 
                        className={styles.promoInput}
                    />
                    <button onClick={applyPromoCode} className={styles.applyButton}>Apply</button>
                    {error && <p className={styles.errorText}>{error}</p>}
                    <div className={styles.orderSummary}>
                        <p>Subtotal: ${cartItems.reduce((acc, item) => acc + (item.quantity * item.product.price), 0)}</p>
                        <p>Promo Discount: -${promoDiscount}</p>
                        <p>Delivery Fee: ${deliveryFee}</p>
                        <h2>Total: ${calculateTotal()}</h2>
                        <button onClick={handleShowCheckout} className={styles.checkoutButton}>Checkout</button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default withAuth(CartPage);
