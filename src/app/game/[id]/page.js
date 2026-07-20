"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useGames } from '@/context/GameContext';
import { useProfile } from '@/context/ProfileContext';
import styles from './page.module.css';

export default function GameDetails() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { games, addReview, deleteReview, editReview, addReply, deleteReply, toggleInterested, toggleCollection, deleteGame } = useGames();
  const { profile, isLoggedIn, addNotification } = useProfile();
  const game = games.find(g => g.id === id);
  
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeVideoTab, setActiveVideoTab] = useState('Announcement');
  const [rating, setRating] = useState('Go for it');
  const [reviewText, setReviewText] = useState('');
  const [hoveredMeter, setHoveredMeter] = useState(null);
  const [hoveredVibe, setHoveredVibe] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [editText, setEditText] = useState('');

  // Derived state from global context
  const fallbackUsername = profile?.email ? profile.email.split('@')[0] : "Anonymous";
  const currentUser = (isLoggedIn && profile?.username) ? profile.username : (profile?.name ? profile.name.replace(/\s+/g, '').toLowerCase() : fallbackUsername);
  const reviewsList = game?.reviewsList || [];
  const played = game?.interestedUsers?.includes(currentUser) || false;
  const inCollection = game?.collectionUsers?.includes(currentUser) || false;

  if (!game) {
    return (
      <main className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <h2>Title Not Found</h2>
        <Link href="/" className={styles.backBtn} style={{ marginTop: '2rem', display: 'inline-flex' }}>Back to Explore</Link>
      </main>
    );
  }

  const overview = game.overview || game.description;
  const rawTags = game.tags || game.genres || [];
  const tags = Array.isArray(rawTags) ? rawTags : (typeof rawTags === 'string' ? rawTags.split(',').map(t => t.trim()) : []);
  const developer = game.developer || "Unknown";
  const publisher = game.publisher || "Unknown";
  const language = game.language || "English";
  const ageRating = game.ageRating || "18+";
  
  let firstPlatform = "Platform";
  if (Array.isArray(game.platforms) && game.platforms.length > 0) firstPlatform = game.platforms[0];
  else if (typeof game.platforms === 'string') firstPlatform = game.platforms.split(',')[0].trim();
  
  const showMeta = game.showMeta || `${firstPlatform} • ${game.releaseDate}`;
  
  const rawScreenshots = game.screenshots || [];
  const screenshots = Array.isArray(rawScreenshots) ? rawScreenshots : (typeof rawScreenshots === 'string' ? rawScreenshots.split(',').map(t => t.trim()) : []);
  const dlcs = game.dlcs || game.seasons || [
    { name: `${game.title} - ${game.gameType || "Standard Edition"}`, meta: game.gameType || "Base Game", reviews: `${reviewsList.length} Reviews`, progress: 0, color: "#a855f7" }
  ];
  
  const vibeChart = game.vibes ? [
    { label: "Gameplay", value: game.vibes.gameplay * 10, color: "#3b82f6" },
    { label: "Graphics", value: game.vibes.graphics * 10, color: "#ef4444" },
    { label: "Story", value: game.vibes.story * 10, color: "#a855f7" },
    { label: "Audio", value: game.vibes.audio * 10, color: "#10b981" },
    { label: "Replayability", value: game.vibes.replayability * 10, color: "#f59e0b" }
  ] : [
    { label: "Gameplay", value: 80, color: "#3b82f6" },
    { label: "Graphics", value: 90, color: "#ef4444" },
    { label: "Story", value: 70, color: "#a855f7" }
  ];
  
  const calculateMeter = () => {
    if (!reviewsList || reviewsList.length === 0) {
      return { score: 0, votes: "0 Votes", breakdown: { skip: 0, timepass: 0, goForIt: 0, perfection: 0 } };
    }
    const total = reviewsList.length;
    let skip = 0, timepass = 0, goForIt = 0, perfection = 0;
    
    reviewsList.forEach(r => {
      if (r.rating === 'Skip') skip++;
      else if (r.rating === 'Timepass') timepass++;
      else if (r.rating === 'Go for it') goForIt++;
      else if (r.rating === 'Perfection') perfection++;
    });

    const skipPct = Math.round((skip / total) * 100) || 0;
    const timepassPct = Math.round((timepass / total) * 100) || 0;
    const goForItPct = Math.round((goForIt / total) * 100) || 0;
    const perfectionPct = Math.round((perfection / total) * 100) || 0;
    
    const score = goForItPct + perfectionPct;

    return {
      score,
      votes: `${total} Vote${total !== 1 ? 's' : ''}`,
      breakdown: { skip: skipPct, timepass: timepassPct, goForIt: goForItPct, perfection: perfectionPct }
    };
  };

  const meter = calculateMeter();

  const getStorefronts = (platforms) => {
    if (!platforms || platforms.length === 0) return [];
    const stores = [];
    const pStr = (Array.isArray(platforms) ? platforms.join(' ') : String(platforms)).toLowerCase();
    const encodedTitle = encodeURIComponent(game.title);
    
    if (pStr.includes('ps4') || pStr.includes('ps5') || pStr.includes('playstation')) {
      stores.push({ name: 'PlayStation Store', meta: 'Digital Download', url: `https://store.playstation.com/en-us/search/${encodedTitle}` });
    }
    if (pStr.includes('xbox')) {
      stores.push({ name: 'Xbox Store', meta: 'Digital Download', url: `https://www.xbox.com/en-US/Search?q=${encodedTitle}` });
    }
    if (pStr.includes('pc') || pStr.includes('windows')) {
      stores.push({ name: 'Steam', meta: 'PC Download', url: `https://store.steampowered.com/search/?term=${encodedTitle}` });
    }
    if (pStr.includes('nintendo') || pStr.includes('switch')) {
      stores.push({ name: 'Nintendo eShop', meta: 'Digital Download', url: `https://www.nintendo.com/search/?q=${encodedTitle}` });
    }
    if (pStr.includes('android') || pStr.includes('mobile')) {
      stores.push({ name: 'Google Play', meta: 'Mobile App', url: `https://play.google.com/store/search?q=${encodedTitle}&c=apps` });
    }
    if (pStr.includes('ios') || pStr.includes('apple') || pStr.includes('mac')) {
      stores.push({ name: 'App Store', meta: 'Mobile App', url: `https://www.apple.com/us/search/${encodedTitle}` });
    }
    
    if (stores.length === 0) {
      stores.push({ name: 'Official Store', meta: 'Digital Download', url: `https://www.google.com/search?q=${encodedTitle}+game+buy` });
    }
    return stores;
  };

  const storeFronts = getStorefronts(game.platforms);

  const handlePostReview = () => {
    if (!reviewText.trim()) return;
    const newReview = {
      author: isLoggedIn ? `@${currentUser}` : "Guest",
      date: "Just now",
      rating: rating,
      content: reviewText
    };
    addReview(game.id, newReview);
    setReviewText('');
  };

  const handlePostReply = (r) => {
    if (!replyText.trim()) return;
    const author = isLoggedIn ? `@${currentUser}` : "Guest";
    addReply(game.id, r, replyText, author);
    
    // Trigger Notification for the original review author
    if (r.author !== `@${currentUser}` && r.author !== "Guest") {
      addNotification(r.author, {
        title: `${currentUser} replied to your review on ${game.title}`,
        type: 'activity'
      });
    }

    setReplyText('');
    setReplyingTo(null);
  };

  const handleSaveEdit = (r) => {
    if (!editText.trim()) return;
    editReview(game.id, r, editText);
    setEditingReview(null);
    setEditText('');
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to permanently delete ${game.title}?`)) {
      await deleteGame(game.id);
      router.push('/');
    }
  };

  const createSegmentArc = (startPercent, endPercent, radius = 38, strokeWidth = 8, gap = 2) => {
    if (endPercent - startPercent <= 0) return "";
    
    // Convert cap length to percent of semicircle
    const capPercent = ((strokeWidth / 2) / (Math.PI * radius)) * 100;
    
    let actualStart = startPercent + (startPercent === 0 ? 0 : (gap/2 + capPercent));
    let actualEnd = endPercent - (endPercent === 100 ? 0 : (gap/2 + capPercent));
    
    if (actualEnd <= actualStart) {
       const mid = (startPercent + endPercent) / 2;
       actualStart = mid - 0.01;
       actualEnd = mid + 0.01;
    }

    const startAngle = (180 + actualStart * 1.8) * (Math.PI / 180);
    const endAngle = (180 + actualEnd * 1.8) * (Math.PI / 180);
    const cx = 50;
    const cy = 44; // Placed lower to fit top stroke
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  };

  let currentVibePercent = 0;

  const getEmbedUrl = (urlOrId) => {
    if (!urlOrId) return "https://www.youtube.com/embed/QdBZY2fkU-0?autoplay=1&mute=1";
    if (urlOrId.includes('youtube.com/embed')) return urlOrId;
    if (urlOrId.includes('youtube.com/watch?v=')) {
      return `https://www.youtube.com/embed/${urlOrId.split('v=')[1].split('&')[0]}?autoplay=1&mute=1`;
    }
    if (urlOrId.includes('youtu.be/')) {
      return `https://www.youtube.com/embed/${urlOrId.split('youtu.be/')[1].split('?')[0]}?autoplay=1&mute=1`;
    }
    // Assume it's a raw ID
    return `https://www.youtube.com/embed/${urlOrId}?autoplay=1&mute=1`;
  };

  return (
    <main className={styles.detailsLayout}>
      {videoOpen && (
        <div className={styles.videoOverlay} onClick={() => setVideoOpen(false)}>
          <button className={styles.closeVideoBtn} onClick={() => setVideoOpen(false)}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div className={styles.videoModalWrapper} onClick={e => e.stopPropagation()}>
            <div className={styles.videoContainer}>
              <iframe 
                width="100%" 
                height="100%" 
                src={getEmbedUrl(game.trailerUrl)} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <section 
        className={styles.hero} 
        style={game.heroUrl || game.heroImage ? { backgroundImage: `url(${game.heroUrl || game.heroImage})` } : {}}
      >
        <div className={styles.heroGradient}></div>
        {game.trailerUrl && (
          <button className={styles.playTrailerBtn} onClick={() => setVideoOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
        )}
      </section>

      {/* Main Content Area */}
      <section className={`container ${styles.contentContainer}`}>
        
        {/* Header Metadata Block */}
        <div className={styles.headerBlock}>
          <div className={styles.posterContainer}>
            <div className={styles.poster} style={game.posterUrl || game.posterImage ? { backgroundImage: `url(${game.posterUrl || game.posterImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
              {!(game.posterUrl || game.posterImage) && <div className={styles.posterTag}>{game.title}</div>}
            </div>
          </div>
          
          <div className={styles.metaInfo}>
            <p className={styles.showMeta}>{showMeta}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h1 className={styles.title}>{game.title}</h1>
              {profile?.isAdmin && (
                <button 
                  onClick={handleDelete}
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.2)', 
                    color: '#ef4444', 
                    border: '1px solid rgba(239, 68, 68, 0.5)', 
                    padding: '8px 16px', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginLeft: '16px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  Delete Game
                </button>
              )}
            </div>
            
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Developer</span>
                <span className={styles.detailValue}>{developer}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Publisher</span>
                <span className={styles.detailValue}>{publisher}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Language</span>
                <span className={styles.detailValue}>{language}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Age Rating</span>
                <span className={styles.detailValue}>{ageRating}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.actions}>
            {game.status === 'Upcoming' ? (
              <button 
                className={styles.interestedBtn} 
                onClick={() => toggleInterested(game.id, currentUser)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.5 0-6 0 0-3 3-3 7 0 1.25.5 2.5 1.5 4.5z"></path>
                  <path d="M11 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C5 11.1 4 13 4 15a7 7 0 0 0 7 7z"></path>
                </svg>
                {played ? 'Interested!' : 'Mark as Interested'}
              </button>
            ) : (
              <button 
                className={styles.primaryActionBtn} 
                onClick={() => toggleInterested(game.id, currentUser)}
                style={{ backgroundColor: played ? '#22c55e' : '#a855f7' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {played ? <polyline points="20 6 9 17 4 12"></polyline> : <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>}
                </svg>
                {played ? 'Played' : 'Mark as Played'}
              </button>
            )}
            <button 
              className={styles.secondaryActionBtn}
              onClick={() => toggleCollection(game.id, currentUser)}
              style={{ backgroundColor: inCollection ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={inCollection ? "white" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              {inCollection ? 'In Collection' : 'Add to Collection'}
            </button>
          </div>
        </div>

        <div className={styles.twoColumnLayout}>
          <div className={styles.leftCol}>
            
            {/* Overview */}
            <div className={styles.overviewSection}>
              <h2 className={styles.sectionTitle}>Overview</h2>
              <p className={styles.overviewText}>{overview}</p>
              <div className={styles.tagsContainer}>
                {tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Screenshots Gallery */}
            {screenshots && screenshots.length > 0 && (
              <div className={styles.screenshotsSection}>
                <h2 className={styles.sectionTitle}>Screenshots</h2>
                <div className={styles.screenshotsGallery}>
                  {screenshots.map((url, i) => (
                    <div key={i} className={styles.screenshotCard}>
                      <img src={url} alt={`Screenshot ${i + 1}`} className={styles.screenshotImg} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DLCs removed per user request */}

            {/* Arcade Room Meter */}
            <div className={styles.meterSection}>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.sectionTitle}>Arcade Room Meter</h2>
              </div>
              <div className={styles.meterContainer}>
                {(() => {
                  const { skip, timepass, goForIt, perfection } = meter.breakdown;
                  const segments = [
                    { name: 'skip', label: 'Skip', value: skip, color: '#ff4d6d' },
                    { name: 'timepass', label: 'Timepass', value: timepass, color: '#ffb703' },
                    { name: 'goForIt', label: 'Go for it', value: goForIt, color: '#00e676' },
                    { name: 'perfection', label: 'Perfection', value: perfection, color: '#a855f7' }
                  ];
                  let currentP = 0;
                  
                  const displayScore = hoveredMeter ? hoveredMeter.value : meter.score;
                  const displayColor = hoveredMeter ? hoveredMeter.color : '#00e676';
                  
                  return (
                    <>
                      <div className={styles.gaugeContainer}>
                        <svg viewBox="0 0 100 50" className={styles.gaugeSvg}>
                          {(() => {
                            const radius = 38;
                            const strokeWidth = 8;
                            const C = 2 * Math.PI * radius;
                            const L = Math.PI * radius;
                            
                            const activeSegments = segments.filter(s => s.value > 0);
                            const numGaps = activeSegments.length > 0 ? activeSegments.length - 1 : 0;
                            const gapSize = 3;
                            const totalGaps = numGaps * gapSize;
                            const availableL = L - totalGaps;
                            
                            const visualLengths = activeSegments.map(s => ({ ...s, vLen: (s.value / 100) * availableL }));
                            
                            let excess = 0;
                            visualLengths.forEach(s => {
                              if (s.vLen < strokeWidth) {
                                excess += (strokeWidth - s.vLen);
                                s.vLen = strokeWidth;
                              }
                            });
                            
                            if (excess > 0) {
                              const largest = visualLengths.reduce((prev, current) => (prev.vLen > current.vLen) ? prev : current);
                              largest.vLen -= excess;
                            }
                            
                            let currentVisualPos = 0;
                            
                            return visualLengths.map(seg => {
                              const vStart = currentVisualPos;
                              const vEnd = currentVisualPos + seg.vLen;
                              currentVisualPos = vEnd + gapSize;
                              
                              const geoStart = vStart + strokeWidth / 2;
                              let dashLength = seg.vLen - strokeWidth;
                              if (dashLength <= 0) dashLength = 0.001; // ensure round caps render for tiny segments
                              
                              const startAngle = Math.PI + (geoStart / radius);
                              const endAngle = Math.PI + ((geoStart + dashLength) / radius);
                              
                              const cx = 50;
                              const cy = 44;
                              const x1 = cx + radius * Math.cos(startAngle);
                              const y1 = cy + radius * Math.sin(startAngle);
                              const x2 = cx + radius * Math.cos(endAngle);
                              const y2 = cy + radius * Math.sin(endAngle);
                              
                              const isHovered = hoveredMeter && hoveredMeter.name === seg.name;
                              const currentStrokeWidth = isHovered ? strokeWidth + 4 : strokeWidth;
                              
                              const hoverStyle = {
                                opacity: hoveredMeter && !isHovered ? 0.3 : 1,
                                cursor: 'pointer',
                                transition: 'opacity 0.2s ease, stroke-width 0.2s ease, filter 0.2s ease',
                                filter: isHovered ? `drop-shadow(0px 0px 6px ${seg.color})` : 'none'
                              };
                              
                              if (dashLength < 0.1) {
                                const midAngle = Math.PI + ((geoStart + dashLength / 2) / radius);
                                const midX = cx + radius * Math.cos(midAngle);
                                const midY = cy + radius * Math.sin(midAngle);
                                return (
                                  <circle 
                                    key={seg.name}
                                    cx={midX}
                                    cy={midY}
                                    r={currentStrokeWidth / 2}
                                    fill={seg.color}
                                    onMouseEnter={() => setHoveredMeter(seg)}
                                    onMouseLeave={() => setHoveredMeter(null)}
                                    style={hoverStyle}
                                  />
                                );
                              }
                              
                              const d = `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
                              
                              return (
                                <path 
                                  key={seg.name}
                                  d={d}
                                  fill="none"
                                  stroke={seg.color}
                                  strokeWidth={currentStrokeWidth}
                                  strokeLinecap="round"
                                  onMouseEnter={() => setHoveredMeter(seg)}
                                  onMouseLeave={() => setHoveredMeter(null)}
                                  style={hoverStyle}
                                />
                              );
                            });
                          })()}
                        </svg>
                        <div className={styles.gaugeText}>
                          <span className={styles.gaugeScore} style={{color: displayColor}}>{displayScore}%</span>
                          <span className={styles.gaugeVotes} style={{color: '#ccc', fontSize: '0.9rem'}}>{meter.votes}</span>
                        </div>
                      </div>
                      
                      <div className={styles.meterLegend}>
                        {segments.map(seg => (
                          <div 
                            key={seg.name} 
                            className={styles.legendItem}
                            onMouseEnter={() => setHoveredMeter(seg)}
                            onMouseLeave={() => setHoveredMeter(null)}
                            style={{
                              opacity: hoveredMeter && hoveredMeter.name !== seg.name ? 0.4 : 1,
                              cursor: 'pointer',
                              transition: 'opacity 0.2s ease'
                            }}
                          >
                            <span style={{backgroundColor: seg.color}}></span> {seg.label} {seg.value}%
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Reviews */}
            <div className={styles.reviewsSection}>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.sectionTitle}>Reviews</h2>
              </div>

              <div className={styles.reviewInputBox}>
                <div className={styles.reviewInputHeader}>
                  <div className={styles.reviewerMeta}>
                    <div className={styles.reviewerAvatar}>
                      {isLoggedIn ? (profile.initials || profile.username.substring(0, 2).toUpperCase()) : "G"}
                    </div>
                    <span className={styles.reviewerName}>
                      {isLoggedIn ? (profile.name || `@${profile.username}`) : "Guest"}
                    </span>
                  </div>
                  <div className={styles.ratingPills}>
                    {['Skip', 'Timepass', 'Go for it', 'Perfection'].map(r => (
                      <button 
                        key={r} 
                        className={`${styles.ratingPill} ${rating === r ? styles.ratingPillActive : ''}`}
                        onClick={() => setRating(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea 
                  className={styles.textarea} 
                  placeholder="Write your review here..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                ></textarea>
                <div className={styles.reviewInputFooter}>
                  <span className={styles.charCount}>{reviewText.length}/1000</span>
                  <button className={styles.postReviewBtn} onClick={handlePostReview}>Post</button>
                </div>
              </div>

              <div className={styles.reviewsList}>
                {reviewsList.map((r, i) => (
                  <div key={i} className={styles.reviewItem}>
                    <div className={styles.reviewItemHeader}>
                      <div className={styles.reviewerPic}></div>
                      <div className={styles.reviewerInfo}>
                        <span className={styles.revAuthor}>{r.author}</span>
                        <span className={styles.revDate}>{r.date} {r.edited && '(edited)'}</span>
                      </div>
                      <span className={`${styles.ratingPill} ${styles['rating' + r.rating.replace(/\s+/g, '')]}`}>{r.rating}</span>
                    </div>
                    {editingReview === i ? (
                      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <textarea 
                          value={editText} 
                          onChange={e => setEditText(e.target.value)} 
                          style={{ width: '100%', minHeight: '80px', padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleSaveEdit(r)} style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#22c55e', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                          <button onClick={() => setEditingReview(null)} style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className={styles.reviewText}>"{r.content}"</p>
                    )}
                    
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button 
                        onClick={() => setReplyingTo(replyingTo === i ? null : i)}
                        style={{color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: '0', fontWeight: 'bold'}}
                      >
                        {replyingTo === i ? 'Cancel Reply' : 'Reply'}
                      </button>
                      {(r.author === `@${currentUser}` || profile?.isAdmin) && (
                        <>
                          {r.author === `@${currentUser}` && (
                            <button 
                              onClick={() => {
                                setEditingReview(i);
                                setEditText(r.content);
                                setReplyingTo(null);
                              }}
                              style={{color: '#eab308', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: '0', fontWeight: 'bold'}}
                            >
                              Edit
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this review?")) {
                                deleteReview(game.id, r);
                              }
                            }} 
                            style={{color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: '0', fontWeight: 'bold'}}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                    
                    {/* Reply Input Box */}
                    {replyingTo === i && (
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="text" 
                          value={replyText} 
                          onChange={e => setReplyText(e.target.value)} 
                          placeholder="Write a reply..." 
                          style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                        />
                        <button 
                          onClick={() => handlePostReply(r)}
                          style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#eab308', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Post
                        </button>
                      </div>
                    )}

                    {/* Nested Replies List */}
                    {r.replies && r.replies.length > 0 && (
                      <div style={{ marginTop: '1.5rem', marginLeft: '2rem', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {r.replies.map(reply => (
                          <div key={reply.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'white' }}>{reply.author}</span>
                              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{reply.date}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{reply.text}</p>
                            {(reply.author === `@${currentUser}` || profile?.isAdmin) && (
                              <button 
                                onClick={() => {
                                  if (confirm("Delete this reply?")) deleteReply(game.id, r, reply.id);
                                }}
                                style={{color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.75rem', marginTop: '0.5rem', padding: '0'}}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className={styles.rightCol}>
            
            {/* Vibe Chart */}
            <div className={styles.sidebarCard}>
              <h3 className={styles.cardTitle}>Vibe Chart</h3>
              <div className={styles.doughnutContainer}>
                {(() => {
                  const displayVibe = hoveredVibe || vibeChart[0];
                  return (
                    <>
                      <svg viewBox="0 0 100 100" className={styles.doughnutSvg}>
                        {(() => {
                          const radius = 40;
                          const strokeWidth = 12;
                          const C = 2 * Math.PI * radius;
                          
                          const activeSegments = vibeChart.filter(s => s.value > 0);
                          const numGaps = activeSegments.length;
                          const gapSize = 1.5;
                          const totalGaps = numGaps * gapSize;
                          const availableL = C - totalGaps;
                          
                          const totalScore = activeSegments.reduce((sum, s) => sum + s.value, 0);
                          let currentPos = 0;
                          
                          return activeSegments.map(seg => {
                            const length = (seg.value / totalScore) * availableL;
                            const dasharray = `${length} ${C - length}`;
                            const dashoffset = -currentPos;
                            currentPos += length + gapSize;
                            
                            const isHovered = hoveredVibe && hoveredVibe.label === seg.label;
                            const currentStrokeWidth = isHovered ? strokeWidth + 6 : strokeWidth;
                            
                            return (
                              <circle 
                                key={seg.label}
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth={currentStrokeWidth}
                                strokeLinecap="butt"
                                strokeDasharray={dasharray}
                                strokeDashoffset={dashoffset}
                                transform="rotate(-90 50 50)"
                                onMouseEnter={() => setHoveredVibe(seg)}
                                onMouseLeave={() => setHoveredVibe(null)}
                                style={{
                                  opacity: hoveredVibe && !isHovered ? 0.3 : 1,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  filter: isHovered ? `drop-shadow(0px 0px 8px ${seg.color})` : 'none'
                                }}
                              />
                            );
                          });
                        })()}
                      </svg>
                      <div className={styles.doughnutCenterText} style={{pointerEvents: 'none'}}>
                        <span className={styles.dTextTop}>{displayVibe.label}</span>
                        <span className={styles.dTextBottom}>{displayVibe.value}%</span>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className={styles.vibeLegend}>
                {vibeChart.map((vibe, i) => (
                  <div 
                    key={i} 
                    className={styles.vibeLegendItem}
                    onMouseEnter={() => setHoveredVibe(vibe)}
                    onMouseLeave={() => setHoveredVibe(null)}
                    style={{
                      opacity: hoveredVibe && hoveredVibe.label !== vibe.label ? 0.3 : 1,
                      cursor: 'pointer',
                      transition: 'opacity 0.2s ease'
                    }}
                  >
                    <div className={styles.vibeName}>
                      <span className={styles.vibeDot} style={{backgroundColor: vibe.color}}></span>
                      {vibe.label}
                    </div>
                    <span className={styles.vibeValue}>{vibe.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available On */}
            <div className={styles.sidebarCard}>
              <h3 className={styles.cardTitle}>Available On</h3>
              {storeFronts.map((store, idx) => (
                <a 
                  key={idx}
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.watchProvider} 
                  style={{ display: 'flex', textDecoration: 'none', marginTop: idx > 0 ? '0.75rem' : '0' }} 
                >
                  <div className={styles.providerLogo}></div>
                  <div className={styles.providerInfo}>
                    <span className={styles.providerName}>{store.name}</span>
                    <span className={styles.providerMeta}>{store.meta}</span>
                  </div>
                </a>
              ))}
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}

