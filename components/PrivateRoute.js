// components/PrivateRoute.js
import { useRouter } from 'next/router';
import { useEffect } from 'react';
const PrivateRoute = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/404');
    }
  }, []);

  return <>{children}</>;
};

export default PrivateRoute;
