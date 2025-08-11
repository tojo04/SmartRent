import React, { useEffect, useMemo, useState } from 'react';
import { orderAPI } from '../../../lib/api';

// Map backend -> UI labels/colors
const uiStatus = (status) => {
  // backend: PENDING | CONFIRMED | CANCELLED
  switch (status) {
    case 'CONFIRMED': return { label: 'Active',    cls: 'bg-blue-100 text-blue-800' };
    case 'PENDING':   return { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-800' };
    case 'CANCELLED': return { label: 'Cancelled', cls: 'bg-red-100 text-red-800' };
    default:          return { label: status,      cls: 'bg-gray-100 text-gray-800' };
  }
};

const paymentStatusFor = (status) =>
  status === 'CONFIRMED'
    ? { label: 'Paid', cls: 'bg-green-100 text-green-800' }
    : { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800' };

const fmtDate = (d) => new Date(d).toLocaleDateString();
const daysBetween = (s, e) => Math.ceil((new Date(e) - new Date(s)) / (1000 * 60 * 60 * 24));

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      // admin list; falls back to /orders/my if adminList isn't wired yet
      const res = (orderAPI.adminList ? await orderAPI.adminList({ limit: 200 }) : await orderAPI.my({ limit: 200 }));
      setOrders(res.items || []);
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const hay = `${o.id} ${o.product?.name ?? ''} ${o.customerId}`.toLowerCase();
      const matchesQ = !q || hay.includes(q.toLowerCase());
      return matchesStatus && matchesQ;
    });
  }, [orders, q, statusFilter]);

  const stats = useMemo(() => ({
    total: orders.length,
    active: orders.filter(o => o.status === 'CONFIRMED').length,
    completed: 0, // we don't have COMPLETED in backend yet
    revenue: orders
      .filter(o => o.status === 'CONFIRMED')
      .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0),
  }), [orders]);

  const approve = async (id) => {
    try {
      await orderAPI.updateStatus(id, 'CONFIRMED');
      await load();
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Approve failed');
    }
  };

  // NOTE: backend has no "COMPLETED" yet; we use CANCELLED as a placeholder for "finished".
  // If you add COMPLETED on the server, change 'CANCELLED' → 'COMPLETED' here.
  const complete = async (id) => {
    try {
      await orderAPI.updateStatus(id, 'CANCELLED');
      await load();
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Complete failed');
    }
  };

  const exportCSV = () => {
    const rows = [
      ['Order ID','Product','Start','End','Days','Total','Status'],
      ...filtered.map(o => [
        o.id,
        o.product?.name ?? '',
        fmtDate(o.startDate),
        fmtDate(o.endDate),
        o.days,
        Number(o.totalPrice || 0).toFixed(2),
        uiStatus(o.status).label,
      ])
    ];
    const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `orders_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="mt-2 text-sm text-gray-700">Manage rental orders, track payments, and handle returns.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex gap-2">
          <input
            className="border rounded px-2 py-1"
            placeholder="Search by ID or product…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <select
            className="border rounded px-2 py-1"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Active</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={exportCSV}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Export Orders
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <Stat iconColor="text-blue-600" label="Total Orders" value={stats.total} />
        <Stat iconColor="text-blue-600" label="Active Orders" value={stats.active} />
        <Stat iconColor="text-green-600" label="Completed" value={stats.completed} />
        <Stat iconColor="text-green-600" label="Revenue" value={`₹${stats.revenue.toFixed(2)}`} />
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6">Loading…</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Order ID</Th>
                    <Th>Product</Th>
                    <Th>Rental Period</Th>
                    <Th>Total</Th>
                    <Th>Status</Th>
                    <Th>Payment</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((o) => {
                    const s = uiStatus(o.status);
                    const pay = paymentStatusFor(o.status);
                    return (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <Td>
                          <div className="text-sm font-medium text-gray-900">{o.id}</div>
                          <div className="text-xs text-gray-500">{o.customerId}</div>
                        </Td>
                        <Td>
                          <div className="text-sm text-gray-900">{o.product?.name || '-'}</div>
                        </Td>
                        <Td>
                          <div className="text-sm text-gray-900">{fmtDate(o.startDate)} - {fmtDate(o.endDate)}</div>
                          <div className="text-sm text-gray-500">{o.days} days</div>
                        </Td>
                        <Td>
                          <div className="text-sm font-medium text-gray-900">₹{Number(o.totalPrice || 0).toFixed(2)}</div>
                        </Td>
                        <Td>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
                            {s.label}
                          </span>
                        </Td>
                        <Td>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pay.cls}`}>
                            {pay.label}
                          </span>
                        </Td>
                        <Td>
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-xs font-medium transition-colors">
                              View
                            </button>
                            {o.status === 'PENDING' && (
                              <button
                                onClick={() => approve(o.id)}
                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {o.status === 'CONFIRMED' && (
                              <button
                                onClick={() => complete(o.id)}
                                className="text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!filtered.length && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                <p className="mt-1 text-sm text-gray-500">No rental orders match your filter.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* small presentational helpers */
function Th({ children }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  );
}
function Td({ children }) {
  return (
    <td className="px-6 py-4 whitespace-nowrap">
      {children}
    </td>
  );
}
function Stat({ iconColor, label, value }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className={`h-6 w-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
