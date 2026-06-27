"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      width: '100%',
      padding: '2rem 1rem',
      marginTop: 'auto', // Pushes footer to the bottom of the page if layout is flex-col
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      background: 'transparent',
      color: 'rgba(255, 255, 255, 0.6)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      fontSize: '0.9rem',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <Link href="/privacy" style={{ textDecoration: 'none', color: 'rgba(255, 255, 255, 0.6)', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='rgba(255, 255, 255, 0.6)'}>
          Privacy Policy
        </Link>
        <Link href="/terms" style={{ textDecoration: 'none', color: 'rgba(255, 255, 255, 0.6)', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='rgba(255, 255, 255, 0.6)'}>
          Terms and Conditions
        </Link>
      </div>
      <div>
        Developed by Resengal Studio © {new Date().getFullYear()} All rights reserved.
      </div>
    </footer>
  );
}
