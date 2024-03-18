'use client'


import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import styles from './login.module.css';
import { domain } from '@/config';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setIsLoggedIn, setUser } = useContext(AuthContext);
    const router = useRouter();

    // const domain = 'http://localhost:8000';
    // const domain = 'https://thundercreation.com';

    const handleLogin = async () => {
        try {
            const response = await fetch(`${domain}/api/token/`, {
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
                setUser(data.username);
                console.log(data)
                router.push('/');
            } else {
                console.error('Login failed:', data);
                setIsLoggedIn(false);
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
        
            {/* <GoogleLogin
                clientId="453968487623-fgb5iuml09d58u8iafa94ura05uk2g33.apps.googleusercontent.com"
                buttonText="Login with Google"
                onSuccess={handleGoogleResponse}
                onFailure={handleGoogleResponse}
                cookiePolicy={'single_host_origin'}
            /> */}
        </div>
    );
};

export default Login;
