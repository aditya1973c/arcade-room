"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useGames } from '@/context/GameContext';
import styles from './page.module.css';

export default function Schedule() {
  const { games } = useGames();
  const [activeSidebar, setActiveSidebar] = useState("Upcoming");
  const [activePill, setActivePill] = useState("All");

  // Filter games based on sidebar
  const filteredGames = games.filter(g => {
    if (activeSidebar === "Released") return g.status === "Released";
    if (activeSidebar === "Upcoming") return g.status === "Upcoming";
    if (activeSidebar === "Announced") return g.status === "Announced";
    return true;
  });

  // Group by release date (for mock simplicity, we just use the raw string)
  const groupedData = {};
  filteredGames.forEach(g => {
    const d = g.releaseDate || "TBA";
    if (!groupedData[d]) groupedData[d] = [];
    groupedData[d].push(g);
  });

  // Convert to array of objects
  const scheduleData = Object.keys(groupedData).map(dateStr => {
    // Attempt to parse date for display, but fallback to raw string if it's like "2024"
    let formattedDate = dateStr.toUpperCase();
    if (formattedDate.includes(" ")) {
       const parts = formattedDate.split(" ");
       if (parts.length >= 2) formattedDate = `${parts[0].substring(0,3)}\n${parts[1]}\n${parts[2] || ''}`;
    }
    
    return {
      date: formattedDate,
      items: groupedData[dateStr]
    };
  });

  return (
    <main className={`container ${styles.scheduleLayout} animate-fade-in`}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <button 
          className={`${styles.sidebarLink} ${activeSidebar === "Released" ? styles.activeLink : ""}`}
          onClick={() => setActiveSidebar("Released")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          Released
        </button>
        <button 
          className={`${styles.sidebarLink} ${activeSidebar === "Upcoming" ? styles.activeLink : ""}`}
          onClick={() => setActiveSidebar("Upcoming")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          Upcoming
        </button>
        <button 
          className={`${styles.sidebarLink} ${activeSidebar === "Announced" ? styles.activeLink : ""}`}
          onClick={() => setActiveSidebar("Announced")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Announced
        </button>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Pills */}
        <div className={styles.pills}>
          {["All", "Games", "Events"].map(pill => (
            <button 
              key={pill}
              className={`${styles.pill} ${activePill === pill ? styles.activePill : ""}`}
              onClick={() => setActivePill(pill)}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Schedule Rows */}
        <div className={styles.scheduleRows}>
          {scheduleData.length === 0 ? (
            <div style={{ padding: '4rem 0', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
              No games found for this category.
            </div>
          ) : (
            scheduleData.map((row, i) => (
              <div key={i} className={styles.row}>
                <div className={styles.dateBlock} style={{ whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                  {row.date.split('\n').map((line, idx) => (
                    <span key={idx} className={idx === 1 ? styles.dateNum : styles.dateText}>{line}</span>
                  ))}
                </div>
                <div className={styles.cardsGrid}>
                  {row.items.map((item, j) => (
                    <Link href={`/game/${item.id}`} key={j} className={styles.card}>
                      <div className={styles.cardPoster} style={item.posterImage ? { backgroundImage: `url(${item.posterImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}></div>
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                      <p className={styles.cardType}>{item.status} • {item.releaseDate}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
