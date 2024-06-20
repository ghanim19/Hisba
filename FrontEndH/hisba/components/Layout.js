import Navbar from './Navbar';
import Footer from './Footer';
import { useSession } from 'next-auth/react';
import AdminSidebar from './AdminComponents/AdminSidebar';
import styles from '../styles/Layout.module.css'; // تأكد من أن المسار صحيح
const Layout = ({ children }) => {
  const { data: session } = useSession();

  return (
    <>
    <div className={styles.container}>

      <Navbar />
      {session?.user?.role === 'admin' &&(
        <AdminSidebar />
      )}
      <main>{children}</main>
      <Footer />
    </div>
    </>
  );
};

export default Layout;
