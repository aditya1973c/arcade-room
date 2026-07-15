"use client";

import { useState } from "react";
import Link from "next/link";
import { useGames } from "@/context/GameContext";
import { useProfile } from "@/context/ProfileContext";
import styles from './page.module.css';

export default function Home() {
  const { games } = useGames();
  const { profile } = useProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lbDropdownOpen, setLbDropdownOpen] = useState(false);
  const [activeTimeFilter, setActiveTimeFilter] = useState('This Week');

  const handleTimeFilter = (filter) => {
    setActiveTimeFilter(filter);
    setLbDropdownOpen(false);
  };
  
  if (games.length === 0) {
    return (
      <main className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '1.5rem' }}>
          <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M9 12h.01M15 12h.01M18 12h.01"></path>
        </svg>
        <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem', fontWeight: '500' }}>No Games Found</h2>
        <p style={{ color: '#94a3b8', maxWidth: '400px', lineHeight: '1.6' }}>
          The database is currently a clean slate. Check back later for new discoveries.
        </p>
        
        {profile?.isAdmin && (
          <Link href="/admin/create" className={styles.loginBtn} style={{ marginTop: '2rem', display: 'inline-block', textDecoration: 'none', padding: '0.8rem 2rem', width: 'auto' }}>
            Go to Admin Panel
          </Link>
        )}
      </main>
    );
  }

  // Calculate top trending games based on interested users
  const trendingGames = [...games].sort((a, b) => (b.interestedUsers?.length || 0) - (a.interestedUsers?.length || 0)).slice(0, 4);
  
  const hasPlatform = (game, keyword) => {
    if (!game.platforms) return false;
    if (typeof game.platforms === 'string') {
      return game.platforms.toLowerCase().includes(keyword.toLowerCase());
    }
    if (Array.isArray(game.platforms)) {
      return game.platforms.some(p => p.toLowerCase().includes(keyword.toLowerCase()));
    }
    return false;
  };

  // Platform specific filters (grabbing up to 4 games per platform)
  const ps5Games = games.filter(g => hasPlatform(g, 'ps5') || hasPlatform(g, 'playstation')).slice(0, 4);
  const xboxGames = games.filter(g => hasPlatform(g, 'xbox')).slice(0, 4);
  const pcGames = games.filter(g => hasPlatform(g, 'pc') || hasPlatform(g, 'windows')).slice(0, 4);
  const androidGames = games.filter(g => hasPlatform(g, 'android') || hasPlatform(g, 'mobile')).slice(0, 4);
  const nintendoGames = games.filter(g => hasPlatform(g, 'nintendo') || hasPlatform(g, 'switch')).slice(0, 4);

  // Helper function to render a game grid row
  const renderGameRow = (gameList) => (
    <div className={styles.gameGrid}>
      {gameList.map((game) => (
        <Link href={`/game/${game.id}`} key={game.id} className={`${styles.gameCard} hover-lift`}>
          <div className={styles.poster}>
            {game?.posterUrl || game?.posterImage ? (
              <div className={styles.placeholderImg} style={{ backgroundImage: `url(${game.posterUrl || game.posterImage})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' }}>Cover Art</div>
            ) : (
              <div className={styles.placeholderImg} style={{ background: 'var(--bg-tertiary)' }}>Cover Art</div>
            )}
          </div>
          <div className={styles.cardInfo}>
            <h3 className={styles.gameTitle}>{game.title}</h3>
            <p className={styles.gameMeta}>
              {Array.isArray(game.platforms) ? (game.platforms[0] || 'Unknown') : (typeof game.platforms === 'string' ? game.platforms.split(',')[0] : 'Unknown')} • {game.releaseDate}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <main className="container main-layout animate-fade-in">
      {/* Main Content Area (70%) */}
      <div className="main-content">
        
        {/* Trending Section */}
        {trendingGames.length > 0 && (
          <section className={styles.section}>
            <div className="section-header">
              <div className="glow-bg"></div>
              <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <h2 className="section-title">This Month's Trending</h2>
            </div>
            {renderGameRow(trendingGames)}
          </section>
        )}

        {/* New to PS5 Section */}
        {ps5Games.length > 0 && (
          <section className={styles.section}>
            <div className="section-header">
              <div className="glow-bg" style={{ background: 'rgba(0, 112, 204, 0.15)' }}></div>
              <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M9 12h.01M15 12h.01M18 12h.01"></path></svg>
              <h2 className="section-title">New to PS5</h2>
            </div>
            {renderGameRow(ps5Games)}
          </section>
        )}

        {/* New to Xbox Section */}
        {xboxGames.length > 0 && (
          <section className={styles.section}>
            <div className="section-header">
              <div className="glow-bg" style={{ background: 'rgba(16, 124, 16, 0.15)' }}></div>
              <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
              <h2 className="section-title">New to Xbox</h2>
            </div>
            {renderGameRow(xboxGames)}
          </section>
        )}

        {/* New to PC Section */}
        {pcGames.length > 0 && (
          <section className={styles.section}>
            <div className="section-header">
              <div className="glow-bg" style={{ background: 'rgba(145, 70, 255, 0.15)' }}></div>
              <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              <h2 className="section-title">New to PC</h2>
            </div>
            {renderGameRow(pcGames)}
          </section>
        )}

        {/* New to Android Section */}
        {androidGames.length > 0 && (
          <section className={styles.section}>
            <div className="section-header">
              <div className="glow-bg" style={{ background: 'rgba(61, 220, 132, 0.15)' }}></div>
              <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              <h2 className="section-title">New to Android</h2>
            </div>
            {renderGameRow(androidGames)}
          </section>
        )}

        {/* New to Nintendo Section */}
        {nintendoGames.length > 0 && (
          <section className={styles.section}>
            <div className="section-header">
              <div className="glow-bg" style={{ background: 'rgba(228, 0, 15, 0.15)' }}></div>
              <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="4"></rect><circle cx="6" cy="12" r="1"></circle><circle cx="18" cy="12" r="1"></circle></svg>
              <h2 className="section-title">New to Nintendo</h2>
            </div>
            {renderGameRow(nintendoGames)}
          </section>
        )}

      </div>

      {/* Sidebar (30%) */}
      <aside className="sidebar">
        <div className={styles.leaderboard}>
          <div className={styles.leaderboardHeader}>
            <h3 className={styles.leaderboardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.titleIcon}><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path></svg>
              Most Interested
            </h3>
            <div className={styles.dropdownWrap}>
              <button className={styles.filterBtn} onClick={() => setLbDropdownOpen(!lbDropdownOpen)}>
                {activeTimeFilter} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              {lbDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  {['This Week', 'This Month', 'This Quarter', 'This Year', 'All Time'].map((filter) => (
                    <button 
                      key={filter}
                      className={`${styles.dropdownItem} ${activeTimeFilter === filter ? styles.activeItem : ''}`}
                      onClick={() => handleTimeFilter(filter)}
                    >
                      {filter} 
                      {activeTimeFilter === filter && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: 'auto'}}><polyline points="20 6 9 17 4 12"></polyline></svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.leaderboardList}>
            {[...games].sort((a, b) => (b.interestedUsers?.length || 0) - (a.interestedUsers?.length || 0)).slice(0, 5).map((game, index) => (
              <Link href={`/game/${game.id}`} key={game.id} className={`${styles.leaderboardItem} hover-lift`} style={{textDecoration: 'none'}}>
                <div className={styles.rankContainer}>
                  <div className={styles.rankNumber}>{index + 1}</div>
                  {game?.posterUrl || game?.posterImage ? (
                    <div className={styles.lbThumbnail} style={{ backgroundImage: `url(${game.posterUrl || game.posterImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  ) : (
                    <div className={styles.lbThumbnail}></div>
                  )}
                </div>
                <div className={styles.lbInfo}>
                  <h4 className={styles.lbTitle}>{game.title}</h4>
                  <p className={styles.lbMeta}>{game.releaseDate} • {game.status}</p>
                  <div className={styles.lbStat}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.statIcon}><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path></svg>
                    <span>{game.interestedUsers?.length || 0} Interested</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <button className={styles.seeAllBtn}>See All <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></button>
        </div>
      </aside>
    </main>
  );
}
