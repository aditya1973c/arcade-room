export const gamesDb = [];

export const notificationsDb = [
  {
    id: "n1",
    title: "Releasing Today: Alpha (Full Release)",
    date: "26th June",
    type: "update",
    read: false,
    image: "/placeholder-1.jpg"
  },
  {
    id: "n2",
    title: "Wishlist Alert: Cyberpunk Orion Beta",
    date: "24th June",
    type: "activity",
    read: false,
    image: "/placeholder-2.jpg"
  },
  {
    id: "n3",
    title: "Elden Ring DLC Trailer Dropped",
    date: "20th June",
    type: "update",
    read: true,
    image: "/placeholder-3.jpg"
  },
  {
    id: "n4",
    title: "Your friend 'GamerPro' joined Arcade Room",
    date: "15th June",
    type: "activity",
    read: true,
    image: "/placeholder-4.jpg"
  }
];

export const myProfileData = {
  name: "Aditya Raj",
  handle: "@Aditya1973",
  verified: false,
  avatarBg: "#334155", // Dark gray background for AR
  initials: "AR",
  reviewsCount: 1,
  publicCollections: 0,
  followers: "0",
  following: "0",
  joined: "6 months ago",
  userReviews: [
    {
      id: "rev1",
      title: "Kis Kisko Pyaar Karoon 2",
      type: "Movie",
      year: "2025",
      timeAgo: "15 Dec 2025",
      rating: "Timepass",
      text: "This was a 1 time watch movie for me",
      likes: 0,
      comments: 0,
      posterGradient: "linear-gradient(to bottom, #d946ef, #701a75)"
    }
  ],
  interestedIn: [
    { id: "int1", title: "Alpha", date: "03 Jul, 2026", status: "In Theatre", posterColor: "#1e293b" },
    { id: "int2", title: "Jujutsu Kaisen: Execution", date: "To Be Confirmed", status: "In Theatre", posterColor: "#0f172a" }
  ]
};

export const profileData = {
  name: "Mohit Yodha",
  handle: "@comicverse",
  verified: true,
  avatarBg: "linear-gradient(to bottom, #87CEEB, #1E90FF)", // Blue sky gradient
  reviewsCount: 520,
  publicCollections: 6,
  followers: "26.4 K",
  joined: "1 year ago",
  userReviews: [
    {
      id: "rev1",
      title: "Supergirl",
      type: "Movie",
      year: "2026",
      timeAgo: "2 hrs ago",
      rating: "Go For It",
      text: "A well done superhero movie that establishes Kara in the DCU along with telling us why she is different from Superman.\n\nThe comic adaptation on terms of storytelling is oversimpl...",
      likes: 157,
      comments: 9,
      posterGradient: "linear-gradient(to bottom, #1e3a8a, #0f172a)"
    },
    {
      id: "rev2",
      title: "Welcome To The Jungle",
      type: "Movie",
      year: "2026",
      timeAgo: "8 hrs ago",
      rating: "Skip",
      text: "THIS is the film the characters in this movie set out to make.\nIt has no plot, no screenplay.. Just a concept in the Director & writer's heads which is responsible for this pathetic shitstorm that is being called a movie....",
      likes: 333,
      comments: 9,
      posterGradient: "linear-gradient(to bottom, #064e3b, #022c22)"
    },
    {
      id: "rev3",
      title: "Cocktail 2",
      type: "Movie",
      year: "2026",
      timeAgo: "1 week ago",
      rating: "Timepass",
      text: "If 'Tu jhooti mai makkar & sonu ke titu' had a baby and it was boring.",
      likes: 632,
      comments: 21,
      posterGradient: "linear-gradient(to bottom, #0ea5e9, #0369a1)"
    }
  ],
  interestedIn: [
    { id: "int1", title: "The Odyssey", date: "17 Jul, 2026", status: "In Theatre", posterColor: "#1e293b" },
    { id: "int2", title: "Spider-Man: Brand New Day", date: "30 Jul, 2026", status: "In Theatre", posterColor: "#7f1d1d" },
    { id: "int3", title: "Lanterns", date: "15 Aug, 2026", status: "New Show", posterColor: "#064e3b" },
    { id: "int4", title: "Toxic", date: "28 Aug, 2026", status: "In Theatre", posterColor: "#b91c1c" },
    { id: "int5", title: "Avengers: Doomsday", date: "18 Dec, 2026", status: "In Theatre", posterColor: "#0f172a" }
  ]
};

export const categoriesDb = [
  { title: "Monthly Ranking", icon: "calendar" },
  { title: "Top 100", icon: "crown" },
  { title: "Category", icon: "shapes" },
  { title: "Genre", icon: "masks" },
  { title: "Country", icon: "globe" },
  { title: "Language", icon: "translate" },
  { title: "Family Friendly", icon: "users" },
  { title: "Award Winners", icon: "award" },
  { title: "Arcade Room Select", icon: "badge" },
  { title: "Anime", icon: "face" },
  { title: "Franchise", icon: "film" }
];
