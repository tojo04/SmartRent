import React, { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem('wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(items));
    } catch (err) {
      // ignore write errors
    }
  }, [items]);

  const toggleWishlist = (product) => {
    setItems((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isWishlisted = (productId) => items.some((p) => p.id === productId);

  const removeFromWishlist = (productId) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isWishlisted, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

