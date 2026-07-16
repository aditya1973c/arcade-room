"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, updateDoc, arrayUnion, arrayRemove, increment, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [games, setGames] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch games from Firestore with REAL-TIME Listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "games"), (snapshot) => {
      const gamesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGames(gamesList);
      setIsLoaded(true);
    }, (error) => {
      console.error("Error fetching real-time games:", error);
      setGames([]);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const addGame = async (newGame) => {
    try {
      const newId = newGame.id || newGame.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const gameData = { ...newGame, id: newId, likes: 0, reviewsList: [] };
      await setDoc(doc(db, "games", newId), gameData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteGame = async (gameId) => {
    try {
      await deleteDoc(doc(db, "games", gameId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting game:", error);
      return { success: false, error: error.message };
    }
  };

  const addReview = async (gameId, review) => {
    try {
      await updateDoc(doc(db, "games", gameId), { 
        reviewsList: arrayUnion(review) 
      });
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  const deleteReview = async (gameId, review) => {
    try {
      // Import arrayRemove at the top
      const { arrayRemove } = await import('firebase/firestore');
      await updateDoc(doc(db, "games", gameId), {
        reviewsList: arrayRemove(review)
      });
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const editReview = async (gameId, originalReview, newText) => {
    try {
      const { getDoc } = await import('firebase/firestore');
      const gameRef = doc(db, "games", gameId);
      const snap = await getDoc(gameRef);
      if (snap.exists()) {
        const gameData = snap.data();
        const reviews = gameData.reviewsList || [];
        
        const reviewIndex = reviews.findIndex(r => 
          r.author === originalReview.author && 
          r.content === originalReview.content && 
          r.date === originalReview.date
        );

        if (reviewIndex > -1) {
          reviews[reviewIndex].content = newText;
          reviews[reviewIndex].edited = true;
          await updateDoc(gameRef, { reviewsList: reviews });
        }
      }
    } catch (error) {
      console.error("Error editing review:", error);
    }
  };

  const addReply = async (gameId, originalReview, replyText, author) => {
    try {
      const { getDoc } = await import('firebase/firestore');
      const gameRef = doc(db, "games", gameId);
      const snap = await getDoc(gameRef);
      if (snap.exists()) {
        const gameData = snap.data();
        const reviews = gameData.reviewsList || [];
        
        const reviewIndex = reviews.findIndex(r => 
          r.author === originalReview.author && 
          r.content === originalReview.content && 
          r.date === originalReview.date
        );

        if (reviewIndex > -1) {
          if (!reviews[reviewIndex].replies) reviews[reviewIndex].replies = [];
          reviews[reviewIndex].replies.push({
            id: Date.now().toString(),
            author: author,
            text: replyText,
            date: "Just now"
          });
          
          await updateDoc(gameRef, { reviewsList: reviews });
        }
      }
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const deleteReply = async (gameId, originalReview, replyId) => {
    try {
      const { getDoc } = await import('firebase/firestore');
      const gameRef = doc(db, "games", gameId);
      const snap = await getDoc(gameRef);
      if (snap.exists()) {
        const gameData = snap.data();
        const reviews = gameData.reviewsList || [];
        
        const reviewIndex = reviews.findIndex(r => 
          r.author === originalReview.author && 
          r.content === originalReview.content && 
          r.date === originalReview.date
        );

        if (reviewIndex > -1 && reviews[reviewIndex].replies) {
          reviews[reviewIndex].replies = reviews[reviewIndex].replies.filter(rep => rep.id !== replyId);
          await updateDoc(gameRef, { reviewsList: reviews });
        }
      }
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };

  const addPost = (post) => {
    setActivityFeed(prev => [post, ...prev]);
  };

  const likeGame = async (gameId) => {
    try {
      await updateDoc(doc(db, "games", gameId), {
        likes: increment(1)
      });
    } catch (error) {
      console.error("Error liking game:", error);
    }
  };

  const bookmarkGame = (gameId) => {
    setGames(prev => prev.map(game => {
      if (game.id === gameId) {
        return { ...game, bookmarked: !game.bookmarked };
      }
      return game;
    }));
  };

  const toggleInterested = async (gameId, username) => {
    try {
      const game = games.find(g => g.id === gameId);
      if (!game) return;
      
      const isInterested = (game.interestedUsers || []).includes(username);
      
      await updateDoc(doc(db, "games", gameId), {
        interestedUsers: isInterested ? arrayRemove(username) : arrayUnion(username)
      });
    } catch (error) {
      console.error("Error toggling interested:", error);
    }
  };

  const toggleCollection = async (gameId, username) => {
    try {
      const game = games.find(g => g.id === gameId);
      if (!game) return;
      
      const isInCollection = (game.collectionUsers || []).includes(username);
      
      await updateDoc(doc(db, "games", gameId), {
        collectionUsers: isInCollection ? arrayRemove(username) : arrayUnion(username)
      });
    } catch (error) {
      console.error("Error toggling collection:", error);
    }
  };

  return (
    <GameContext.Provider value={{ 
      games, 
      activityFeed, 
      isLoaded,
      addGame, 
      deleteGame,
      addReview, 
      deleteReview,
      editReview,
      addReply,
      deleteReply,
      addPost,
      likeGame,
      bookmarkGame,
      toggleInterested,
      toggleCollection
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGames() {
  return useContext(GameContext);
}
