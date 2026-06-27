"use client";

import { useState } from 'react';
import { useGames } from '@/context/GameContext';
import styles from './page.module.css';

export default function Spaces() {
  const { activityFeed } = useGames();
  const [activeSidebar, setActiveSidebar] = useState("Feed");
  const [topics, setTopics] = useState([
    { name: "FPS", active: true },
    { name: "RPG", active: true },
    { name: "Anime", active: true },
    { name: "Sports", active: false },
    { name: "Indie", active: true }
  ]);

  const toggleTopic = (index) => {
    const newTopics = [...topics];
    newTopics[index].active = !newTopics[index].active;
    setTopics(newTopics);
  };

  // If no activity feed, show a fallback
  const feed = activityFeed || [];

  return (
    <main className={`container ${styles.spacesLayout} animate-fade-in`}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.navGroup}>
          <button 
            className={`${styles.sidebarLink} ${activeSidebar === "Feed" ? styles.activeLink : ""}`}
            onClick={() => setActiveSidebar("Feed")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Feed
          </button>
          <button 
            className={`${styles.sidebarLink} ${activeSidebar === "Discussion" ? styles.activeLink : ""}`}
            onClick={() => setActiveSidebar("Discussion")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            Discussion
          </button>
        </div>

        <div className={styles.topicsGroup}>
          <h4 className={styles.topicsTitle}>TOPICS</h4>
          {topics.map((topic, i) => (
            <label key={i} className={styles.topicLabel} onClick={() => toggleTopic(i)}>
              <div className={`${styles.checkbox} ${topic.active ? styles.checked : ''}`}>
                {topic.active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
              </div>
              <span>{topic.name}</span>
            </label>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.mainFeed}>
        {feed.length === 0 ? (
          <div style={{ padding: '4rem 0', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
            No activity yet. Go post a review on a game!
          </div>
        ) : (
          feed.map((post, i) => (
            <div key={post.id || i} className={styles.feedCard} style={{ padding: '2rem' }}>
              <div className={styles.cardContent} style={{ padding: 0 }}>
                <div className={styles.tag} style={{ 
                  color: post.rating === 'Perfection' ? '#a855f7' : post.rating === 'Go for it' ? '#00e676' : post.rating === 'Timepass' ? '#ffb703' : '#ff4d6d' 
                }}>
                  {post.tag} {post.rating ? `• ${post.rating}` : ''}
                </div>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <p className={styles.postMeta}>By {post.author} • {post.time}</p>
                <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                  "{post.content}"
                </p>
                
                <button className={styles.chatBtn} style={{ marginTop: '1.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
