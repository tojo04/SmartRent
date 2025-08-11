// src/App/products/[productId]/page.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI, orderAPI } from '../../../lib/api';

function daysBetween(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s) || isNaN(e) || e <= s) return 0;
  const ONE = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.ceil((e - s) / ONE)); // end exclusive
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [p, setP] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { product } = await productAPI.get(productId);
        setP(product);
      } catch (e) {
        alert(e.message || 'Failed to load product');
      }
    })();
  }, [productId]);

  const days = useMemo(() => daysBetween(startDate, endDate), [startDate, endDate]);
  const total = useMemo(() => (p ? Number(p.pricePerDay) * (days || 0) : 0), [p, days]);

  async function bookNow() {
    if (!days) return alert('Please select valid start and end dates');
    try {
      setSaving(true);
      await orderAPI.create({ productId, startDate, endDate });
      alert('Booked! Your order is now PENDING.');
      navigate('/orders'); // if you have a “My Rentals” page; change if needed
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Booking failed');
    } finally {
      setSaving(false);
    }
  }

  if (!p) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{p.name}</h1>
        <p className="text-gray-600">{p.description}</p>
        <p className="text-sm">Price: <b>₹{Number(p.pricePerDay).toFixed(2)}</b> / day</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 items-end max-w-2xl">
        <div>
          <label className="block text-sm mb-1">Start date</label>
          <input type="date" className="border rounded px-2 py-1 w-full"
                 value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">End date</label>
          <input type="date" className="border rounded px-2 py-1 w-full"
                 value={endDate} onChange={e => setEndDate(e.target.value)} />
          <p className="text-xs text-gray-500 mt-1">(End date is exclusive; same-day = 1 day)</p>
        </div>
        <div className="space-y-1">
          <div>Days: <b>{days || 0}</b></div>
          <div>Total: <b>₹{total.toFixed(2)}</b></div>
          <button className="px-3 py-1 rounded bg-black text-white disabled:opacity-60"
                  disabled={!days || saving} onClick={bookNow}>
            {saving ? 'Booking...' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
