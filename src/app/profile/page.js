"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useProfile } from '@/context/ProfileContext';
import { useGames } from '@/context/GameContext';
import styles from './page.module.css';

export default function ProfilePage() {
  const { profile: profileData, isLoggedIn } = useProfile();
  const { games } = useGames();
  const fallbackUsername = profileData?.email ? profileData.email.split('@')[0] : "Anonymous";
  const currentUser = (isLoggedIn && profileData?.username) ? profileData.username : (profileData?.name ? profileData.name.replace(/\s+/g, '').toLowerCase() : fallbackUsername);
  
  const [activeTab, setActiveTab] = useState('Reviews');
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list');
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedReviews, setLikedReviews] = useState({});
  const [commentedReviews, setCommentedReviews] = useState({});
  
  const toggleLike = (id) => {
    setLikedReviews(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleComment = (id) => {
    setCommentedReviews(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const filters = ['All', 'Skip', 'Timepass', 'Go for it', 'Perfection'];
  
  // Dynamic Real Data from Firestore games collection
  const userReviewsRaw = games.flatMap(g => 
    (g.reviewsList || []).filter(r => r.author === `@${currentUser}`).map(r => ({
      id: r.date + g.id,
      title: g.title,
      type: 'Review',
      year: g.releaseDate ? g.releaseDate.split('-')[0] : 'N/A',
      timeAgo: r.date,
      rating: r.rating,
      text: r.content,
      likes: 0,
      comments: 0,
      posterGradient: 'linear-gradient(135deg, #22d3ee, #0ea5e9)' // placeholder gradient
    }))
  );

  const filteredReviews = userReviewsRaw.filter(rev => 
    activeFilter === 'All' || rev.rating.toLowerCase() === activeFilter.toLowerCase()
  );

  const interestedGames = games.filter(g => (g.interestedUsers || []).includes(currentUser));
  const collectionGames = games.filter(g => (g.collectionUsers || []).includes(currentUser));

  return (
    <main className={styles.profileLayout}>
      {/* Left Sidebar - Profile Card */}
      <aside className={styles.leftSidebar}>
        <div className={styles.profileCard}>
          <div className={styles.avatarHeader} style={{ background: profileData.avatarBg || '#334155' }}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatarImg} style={profileData.avatarUrl ? { background: `url(${profileData.avatarUrl}) center/cover` } : {}}>
                {!profileData.avatarUrl && profileData.initials && <span className={styles.avatarInitials}>{profileData.initials}</span>}
              </div>
            </div>
          </div>
          
          <div className={styles.profileInfo}>
            <h1 className={styles.userName}>
              {profileData.name}
              {profileData.verified && (
                <svg className={styles.verifiedIcon} width="16" height="16" viewBox="0 0 24 24" fill="#1da1f2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              )}
            </h1>
            <p className={styles.userHandle}>@{profileData.username}</p>
            
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{userReviewsRaw.length}</span>
                <span className={styles.statLabel}>Reviews<br/>Posted</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{collectionGames.length}</span>
                <span className={styles.statLabel}>Public<br/>Collections</span>
              </div>
            </div>
            
            <div className={styles.socialStats}>
              <div className={styles.socialStat}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>{isFollowing ? '26.5 K' : profileData.followers} Followers</span>
              </div>
              <div className={styles.socialStat}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>Joined {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}</span>
              </div>
            </div>
            
            <div className={styles.socialIcons}>
              {profileData.instagram && (
                <a href={profileData.instagram} target="_blank" rel="noopener noreferrer" style={{color: 'inherit'}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
              {profileData.twitter && (
                <a href={profileData.twitter} target="_blank" rel="noopener noreferrer" style={{color: 'inherit'}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                </a>
              )}
              {profileData.youtube && (
                <a href={profileData.youtube} target="_blank" rel="noopener noreferrer" style={{color: 'inherit'}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"></polygon></svg>
                </a>
              )}
            </div>
            
            <Link href="/accounts/edit" className={styles.editProfileBtn}>
              Edit Profile
            </Link>
          </div>
        </div>
      </aside>

      {/* Middle Column - Feed */}
      <section className={styles.mainFeed}>
        <div className={styles.feedTabs}>
          <button 
            className={`${styles.feedTab} ${activeTab === 'Reviews' ? styles.feedTabActive : ''}`}
            onClick={() => setActiveTab('Reviews')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Reviews
          </button>
          <button 
            className={`${styles.feedTab} ${activeTab === 'Collections' ? styles.feedTabActive : ''}`}
            onClick={() => setActiveTab('Collections')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            Collections
          </button>
        </div>

        {activeTab === 'Reviews' && (
          <div className={styles.feedContent}>
            <div className={styles.filterToolbar}>
              <div className={styles.filterPills}>
                {filters.map(filter => (
                  <button 
                    key={filter}
                    className={`${styles.filterPill} ${activeFilter === filter ? styles.filterPillActive : ''}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className={styles.viewToggles}>
                <button 
                  className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </button>
                <button 
                  className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </button>
                <button className={styles.searchBtn}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </div>
            </div>

            <div className={`${styles.reviewsList} ${viewMode === 'grid' ? styles.reviewsGrid : ''}`}>
              {filteredReviews.map(review => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewPoster} style={{background: review.posterGradient}}>
                    <span className={styles.posterTitle}>{review.title}</span>
                  </div>
                  <div className={styles.reviewContent}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewTitleBlock}>
                        <h3 className={styles.reviewTitle}>{review.title}</h3>
                        <p className={styles.reviewMeta}>{review.type} • {review.year} • {review.timeAgo}</p>
                      </div>
                      <span className={`${styles.ratingPill} ${styles['rating' + review.rating.replace(/\s+/g, '')]}`}>
                        {review.rating}
                      </span>
                    </div>
                    <p className={styles.reviewText}>{review.text}</p>
                    <div className={styles.reviewFooter}>
                      <div className={styles.reviewActions}>
                        <button 
                          className={styles.actionBtn}
                          style={{ color: likedReviews[review.id] ? '#ef4444' : 'var(--text-dim)' }}
                          onClick={() => toggleLike(review.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill={likedReviews[review.id] ? "#ef4444" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                          {review.likes + (likedReviews[review.id] ? 1 : 0)}
                        </button>
                        <button 
                          className={styles.actionBtn}
                          style={{ color: commentedReviews[review.id] ? '#3b82f6' : 'var(--text-dim)' }}
                          onClick={() => toggleComment(review.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill={commentedReviews[review.id] ? "#3b82f6" : "none"} stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                          {review.comments + (commentedReviews[review.id] ? 1 : 0)}
                        </button>
                      </div>
                      <button className={styles.moreOptionsBtn}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Collections' && (
          <div className={styles.feedContent}>
            <div className={styles.reviewsList} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
              {collectionGames.length === 0 ? (
                <p style={{ color: 'var(--text-dim)' }}>No games in your collection yet.</p>
              ) : (
                collectionGames.map(game => (
                  <Link href={`/game/${game.id}`} key={game.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className={styles.reviewCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className={styles.reviewPoster} style={{ height: '280px', backgroundImage: game.posterImage || game.posterUrl ? `url(${game.posterImage || game.posterUrl})` : 'none', backgroundColor: '#334155', backgroundSize: 'cover', backgroundPosition: 'center', width: '100%' }}>
                        {!game.posterImage && !game.posterUrl && <span className={styles.posterTitle}>{game.title}</span>}
                      </div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{game.title}</h4>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* Right Sidebar - Interested In */}
      <aside className={styles.rightSidebar}>
        <div className={styles.interestedCard}>
          <h3 className={styles.interestedTitle}>Interested In</h3>
          <div className={styles.interestedList}>
            {interestedGames.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Not interested in any games yet.</p>
            ) : (
              interestedGames.map(game => (
                <Link href={`/game/${game.id}`} key={game.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className={styles.interestedItem}>
                    <div className={styles.interestedPoster} style={{ backgroundImage: game.posterImage || game.posterUrl ? `url(${game.posterImage || game.posterUrl})` : 'none', backgroundColor: '#334155', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      {!game.posterImage && !game.posterUrl && <span className={styles.iPosterTitle}>{game.title}</span>}
                    </div>
                    <div className={styles.interestedInfo}>
                      <h4 className={styles.iTitle}>{game.title}</h4>
                      <p className={styles.iDate}>{game.releaseDate || 'TBA'}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </aside>
    </main>
  );
}
