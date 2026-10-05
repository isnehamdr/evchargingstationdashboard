import AdminWrapper from '@/AdminDashboard/AdminWrapper';
import EditBooking from '@/EditForm/EditBooking';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    soft: '#F4FAF7',
    ink: '#0B1A16',
};

const STATUS_STYLES = {
    Upcoming: { color: '#1D4ED8', bg: '#DBEAFE' },
    Confirmed: { color: '#7C3AED', bg: '#EDE9FE' },
    Completed: { color: BRAND.greenDark, bg: BRAND.soft },
    Cancelled: { color: '#B91C1C', bg: '#FEE2E2' },
};

const FILTERS = ['All', 'Upcoming', 'Confirmed', 'Completed', 'Cancelled'];

function formatDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d) ? value : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function Booking() {
    const { bookings, drivers = [], stations = [], flash } = usePage().props;
    const [filter, setFilter] = useState('All');
    const [editingBooking, setEditingBooking] = useState(null);

    const rows = bookings?.data ?? [];
    const filtered = filter === 'All' ? rows : rows.filter((b) => b.status === filter);

    const handleDelete = (booking) => {
        if (!window.confirm(`Delete booking ${booking.booking_id}?`)) return;
        router.delete(`/ourbooking/${booking.id}`, { preserveScroll: true });
    };

    return (
        <AdminWrapper title="Bookings">
            <Head title="Bookings" />

            {flash?.success && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: BRAND.soft, color: BRAND.greenDark }}>
                    {flash.success}
                </div>
            )}

            {/* ---------- Filter tabs ---------- */}
            <div className="mb-4 flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className="rounded-full px-4 py-1.5 text-sm font-medium transition"
                        style={
                            filter === f
                                ? { backgroundColor: BRAND.green, color: '#fff' }
                                : { backgroundColor: '#fff', color: BRAND.ink, border: '1px solid rgba(0,0,0,0.08)' }
                        }
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* ---------- Bookings table ---------- */}
            <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-[#0B1A16]/40">
                                <th className="px-5 py-3 font-medium">Booking ID</th>
                                <th className="px-5 py-3 font-medium">Driver</th>
                                <th className="px-5 py-3 font-medium">Station</th>
                                <th className="px-5 py-3 font-medium">Date & Slot</th>
                                <th className="px-5 py-3 font-medium">Amount</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {filtered.map((b) => {
                                const style = STATUS_STYLES[b.status] || STATUS_STYLES.Upcoming;
                                return (
                                    <tr key={b.id} className="hover:bg-[#F4FAF7]">
                                        <td className="px-5 py-3 font-medium text-[#0B1A16]">{b.booking_id}</td>
                                        <td className="px-5 py-3 text-[#0B1A16]/80">{b.driver?.name ?? '—'}</td>
                                        <td className="px-5 py-3 text-[#0B1A16]/70">{b.station?.station_name ?? '—'}</td>
                                        <td className="px-5 py-3 text-[#0B1A16]/70">
                                            {formatDate(b.booking_date)} · {b.start_time} – {b.end_time}
                                        </td>
                                        <td className="px-5 py-3 text-[#0B1A16]/70">
                                            Rs {b.amount} <span className="text-[#0B1A16]/35">· {b.payment_method ?? '—'}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: style.color, backgroundColor: style.bg }}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingBooking(b)}
                                                    className="text-xs font-semibold"
                                                    style={{ color: BRAND.greenDark }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(b)}
                                                    className="text-xs font-semibold text-red-500 hover:text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-8 text-center text-sm text-[#0B1A16]/40">
                                        No bookings found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ---------- Pagination ---------- */}
            {bookings?.links?.length > 3 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
                    {bookings.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            preserveScroll
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                                link.active ? 'text-white' : 'text-[#0B1A16]/60 hover:bg-[#F4FAF7]'
                            } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                            style={link.active ? { backgroundColor: BRAND.green } : undefined}
                        />
                    ))}
                </div>
            )}

            {/* ---------- Edit modal ---------- */}
            {editingBooking && (
                <EditBooking
                    booking={editingBooking}
                    drivers={drivers}
                    stations={stations}
                    onClose={() => setEditingBooking(null)}
                />
            )}
        </AdminWrapper>
    );
}