"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';
import { useGames } from '@/context/GameContext';
import { categoriesDb } from '@/data/mockDb';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout, markNotificationsRead } = useProfile();
  const { games, addGame } = useGames();
  const navRef = useRef(null);
  
  // Navigation states
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  
  // Notification states
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState('All');
  const [notifs, setNotifs] = useState([]);
  
  useEffect(() => {
    if (profile?.notifications) {
      setNotifs(profile.notifications);
    } else {
      setNotifs([]);
    }
  }, [profile]);
  
  // Search states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const fetchTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/igdb/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out games that are already in our local db just in case, or we can just show them
          // Actually, let's merge local results with IGDB results to prioritize local
          const localResults = games.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()));
          const localIds = localResults.map(g => g.id);
          
          const igdbResults = data.filter(game => !localIds.includes(game.id));
          
          setSearchResults([...localResults, ...igdbResults]);
          setSearchError(null);
        } else {
          const errData = await res.json();
          setSearchError(errData.error || 'Server error');
          setSearchResults([]);
        }
      } catch (err) {
        console.error("IGDB Search Error:", err);
        setSearchError('Network error');
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 500); // 500ms debounce
    
    return () => clearTimeout(fetchTimer);
  }, [searchQuery, games]);

  const handleCloseSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
  };

  const handleGameClick = async (game) => {
    // Check if it exists in local context first
    const exists = games.find(g => g.id === game.id);
    if (!exists) {
      await addGame(game);
    }
    handleCloseSearch();
    router.push(`/game/${game.id}`);
  };

  // Profile menu state
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const unreadCount = notifs.filter(n => !n.read).length;

  const navItems = [
    { href: "/", label: "Explore", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg> },
    { href: "/schedule", label: "Schedule", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
    { href: "/spaces", label: "Spaces", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg> },
    { href: "/watchlist", label: "Watchlist", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> },
    { href: "/collections", label: "Collections", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> }
  ];

  const updateIndicator = (element) => {
    if (element && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const elRect = element.getBoundingClientRect();
      setIndicatorStyle({
        left: elRect.left - navRect.left,
        width: elRect.width,
        opacity: 1
      });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      const activeElement = navRef.current?.querySelector(`.${styles.active}`);
      if (activeElement) {
        updateIndicator(activeElement);
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    }, 50);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleMouseEnter = (e) => updateIndicator(e.currentTarget);
  const handleMouseLeave = () => {
    const activeElement = navRef.current?.querySelector(`.${styles.active}`);
    if (activeElement) {
      updateIndicator(activeElement);
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
  };

  const markAllRead = () => {
    markNotificationsRead();
    // Optimistic UI update
    setNotifs(notifs.map(n => ({ ...n, read: true })));
  };

  const filteredNotifs = notifs.filter(n => notifTab === 'All' || n.type === notifTab.toLowerCase());

  if (pathname === '/login' || pathname === '/signup') return null;

  return (
    <>
      <header className={styles.header}>
        <div className={`container ${styles.navContainer}`}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>Arcade Room</span>
            <span className={styles.logoSubtext}>Gaming</span>
          </Link>
          
          <nav className={styles.navLinks} ref={navRef} onMouseLeave={handleMouseLeave}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isExplore = item.label === "Explore";
              
              return (
                <div 
                  key={item.href} 
                  className={styles.navItemContainer}
                >
                  <Link 
                    href={item.href} 
                    className={`${styles.link} ${isActive ? styles.active : ''}`}
                    onMouseEnter={handleMouseEnter}
                  >
                    {item.icon}
                    {isActive && <span>{item.label}</span>}
                  </Link>
                </div>
              );
            })}
            <div className={styles.magicLine} style={indicatorStyle} />
          </nav>
          
          <div className={styles.utilities}>
            <div className={styles.dropdownContainer}>
              <button className={styles.iconBtn} onClick={() => setNotifOpen(!notifOpen)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
              </button>
              
              {notifOpen && (
                <div className={styles.notifDropdown}>
                  <div className={styles.notifHeader}>
                    <h3>Notifications</h3>
                    <button className={styles.clearBtn} onClick={markAllRead} title="Mark all as read">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                  <div className={styles.notifTabs}>
                    {['All', 'Updates', 'Activity'].map(tab => (
                      <button 
                        key={tab}
                        className={`${styles.notifTab} ${notifTab === tab ? styles.activeNotifTab : ''}`}
                        onClick={() => setNotifTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className={styles.notifList}>
                    <h4 className={styles.notifSectionTitle}>Last 30 Days</h4>
                    {filteredNotifs.length > 0 ? filteredNotifs.map((n) => (
                      <div key={n.id} className={`${styles.notifItem} ${!n.read ? styles.notifUnread : ''}`}>
                        <div className={styles.notifImage}></div>
                        <div className={styles.notifContent}>
                          <p className={styles.notifText}><strong>{n.title}</strong></p>
                          <p className={styles.notifDate}>{n.date}</p>
                        </div>
                        {!n.read && <div className={styles.unreadDot}></div>}
                      </div>
                    )) : (
                      <p className={styles.emptyNotifs}>No notifications found.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button className={styles.iconBtn} onClick={() => setSearchOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
            <div className={styles.profileDropdownContainer}>
              <button 
                className={`${styles.profileBtn} ${profileMenuOpen ? styles.profileBtnActive : ''}`} 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div className={styles.avatar} style={profile.avatarUrl ? { background: `url(${profile.avatarUrl}) center/cover` } : {}}>
                  {!profile.avatarUrl ? (
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>{profile.initials}</span>
                  ) : null}
                </div>
              </button>
              
              {profileMenuOpen && (
                <div className={styles.profileMenu}>
                  <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: '600', color: 'white', fontSize: '0.95rem' }}>{profile.name || profile.username}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>@{profile.username}</div>
                  </div>
                  {profile.isAdmin && (
                    <Link href="/admin/create" className={styles.profileMenuItem} onClick={() => setProfileMenuOpen(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                      Admin Dashboard
                    </Link>
                  )}
                  <Link href="/profile" className={styles.profileMenuItem} onClick={() => setProfileMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    My Profile
                  </Link>
                  <Link href="/profile" className={styles.profileMenuItem} onClick={() => setProfileMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    My Reviews
                  </Link>
                  <Link href="/accounts/edit" className={styles.profileMenuItem} onClick={() => setProfileMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    Settings
                  </Link>
                  <div className={styles.profileMenuDivider} style={{borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '0.5rem 0'}}></div>
                  <button 
                    className={`${styles.profileMenuItem} ${styles.logoutItem}`} 
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className={styles.searchOverlay} onClick={handleCloseSearch}>
          <div className={styles.searchContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.searchHeader}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.searchIcon}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search games, spaces, and collections..." 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className={styles.closeSearchBtn} onClick={handleCloseSearch}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            {searchQuery && (
              <div className={styles.searchResults}>
                {isSearching ? (
                  <div className={styles.searchingSpacer}></div>
                ) : searchError ? (
                  <div className={styles.emptySearch}>
                    Error: {searchError}
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(game => (
                    <div key={game.id} className={styles.searchResultItem} onClick={() => handleGameClick(game)}>
                      {game.posterUrl || game.posterImage ? (
                        <div className={styles.searchResultImage} style={{ backgroundImage: `url(${game.posterUrl || game.posterImage})` }}></div>
                      ) : (
                        <div className={styles.searchResultImage}></div>
                      )}
                      <div>
                        <h4>{game.title}</h4>
                        <p>{game.developer || 'Unknown'} • {game.status || 'Game'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.noResults}>No games found for "{searchQuery}"</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
