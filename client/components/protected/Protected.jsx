import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';

const ProtectedComponent = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <div>Please login to view this content.</div>;
  }

  return <div>Protected Content</div>;
}

export default ProtectedComponent;
