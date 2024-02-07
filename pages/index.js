import React, { useState } from 'react';
import styles from '../styles/Home.module.css';
import axios from 'axios'; // Add axios for API requests
import { useRouter } from "next/router";
export default function Login() {
  const [name,setName]=useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', {name,email, password });
      console.log(response.data.message);
      localStorage.setItem('token', response.data.token);
      window.alert("Logged in successfully");
      router.push("/home");
    } catch (error) {
      setError(error.response.data.message);
      console.error('Error logging in:', error.response.data.message);
    }
  };

  return (
    <div className={styles.containerfluid}>
      <div className={styles.bgimage}></div>
      <div className={styles.cardcontainer}>
        <div className={styles.cardbody}>
          <h2>Login now</h2>
          <div className={styles.inputs}>
          <input
              className={styles.forminput}
              placeholder="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className={styles.forminput}
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className={styles.forminput}
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className={styles.submitbtn} onClick={handleLogin}>
              LOGIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
