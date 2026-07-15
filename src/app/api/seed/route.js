import { NextResponse } from 'next/server';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';

let cachedToken = null;
let tokenExpiresAt = 0;

async function getTwitchToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, { method: 'POST' });
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 300000;
  return cachedToken;
}

const formatImageUrl = (url) => {
  if (!url) return '';
  return 'https:' + url.replace('t_thumb', 't_1080p');
};

export async function GET(request) {
  try {
    // Authenticate as Admin to bypass Firestore rules
    await signInWithEmailAndPassword(auth, "aditya@resengalstudio.live", "aditya@1973");

    const token = await getTwitchToken();
    const clientId = process.env.TWITCH_CLIENT_ID;

    // Fetch top 50 highly rated games with lots of ratings
    const igdbQuery = `
      fields name, summary, first_release_date, cover.url, artworks.url, genres.name, platforms.name, involved_companies.company.name, screenshots.url, videos.video_id;
      where total_rating_count > 500 & cover != null & artworks != null;
      sort total_rating desc;
      limit 50;
    `;

    const res = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain'
      },
      body: igdbQuery
    });

    const data = await res.json();

    let addedCount = 0;
    
    for (const game of data) {
      const formattedData = {
        title: game.name || '',
        description: game.summary || '',
        releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : '',
        tags: game.genres ? game.genres.map(g => g.name).join(', ') : '',
        platforms: game.platforms ? game.platforms.map(p => p.name).join(', ') : '',
        developer: game.involved_companies ? game.involved_companies.map(c => c.company.name).join(', ') : '',
        publisher: game.involved_companies ? game.involved_companies.map(c => c.company.name).join(', ') : '',
        heroUrl: game.artworks && game.artworks.length > 0 ? formatImageUrl(game.artworks[0].url) : '',
        posterUrl: game.cover ? formatImageUrl(game.cover.url) : '',
        screenshots: game.screenshots ? game.screenshots.map(s => formatImageUrl(s.url)).join(', ') : '',
        trailerUrl: game.videos && game.videos.length > 0 ? game.videos[0].video_id : '',
        likes: 0,
        interestedUsers: [],
        collectionUsers: [],
        reviewsList: []
      };

      const newId = formattedData.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      formattedData.id = newId;

      const gameRef = doc(db, "games", newId);
      const snap = await getDoc(gameRef);
      if (!snap.exists()) {
        await setDoc(gameRef, formattedData);
        addedCount++;
      }
    }

    return NextResponse.json({ success: true, message: `Added ${addedCount} games to Firebase.` });
  } catch (error) {
    console.error("Seed Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
