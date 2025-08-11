// src/App/admin/products/page.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../../../lib/api';

export default function AdminProductsPage() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await productAPI.list({ limit: 100 });
      setData(res);
    } catch (e) {
      alert(e.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productAPI.remove(id);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link to="/admin/products/new" className="px-3 py-1 rounded bg-black text-white">New</Link>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left border-b">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Rentable</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Price/Day</th>
                <th className="p-2">Images</th>
                <th className="p-2 w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.isRentable ? 'Yes' : 'No'}</td>
                  <td className="p-2">{p.stock}</td>
                  <td className="p-2">₹{Number(p.pricePerDay).toFixed(2)}</td>
                  <td className="p-2">{p.images?.length || 0}</td>
                  <td className="p-2">
                    <button className="px-2 py-1 rounded bg-red-600 text-white"
                            onClick={() => remove(p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!data.items.length && (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
