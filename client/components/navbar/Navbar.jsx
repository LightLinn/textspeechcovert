"use client";

import styles from "./navbar.module.css";
import Image from "next/image";
import Link from "next/link";
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';

const Navbar = () => {
  
  const { isLoggedIn, setIsLoggedIn, user } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = () => {
    console.log(isLoggedIn)
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Link href="/" className={styles.logoicon}>
          {/* <Image src='' alt="logo" width={50} height={50} /> */}
          <h1 className={styles.logoText}>MoMoGo</h1>
        </Link>
      </div>
      <div className={styles.links}>
        <div className={styles.username}>{user ? `${user}` : 'Hi User'}</div>
        {!isLoggedIn ? (
          <Link href="/login" className={styles.link}>Login</Link>
        ) : (
          <a onClick={handleLogout} className={styles.link}>Logout</a>
        )}
        <Link href="/signup" className={styles.btn}>Signup</Link>
      </div>
    </div>
  );
};

export default Navbar;
