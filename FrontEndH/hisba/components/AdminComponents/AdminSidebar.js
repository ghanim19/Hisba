// components/AdminSidebar.js
import { useState } from 'react';
import Link from 'next/link';
import styles from './adminStyles/AdminSidebar.module.css'; // أساليب CSS الخاصة بالسايدبار
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <Link href="/admin/dashboard" legacyBehavior><a>Dashboard</a></Link>
        <Link href="/admin/users" legacyBehavior><a>Users</a></Link>
        <Link href="/admin/products" legacyBehavior><a>Products</a></Link>
        <Link href="/admin/orders" legacyBehavior><a>Orders</a></Link>
        <Link href="/admin/reports" legacyBehavior><a>Reports</a></Link>
      </div>
    </>
  );
};

export default AdminSidebar;
