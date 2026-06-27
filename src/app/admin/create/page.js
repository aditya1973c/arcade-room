"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';
import { useGames } from '@/context/GameContext';
import styles from './page.module.css';

export default function AdminCreatePage() {
  const router = useRouter();
  const { profile } = useProfile();
  const { addGame } = useGames();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Extra guard: If user somehow bypasses AuthGuard but is not admin
    if (mounted) {
      if (!profile || !profile.isAdmin) {
        router.push('/');
      }
    }
  }, [mounted, profile, router]);

  const [formData, setFormData] = useState({
    title: '',
    developer: '',
    publisher: '',
    status: 'Upcoming',
    releaseDate: '',
    description: '',
    tags: '',
    posterUrl: '',
    heroUrl: '',
    trailerUrl: '',
    gameplayUrl: '',
    screenshots: '',
    language: 'English',
    ageRating: '18+',
    platforms: '',
    gameType: 'Base Game',
    vibeGameplay: 8,
    vibeGraphics: 8,
    vibeStory: 8,
    vibeAudio: 8,
    vibeReplay: 8
  });
  const [isTBD, setIsTBD] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const handleAutoFill = async () => {
    if (!searchQuery) return;
    
    setIsFetching(true);
    setFetchError('');
    
    try {
      const res = await fetch(`/api/igdb?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (!res.ok) {
        setFetchError(data.error || "Failed to fetch data from IGDB");
        setIsFetching(false);
        return;
      }
      
      let status = 'Released';
      if (data.releaseDate && new Date(data.releaseDate) > new Date()) {
        status = 'Upcoming';
      }

      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        developer: data.developer || prev.developer,
        publisher: data.publisher || prev.publisher,
        status: status,
        releaseDate: data.releaseDate || prev.releaseDate,
        description: data.description || prev.description,
        tags: data.tags || prev.tags,
        platforms: data.platforms || prev.platforms,
        heroUrl: data.heroUrl || prev.heroUrl,
        posterUrl: data.posterUrl || prev.posterUrl,
        screenshots: data.screenshots || prev.screenshots,
        trailerUrl: data.trailerUrl || prev.trailerUrl,
        vibeGameplay: Math.floor(Math.random() * 4) + 7, // 7 to 10
        vibeGraphics: Math.floor(Math.random() * 4) + 7,
        vibeStory: Math.floor(Math.random() * 5) + 6,
        vibeAudio: Math.floor(Math.random() * 4) + 7,
        vibeReplay: Math.floor(Math.random() * 5) + 6
      }));
      
      setSearchQuery('');
    } catch (err) {
      console.error(err);
      setFetchError("Internal Server Error while communicating with IGDB.");
    }
    
    setIsFetching(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create new game object
    const newGame = {
      id: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: formData.title,
      developer: formData.developer,
      publisher: formData.publisher,
      status: formData.status,
      releaseDate: isTBD ? 'TBD' : formData.releaseDate,
      interestedUsers: [],
      description: formData.description,
      tags: formData.tags.split(',').map(tag => tag.trim()),
      platforms: formData.platforms ? formData.platforms.split(',').map(p => p.trim()) : ['PS5', 'PC', 'Xbox'],
      likes: 0,
      bookmarked: false,
      // Optional fields that details page uses:
      gameType: formData.gameType,
      vibes: {
        gameplay: parseInt(formData.vibeGameplay),
        graphics: parseInt(formData.vibeGraphics),
        story: parseInt(formData.vibeStory),
        audio: parseInt(formData.vibeAudio),
        replayability: parseInt(formData.vibeReplay)
      },
      language: formData.language || 'English',
      ageRating: formData.ageRating || '18+',
      posterImage: formData.posterUrl || '',
      heroImage: formData.heroUrl || '',
      trailerUrl: formData.trailerUrl || '',
      gameplayUrl: formData.gameplayUrl || '',
      screenshots: formData.screenshots ? formData.screenshots.split(',').map(s => s.trim()) : [],
      reviewsList: []
    };

    addGame(newGame);
    
    // Redirect to the newly created game page
    router.push(`/game/${newGame.id}`);
  };

  if (!mounted || !profile.isAdmin) return null;

  return (
    <main className={styles.adminLayout}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Add New Game</h1>
          <p className={styles.subtitle}>Create a new game entry in the Arcade Room database.</p>
        </div>

        <div style={{ background: '#111', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #333' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#a855f7' }}>✨ Auto-Fill with RAWG Database</h2>
          <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.9rem' }}>Type a game name to automatically fetch description, cover art, developers, and screenshots!</p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="e.g. Cyberpunk 2077" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.input}
              style={{ flex: 1, margin: 0 }}
            />
            <button 
              type="button" 
              onClick={handleAutoFill} 
              disabled={isFetching}
              className={styles.submitBtn}
              style={{ width: 'auto', margin: 0, padding: '0.8rem 2rem' }}
            >
              {isFetching ? 'Fetching...' : 'Auto-Fill Magic'}
            </button>
          </div>
          {fetchError && <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.9rem' }}>{fetchError}</p>}
        </div>

        <form className={styles.formCard} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Game Title</label>
            <input 
              type="text" 
              name="title" 
              className={styles.input} 
              placeholder="e.g., Grand Theft Auto VII"
              value={formData.title}
              onChange={handleChange}
              required 
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Developer</label>
              <input 
                type="text" 
                name="developer" 
                className={styles.input} 
                placeholder="e.g., Rockstar Games"
                value={formData.developer}
                onChange={handleChange}
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Publisher</label>
              <input 
                type="text" 
                name="publisher" 
                className={styles.input} 
                placeholder="e.g., Take-Two Interactive"
                value={formData.publisher}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Status</label>
              <select 
                name="status" 
                className={styles.select}
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Announced">Announced</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Released">Released</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Game Type</label>
              <select 
                name="gameType" 
                className={styles.select}
                value={formData.gameType}
                onChange={handleChange}
              >
                <option value="Base Game">Base Game</option>
                <option value="Edition">Edition</option>
                <option value="Expansion">Expansion</option>
                <option value="DLC">DLC</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className={styles.label}>Release Date</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={isTBD} 
                    onChange={(e) => setIsTBD(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  TBD
                </label>
              </div>
              <input 
                type="date" 
                name="releaseDate" 
                className={styles.input} 
                value={formData.releaseDate}
                onChange={handleChange}
                disabled={isTBD}
                required={!isTBD}
                style={{ opacity: isTBD ? 0.5 : 1, cursor: isTBD ? 'not-allowed' : 'text' }}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Overview / Description</label>
            <textarea 
              name="description" 
              className={styles.textarea} 
              placeholder="Write a brief overview of the game..."
              value={formData.description}
              onChange={handleChange}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Tags (Comma Separated)</label>
            <input 
              type="text" 
              name="tags" 
              className={styles.input} 
              placeholder="e.g., Open World, Action, Adventure"
              value={formData.tags}
              onChange={handleChange}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Platforms/Devices (Comma Separated)</label>
            <input 
              type="text" 
              name="platforms" 
              className={styles.input} 
              placeholder="e.g., PS5, Xbox Series X, PC"
              value={formData.platforms}
              onChange={handleChange}
              required 
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Language</label>
              <input 
                type="text" 
                name="language" 
                className={styles.input} 
                placeholder="e.g., English, Japanese"
                value={formData.language}
                onChange={handleChange}
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Age Rating</label>
              <input 
                type="text" 
                name="ageRating" 
                className={styles.input} 
                placeholder="e.g., 18+, E for Everyone"
                value={formData.ageRating}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Poster Image URL</label>
              <input 
                type="url" 
                name="posterUrl" 
                className={styles.input} 
                placeholder="https://..."
                value={formData.posterUrl}
                onChange={handleChange}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Hero Background URL</label>
              <input 
                type="url" 
                name="heroUrl" 
                className={styles.input} 
                placeholder="https://..."
                value={formData.heroUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Announcement Trailer (YouTube ID or URL)</label>
              <input 
                type="text" 
                name="trailerUrl" 
                className={styles.input} 
                placeholder="e.g., QdBZY2fkU-0"
                value={formData.trailerUrl}
                onChange={handleChange}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Gameplay Trailer (YouTube ID or URL)</label>
              <input 
                type="text" 
                name="gameplayUrl" 
                className={styles.input} 
                placeholder="e.g., QdBZY2fkU-0"
                value={formData.gameplayUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Screenshots (Comma Separated URLs)</label>
            <textarea 
              name="screenshots" 
              className={styles.textarea} 
              placeholder="e.g., https://image1.jpg, https://image2.jpg"
              value={formData.screenshots}
              onChange={handleChange}
              style={{ minHeight: '80px' }}
            />
          </div>

          {/* Vibe Metrics Section */}
          <div className={styles.inputGroup} style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <h3 className={styles.label} style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'white' }}>Vibe Metrics (Out of 10)</h3>
            
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Gameplay: {formData.vibeGameplay}</label>
                <input type="range" name="vibeGameplay" min="1" max="10" value={formData.vibeGameplay} onChange={handleChange} className={styles.input} style={{ padding: '0' }} />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Graphics: {formData.vibeGraphics}</label>
                <input type="range" name="vibeGraphics" min="1" max="10" value={formData.vibeGraphics} onChange={handleChange} className={styles.input} style={{ padding: '0' }} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Story: {formData.vibeStory}</label>
                <input type="range" name="vibeStory" min="1" max="10" value={formData.vibeStory} onChange={handleChange} className={styles.input} style={{ padding: '0' }} />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Audio: {formData.vibeAudio}</label>
                <input type="range" name="vibeAudio" min="1" max="10" value={formData.vibeAudio} onChange={handleChange} className={styles.input} style={{ padding: '0' }} />
              </div>
            </div>

            <div className={styles.inputGroup} style={{ width: 'calc(50% - 0.5rem)' }}>
              <label className={styles.label}>Replayability: {formData.vibeReplay}</label>
              <input type="range" name="vibeReplay" min="1" max="10" value={formData.vibeReplay} onChange={handleChange} className={styles.input} style={{ padding: '0' }} />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} style={{ marginTop: '2rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Publish Game
          </button>
        </form>
      </div>
    </main>
  );
}
