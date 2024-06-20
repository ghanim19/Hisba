// في /components/Navbar.js
import { useSession } from 'next-auth/react';
import AdminNavbar from './AdminComponents/AdminNavbar';
import GeneralNavbar from './generalNavbar';

const Navbar = () => {
  const { data: session } = useSession();

  // تحديد أي نافبار يجب عرضه بناءً على دور المستخدم
  if (session?.user?.role === 'admin') {
    return <AdminNavbar />;
  }
  return <GeneralNavbar />;
};

export default Navbar;
