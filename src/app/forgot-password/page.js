"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';
import Link from 'next/link';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useProfile();
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [email, setEmail] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!email.trim()) {
      setErrorMsg('Please enter your email.');
      return;
    }

    const res = await resetPassword(email);
    
    if (res.success) {
      setSuccessMsg('Password reset email sent! Check your inbox.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else {
      setErrorMsg(res.error || 'Failed to send reset email.');
    }
  };

  return (
    <div className={styles.loginLayout}>
      <div className={styles.rightPanel}>
        <div className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
          </svg>
          ARCADE ROOM
        </div>

        <div className={styles.loginCard}>
          <h2 className={styles.title}>Forgot Password</h2>
          
          <p style={{textAlign: 'center', marginBottom: '1.5rem', color: '#94a3b8', fontSize: '0.9rem'}}>
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleReset}>
            {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}
            {successMsg && (
              <div className={styles.errorAlert} style={{backgroundColor: 'rgba(34, 197, 94, 0.1)', borderLeftColor: '#22c55e', color: '#22c55e'}}>
                {successMsg}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Address</label>
              <input 
                type="email" 
                className={styles.input} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <button type="submit" className={styles.loginBtn}>
              Send Reset Link
            </button>
          </form>
        </div>

        <p className={styles.signUpText}>
          Remember your password? <Link href="/login" className={styles.signUpLink}>Login</Link>
        </p>
      </div>
    </div>
  );
}
