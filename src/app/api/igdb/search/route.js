import { NextResponse } from 'next/server';

let cachedToken = null;
let tokenExpiresAt = 0;

async function getTwitchToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error("Missing credentials");
  }

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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: "Missing search query" }, { status: 400 });
    }

    const token = await getTwitchToken();
    const clientId = process.env.TWITCH_CLIENT_ID;

    // Fetch up to 10 matching games
    const igdbQuery = `
      search "${query.replace(/"/g, '\\"')}";
      fields name, summary, first_release_date, cover.url, artworks.url, genres.name, platforms.name, involved_companies.company.name, screenshots.url, videos.video_id;
      where category = (0, 8, 9); 
      limit 10;
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

    if (!res.ok) {
      const errorText = await res.text();
      console.error("IGDB Error:", errorText);
      return NextResponse.json({ error: "Failed to fetch from IGDB" }, { status: 500 });
    }

    const data = await res.json();

    const formattedGames = data.map(game => {
      const formattedData = {
        title: game.name || '',
        description: game.summary || '',
        releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : '',
        tags: game.genres ? game.genres.map(g => g.name) : [],
        platforms: game.platforms ? game.platforms.map(p => p.name) : [],
        developer: game.involved_companies ? game.involved_companies[0]?.company.name : 'Unknown',
        publisher: game.involved_companies ? game.involved_companies[0]?.company.name : 'Unknown',
        heroUrl: game.artworks && game.artworks.length > 0 ? formatImageUrl(game.artworks[0].url) : '',
        posterUrl: game.cover ? formatImageUrl(game.cover.url) : '',
        screenshots: game.screenshots ? game.screenshots.map(s => formatImageUrl(s.url)) : [],
        trailerUrl: game.videos && game.videos.length > 0 ? game.videos[0].video_id : '',
        likes: 0,
        interestedUsers: [],
        collectionUsers: [],
        reviewsList: []
      };
      // generate an ID based on title
      formattedData.id = formattedData.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      // Append random string to ID if it's very generic to avoid collisions for IGDB fetched games
      formattedData.igdbId = game.id;
      return formattedData;
    });

    return NextResponse.json(formattedGames);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
