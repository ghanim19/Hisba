import Link from 'next/link';
import styles from './adminStyles/AdminNavbar.module.css'; // أساليب CSS الخاصة بالنافبار
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faBars, faTachometerAlt, faUser, faBox, faStore, faChartLine, faClipboardList, faFileAlt } from '@fortawesome/free-solid-svg-icons';

const AdminNavbar = ({ toggleSidebar, isSidebarOpen }) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await signOut();
    router.push('/login'); // Redirect to login page after logout
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/admin/dashboard" legacyBehavior><a>Hisba Admin</a></Link>
      </div>
      <div className={styles.links}>
        <Link href="/admin/dashboard" legacyBehavior><a><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard</a></Link>
        <Link href="/admin/users" legacyBehavior><a><FontAwesomeIcon icon={faUser} /> Users</a></Link>
        <Link href="/admin/products" legacyBehavior><a><FontAwesomeIcon icon={faBox} /> Products</a></Link>
        <Link href="/admin/stores" legacyBehavior><a><FontAwesomeIcon icon={faStore} /> Stores</a></Link>
        
        <div className={styles.navItemDropdown} onClick={toggleDropdown} ref={dropdownRef}>
          <a className={styles.navItem}><FontAwesomeIcon icon={faBars} /></a>
          {isDropdownOpen && (
            <ul className={styles.dropdownMenu}>
              <li><a href="/profile" className={styles.dropdownItem}><FontAwesomeIcon icon={faUser} /> My Profile</a></li>
              <li><a href="/admin/stores" className={styles.dropdownItem}><FontAwesomeIcon icon={faStore} /> Stores</a></li>
              <li><a href="/admin/orders" className={styles.dropdownItem}><FontAwesomeIcon icon={faClipboardList} /> Orders</a></li>
              <li><a href="/admin/store-requests" className={styles.dropdownItem}><FontAwesomeIcon icon={faFileAlt} /> Store Requests</a></li>
              <li><a href="/admin/reports" className={styles.dropdownItem}><FontAwesomeIcon icon={faChartLine} /> Reports</a></li>
              <li><button onClick={handleLogout} className={styles.logoutButton}><FontAwesomeIcon icon={faSignOutAlt} /> Log out</button></li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
