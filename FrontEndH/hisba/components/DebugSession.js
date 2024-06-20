import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';

const DebugSession = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('Session:', session);
  }, [session, status]);

  return null;
};

export default DebugSession;
