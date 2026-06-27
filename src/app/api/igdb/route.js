import { NextResponse } from 'next/server';

// Simple in-memory cache for the Twitch Token so we don't spam their auth server
let cachedToken = null;
let tokenExpiresAt = 0;

async function getTwitchToken() {
  // If we already have a valid token, use it!
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Twitch Developer Credentials in .env.local");
  }

  const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, {
    method: 'POST'
  });

  if (!res.ok) {
    throw new Error("Failed to authenticate with Twitch");
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // Subtract 5 minutes to be safe
  tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 300000;
  
  return cachedToken;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search');

    if (!query) {
      return NextResponse.json({ error: "Missing search query" }, { status: 400 });
    }

    // 1. Get the secret token
    const token = await getTwitchToken();
    const clientId = process.env.TWITCH_CLIENT_ID;

    // 2. Query IGDB for the game
    // We ask for exactly the fields we need to build the game page
    const igdbQuery = `
      search "${query.replace(/"/g, '\\"')}";
      fields name, summary, first_release_date, cover.url, artworks.url, genres.name, platforms.name, involved_companies.company.name, screenshots.url, videos.video_id;
      limit 1;
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
      return NextResponse.json({ error: "Failed to fetch data from IGDB" }, { status: 500 });
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No games found on IGDB" }, { status: 404 });
    }

    const game = data[0];

    // 3. Format the data to perfectly match our frontend form
    // IGDB image URLs come as "//images.igdb.com/...". We need to prepend "https:" and upgrade quality to 1080p
    const formatImageUrl = (url) => {
      if (!url) return '';
      return 'https:' + url.replace('t_thumb', 't_1080p');
    };

    const formattedData = {
      title: game.name || '',
      description: game.summary || '',
      releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : '',
      tags: game.genres ? game.genres.map(g => g.name).join(', ') : '',
      platforms: game.platforms ? game.platforms.map(p => p.name).join(', ') : '',
      developer: game.involved_companies ? game.involved_companies.map(c => c.company.name).join(', ') : '',
      publisher: game.involved_companies ? game.involved_companies.map(c => c.company.name).join(', ') : '', // Usually same array in IGDB for simplicity
      heroUrl: game.artworks && game.artworks.length > 0 ? formatImageUrl(game.artworks[0].url) : '',
      posterUrl: game.cover ? formatImageUrl(game.cover.url) : '',
      screenshots: game.screenshots ? game.screenshots.map(s => formatImageUrl(s.url)).join(', ') : '',
      trailerUrl: game.videos && game.videos.length > 0 ? game.videos[0].video_id : ''
    };

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error("Backend Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
