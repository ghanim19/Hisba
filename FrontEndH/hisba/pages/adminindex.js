// في ملف صفحة الداشبورد
import { getSession } from 'next-auth/react';
import styles from './admin/styles/AdminNavbar.module.css';

export default function AdminDashboard() {
  return (
    <div className={styles.adminDashboard}>
      <div className={styles.dashboardLayout}>
        <main className={styles.mainContent}>
          <h1>Welcome to the Admin Dashboard</h1>
          <p>This is the main area where you will manage your content.</p>
        </main>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });

  // التحقق من الدور
  if (!session || session.user.role !== 'admin') {
    // إعادة التوجيه إذا لم يكن الدور هو أدمن
    return {
      redirect: {
        destination: '/login',  // يمكن تعديلها لتوجيه المستخدم إلى صفحة الدخول أو الرئيسية
        permanent: false,
      },
    };
  }

  // إذا كان الدور أدمن، سيتم تحميل الصفحة بشكل طبيعي
  return {
    props: {},  // يمكنك تمرير الخصائص هنا إذا كان هناك حاجة
  };
}
