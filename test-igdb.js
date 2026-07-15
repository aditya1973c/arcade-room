const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) process.env[k.trim()] = v.trim();
});
const id = process.env.TWITCH_CLIENT_ID;
const sec = process.env.TWITCH_CLIENT_SECRET;
fetch('https://id.twitch.tv/oauth2/token?client_id=' + id + '&client_secret=' + sec + '&grant_type=client_credentials', {method: 'POST'})
  .then(r => r.json())
  .then(d => {
    console.log("Token response:", d);
    fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': id,
        'Authorization': 'Bearer ' + d.access_token,
        'Content-Type': 'text/plain'
      },
      body: 'where id = 151665; fields name, category;'
    }).then(r => r.text()).then(console.log);
  });
