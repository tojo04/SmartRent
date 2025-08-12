import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../../contexts/WishlistContext';

const WishlistPage = () => {
  const { items, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    const char = product.name?.charAt(0) || 'P';
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" fill="none"><rect width="300" height="300" fill="#E5E7EB"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#6B7280" font-family="Arial, sans-serif" font-size="80" font-weight="bold">' + char + '</text></svg>';
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-6">My Wishlist</h1>
        {items.length === 0 ? (
          <p className="text-gray-600">Your wishlist is empty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="h-48 w-full object-cover"
                  onError={(e) => { e.target.src = getProductImage(product); }}
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">₹{product.pricePerDay}/day</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;

