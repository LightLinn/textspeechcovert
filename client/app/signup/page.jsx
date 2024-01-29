'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './signup.module.css';
import { domain } from '@/config';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const router = useRouter();

    // const domain = 'http://localhost:8000';
    // const domain = 'https://thundercreation.com';


    const handleRegister = async () => {
        try {
            const response = await fetch(`${domain}/api/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username:username, password:password, email:email})
            });

            const data = await response.json();
            if (response.ok) {
                router.push('/login');
            } else {
                console.error('Registration failed:', data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Signup</h1>
            <input className={styles.input} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <button className={styles.btn} onClick={handleRegister}>Submit</button>
        </div>
    );
};

export default Register;
