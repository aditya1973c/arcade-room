"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';
import Link from 'next/link';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login, setupRecaptcha, sendOTP, verifyOTP } = useProfile();
  
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [identifier, setIdentifier] = useState(''); // email or phone number
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  useEffect(() => {
    // Setup Firebase Recaptcha for phone auth
    if (loginMethod === 'phone') {
      setupRecaptcha('sign-in-button');
    }
  }, [loginMethod, setupRecaptcha]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (loginMethod === 'email') {
      if (!captchaVerified) {
        setErrorMsg('Please verify you are human first.');
        return;
      }
      
      const res = await login(identifier, password);
      if (res.success) {
        router.push('/');
      } else {
        setErrorMsg(res.error);
      }
    } else {
      // Phone Login Flow
      if (showOtpInput) {
        // Verify OTP
        const res = await verifyOTP(otp);
        if (res.success) {
          router.push('/');
        } else {
          setErrorMsg(res.error || 'Invalid OTP');
        }
      } else {
        // Send OTP
        const res = await sendOTP(identifier, window.recaptchaVerifier);
        if (res.success) {
          setShowOtpInput(true);
        } else {
          setErrorMsg(res.error || 'Failed to send SMS');
        }
      }
    }
  };

  const handleCaptchaClick = () => {
    if (!captchaVerified) {
      setCaptchaVerified(true);
      setErrorMsg('');
    }
  };

  return (
    <div className={styles.loginLayout}>
      
      {/* Right Panel - Login Card */}
      <div className={styles.rightPanel}>
        <div className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
          </svg>
          ARCADE ROOM
        </div>

        <div className={styles.loginCard}>
          <h2 className={styles.title}>Login</h2>
          
          <div className={styles.toggleContainer}>
            <button 
              className={`${styles.toggleBtn} ${loginMethod === 'email' ? styles.active : ''}`}
              onClick={() => { setLoginMethod('email'); setShowOtpInput(false); }}
            >
              Email
            </button>
            <button 
              className={`${styles.toggleBtn} ${loginMethod === 'phone' ? styles.active : ''}`}
              onClick={() => { setLoginMethod('phone'); setShowOtpInput(false); }}
            >
              Phone
            </button>
          </div>

          <form onSubmit={handleLogin}>
            {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                {loginMethod === 'email' ? 'Email' : 'Phone Number (with +country code)'}
              </label>
              <input 
                type={loginMethod === 'email' ? "email" : "tel"}
                className={styles.input} 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={loginMethod === 'email' ? "Enter your email" : "+1 234 567 8900"}
                disabled={showOtpInput}
              />
            </div>

            {loginMethod === 'email' && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={styles.input} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                />
                <span 
                  className={styles.eyeIcon}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  )}
                </span>
              </div>
            )}

            {loginMethod === 'phone' && showOtpInput && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>SMS OTP Code</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                />
              </div>
            )}

            {loginMethod === 'email' && (
              <div 
                className={`${styles.captchaBox} ${captchaVerified ? styles.captchaVerifiedBox : ''}`}
                onClick={handleCaptchaClick}
              >
                <div className={styles.captchaStatus}>
                  {captchaVerified ? (
                    <>
                      <svg className={styles.successIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                      <span style={{color: '#0f172a'}}>Success!</span>
                    </>
                  ) : (
                    <>
                      <div className={styles.checkboxEmpty}></div>
                      <span style={{color: '#64748b'}}>Verify you are human</span>
                    </>
                  )}
                </div>
                <div className={styles.cloudflareBrand}>
                  <span className={styles.cfLogo}>CLOUDFLARE</span><br/>
                  Privacy • Terms
                </div>
              </div>
            )}

            <button type="submit" id="sign-in-button" className={styles.loginBtn}>
              {loginMethod === 'phone' ? (showOtpInput ? 'Verify Code' : 'Send Code') : 'Login'}
            </button>
            
            <Link href="/forgot-password" className={styles.forgotLink}>Forgot Password?</Link>
          </form>
        </div>

        <p className={styles.signUpText}>
          Don't have an account? <Link href="/signup" className={styles.signUpLink}>Sign Up</Link>
        </p>
      </div>

    </div>
  );
}
