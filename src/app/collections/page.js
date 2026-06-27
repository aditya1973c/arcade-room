"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useGames } from '@/context/GameContext';
import { useProfile } from '@/context/ProfileContext';
import styles from './page.module.css';

export default function Collections() {
  const { games, toggleCollection } = useGames();
  const { profile, isLoggedIn } = useProfile();
  const [activeSidebar, setActiveSidebar] = useState("My Collection");

  const fallbackUsername = profile?.email ? profile.email.split('@')[0] : "Anonymous";
  const currentUser = (isLoggedIn && profile?.username) ? profile.username : (profile?.name ? profile.name.replace(/\s+/g, '').toLowerCase() : fallbackUsername);

  // Filter games based on collectionUsers array
  const myCollection = games.filter(g => g.collectionUsers && g.collectionUsers.includes(currentUser));

  return (
    <main className={`container ${styles.collectionsLayout} animate-fade-in`}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <button 
          className={`${styles.sidebarLink} ${activeSidebar === "Discover" ? styles.activeLink : ""}`}
          onClick={() => setActiveSidebar("Discover")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
          Discover
        </button>
        <button 
          className={`${styles.sidebarLink} ${activeSidebar === "My Collection" ? styles.activeLink : ""}`}
          onClick={() => setActiveSidebar("My Collection")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          My Collection
        </button>
        <button 
          className={`${styles.sidebarLink} ${activeSidebar === "Saved" ? styles.activeLink : ""}`}
          onClick={() => setActiveSidebar("Saved")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          Saved
        </button>
      </aside>

      {/* Main Grid */}
      <div className={styles.grid}>
        {activeSidebar === "My Collection" ? (
          myCollection.length === 0 ? (
            <div style={{ padding: '4rem 0', color: 'rgba(255,255,255,0.5)', gridColumn: '1 / -1', textAlign: 'center' }}>
              Your collection is empty. Go to Explore and add some games!
            </div>
          ) : (
            myCollection.map((game, i) => (
              <div key={game.id} className={styles.collectionCard} style={{position: 'relative'}}>
                <Link href={`/game/${game.id}`}>
                  <div className={styles.cardImage} style={game.posterImage ? { backgroundImage: `url(${game.posterImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}></div>
                </Link>
                <button 
                  onClick={() => toggleCollection(game.id, currentUser)}
                  style={{
                    position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', 
                    border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', zIndex: 10
                  }}
                  title="Remove from Collection"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                </button>
                <h3 className={styles.cardTitle} style={{marginTop: '1rem', fontSize: '1.2rem', color: 'white'}}>{game.title}</h3>
                <div className={styles.cardMeta} style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem'}}>
                  <span>{game.status}</span>
                  <span className={styles.spacer}>•</span>
                  <span>{game.releaseDate}</span>
                </div>
              </div>
            ))
          )
        ) : (
          <div style={{ padding: '4rem 0', color: 'rgba(255,255,255,0.5)', gridColumn: '1 / -1', textAlign: 'center' }}>
            {activeSidebar} section coming soon. Check out "My Collection" to see your games!
          </div>
        )}
      </div>
    </main>
  );
}
