// src/App/admin/products/new/page.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../../../../lib/api';

export default function AdminNewProductPage() {
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imagesStr, setImagesStr] = useState('');
  const [isRentable, setIsRentable] = useState(true);
  const [stock, setStock] = useState(0);
  const [pricePerDay, setPricePerDay] = useState(0);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await productAPI.create({
        name: name.trim(),
        description: description.trim(),
        images: imagesStr.split('\n').map(s => s.trim()).filter(Boolean),
        isRentable,
        stock: Number(stock),
        pricePerDay: Number(pricePerDay),
      });
      nav('/admin/products');
    } catch (e2) {
      alert(e2.response?.data?.message || e2.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Create Product</h1>
      <form onSubmit={submit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm mb-1">Name *</label>
          <input className="border rounded px-2 py-1 w-full" value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea className="border rounded px-2 py-1 w-full" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm mb-1">Image URLs (one per line)</label>
          <textarea className="border rounded px-2 py-1 w-full" rows={4} value={imagesStr} onChange={e => setImagesStr(e.target.value)} placeholder="https://..." />
        </div>

        <div className="flex items-center gap-2">
          <input id="rentable" type="checkbox" checked={isRentable} onChange={e => setIsRentable(e.target.checked)} />
          <label htmlFor="rentable">Rentable</label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Initial Stock</label>
            <input type="number" min="0" className="border rounded px-2 py-1 w-full" value={stock} onChange={e => setStock(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Price / day *</label>
            <input type="number" min="0" step="0.01" className="border rounded px-2 py-1 w-full" value={pricePerDay} onChange={e => setPricePerDay(e.target.value)} required />
          </div>
        </div>

        <button type="submit" disabled={saving} className="px-3 py-1 rounded bg-black text-white">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
