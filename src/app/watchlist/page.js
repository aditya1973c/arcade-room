"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useGames } from '@/context/GameContext';
import { useProfile } from '@/context/ProfileContext';
import styles from './page.module.css';

export default function Watchlist() {
  const { games, toggleInterested } = useGames();
  const { activeUser } = useProfile();
  const [activeTab, setActiveTab] = useState("All Tracked");
  
  const currentUser = activeUser ? activeUser.username : "Anonymous";
  
  // Filter games based on interestedUsers array
  const trackedGames = games.filter(g => g.interestedUsers && g.interestedUsers.includes(currentUser));

  // Further filter by tab
  const displayedGames = trackedGames.filter(g => {
    if (activeTab === "Released") return g.status === "Released";
    if (activeTab === "Upcoming") return g.status === "Upcoming";
    return true; // "All Tracked"
  });

  return (
    <main className={`container ${styles.watchlistLayout} animate-fade-in`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Watchlist</h1>
        <p className={styles.subtitle}>Track the games you're most excited about.</p>
      </header>

      <div className={styles.controls}>
        <div className={styles.tabs}>
          {["All Tracked", "Released", "Upcoming"].map(tab => (
            <button 
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className={styles.filters}>
          <button className={styles.filterBtn}>
            Sort By <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {displayedGames.length === 0 ? (
          <div style={{ padding: '4rem 0', color: 'rgba(255,255,255,0.5)', gridColumn: '1 / -1', textAlign: 'center' }}>
            No games in your Watchlist. Go to Explore and mark some games as "Interested"!
          </div>
        ) : (
          displayedGames.map((game, i) => (
            <Link href={`/game/${game.id}`} key={game.id} className={styles.gameCard}>
              <div className={styles.gamePoster} style={game.posterImage ? { backgroundImage: `url(${game.posterImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                <button 
                  className={`${styles.bookmarkBtn} ${styles.bookmarked}`}
                  onClick={(e) => { e.preventDefault(); toggleInterested(game.id, currentUser); }}
                  title="Remove from Watchlist"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
              </div>
              <div className={styles.gameInfo}>
                <h3 className={styles.gameTitle}>{game.title}</h3>
                <div className={styles.gameMeta}>
                  <span className={styles.status}>{game.status}</span>
                  <span className={styles.date}>{game.releaseDate}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
