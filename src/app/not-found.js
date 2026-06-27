"use client";

import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <section className={styles.page_404}>
      <div className={styles.four_zero_four_bg}>
        <h1 className="text-center">404</h1>
      </div>
      
      <div className={styles.contant_box_404}>
        <h3 className="h2">Look like you're lost</h3>
        <p>the page you are looking for not avaible!</p>
        <Link href="/" className={styles.link_404}>
          Go to Home
        </Link>
      </div>
    </section>
  );
}
