'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import styles from './login.module.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setIsLoggedIn } = useContext(AuthContext);
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const response = await fetch('https://thundercreation.com/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.access);
                setIsLoggedIn(true);
                router.push('/');
            } else {
                console.error('Login failed:', data);
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Login</h1>
            <input className={styles.input} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <button className={styles.btn} onClick={handleLogin}>Login</button>
        </div>
    );
};

export default Login;
