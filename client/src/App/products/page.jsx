// src/App/products/page.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../../lib/api';

export default function CatalogPage() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await productAPI.list({ rentable: true, limit: 50 });
        setData(res);
      } catch (e) {
        alert(e.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Rentable Products</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {data.items.map(p => (
          <div key={p.id} className="border rounded-lg p-4 space-y-2">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-gray-500 line-clamp-2">{p.description}</div>
            <div className="text-sm">₹{Number(p.pricePerDay).toFixed(2)} / day</div>
            <Link to={`/products/${p.id}`} className="inline-block mt-2 px-3 py-1 rounded bg-black text-white">
              View
            </Link>
          </div>
        ))}
        {!data.items.length && <p>No rentable products yet.</p>}
      </div>
    </div>
  );
}
