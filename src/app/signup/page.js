"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';
import Link from 'next/link';
import styles from './page.module.css';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useProfile();
  
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    // Success! Create account via Firebase
    const res = await signup(formData.username, formData.password, formData.email);
    
    if (res.success) {
      router.push('/');
    } else {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className={styles.loginLayout}>
      
      {/* Login Form Container */}
      <div className={styles.rightPanel}>
        <div className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
          </svg>
          ARCADE ROOM
        </div>

        <div className={styles.loginCard}>
          
          <h2 className={styles.title}>Create Account</h2>
          <form onSubmit={handleSignup}>
            {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

            <div className={styles.inputGroup}>
              <label className={styles.label}>Username</label>
              <input 
                type="text" 
                name="username"
                className={styles.input} 
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Address</label>
              <input 
                type="email" 
                name="email"
                className={styles.input} 
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
              />
            </div>



            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                className={styles.input}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
              />
              <span className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                )}
              </span>
            </div>

            <button type="submit" className={styles.loginBtn} style={{ marginTop: '1rem' }}>
              Sign Up
            </button>
          </form>

        </div>

        <p className={styles.signUpText}>
          Already have an account? <Link href="/login" className={styles.signUpLink}>Login</Link>
        </p>
      </div>

    </div>
  );
}
