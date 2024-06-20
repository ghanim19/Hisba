// components/withAuth.js
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'unauthenticated') {
        router.replace('/login');
      }
    }, [status, router]);

    if (status === 'loading') {
      return <p>Loading...</p>;
    }

    if (status === 'authenticated') {
      return <WrappedComponent {...props} />;
    }

    return null;
  };
};

export default withAuth;
