import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../../contexts/WishlistContext';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" fill="none"><rect width="300" height="300" fill="#E5E7EB"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#6B7280" font-family="Arial, sans-serif" font-size="80" font-weight="bold">${product.name?.charAt(0) || 'P'}</text></svg>`)}`;
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-6">Browse products and add them to your wishlist for later.</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Go to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Wishlist</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {wishlist.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
            <img
              src={getProductImage(product)}
              alt={product.name}
              className="h-48 w-full object-cover"
            />
            <div className="p-4 flex-1 flex flex-col">
              <h3
                onClick={() => navigate(`/products/${product.id}`)}
                className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
              >
                {product.name}
              </h3>
              <span className="text-lg font-bold text-green-600 mb-4">₹{product.pricePerDay}/day</span>
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="mt-auto border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;

