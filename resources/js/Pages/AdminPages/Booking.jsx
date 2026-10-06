// import AdminWrapper from '@/AdminDashboard/AdminWrapper';
// import EditBooking from '@/EditForm/EditBooking';

// import { Head, Link, router, usePage } from '@inertiajs/react';
// import { useState } from 'react';

// const BRAND = {
//     green: '#02C468',
//     greenDark: '#019654',
//     soft: '#F4FAF7',
//     ink: '#0B1A16',
// };

// const STATUS_STYLES = {
//     Upcoming: { color: '#1D4ED8', bg: '#DBEAFE' },
//     Confirmed: { color: '#7C3AED', bg: '#EDE9FE' },
//     Completed: { color: BRAND.greenDark, bg: BRAND.soft },
//     Cancelled: { color: '#B91C1C', bg: '#FEE2E2' },
// };

// const FILTERS = ['All', 'Upcoming', 'Confirmed', 'Completed', 'Cancelled'];

// function formatDate(value) {
//     if (!value) return '—';
//     const d = new Date(value);
//     return isNaN(d) ? value : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
// }

// export default function Booking() {
//     const { bookings, drivers = [], stations = [], flash } = usePage().props;
//     const [filter, setFilter] = useState('All');
//     const [editingBooking, setEditingBooking] = useState(null);

//     const rows = bookings?.data ?? [];
//     const filtered = filter === 'All' ? rows : rows.filter((b) => b.status === filter);

//     const handleDelete = (booking) => {
//         if (!window.confirm(`Delete booking ${booking.booking_id}?`)) return;
//         router.delete(`/ourbooking/${booking.id}`, { preserveScroll: true });
//     };

//     return (
//         <AdminWrapper title="Bookings">
//             <Head title="Bookings" />

//             {flash?.success && (
//                 <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: BRAND.soft, color: BRAND.greenDark }}>
//                     {flash.success}
//                 </div>
//             )}

//             {/* ---------- Filter tabs ---------- */}
//             <div className="mb-4 flex flex-wrap gap-2">
//                 {FILTERS.map((f) => (
//                     <button
//                         key={f}
//                         onClick={() => setFilter(f)}
//                         className="rounded-full px-4 py-1.5 text-sm font-medium transition"
//                         style={
//                             filter === f
//                                 ? { backgroundColor: BRAND.green, color: '#fff' }
//                                 : { backgroundColor: '#fff', color: BRAND.ink, border: '1px solid rgba(0,0,0,0.08)' }
//                         }
//                     >
//                         {f}
//                     </button>
//                 ))}
//             </div>

//             {/* ---------- Bookings table ---------- */}
//             <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
//                 <div className="overflow-x-auto">
//                     <table className="w-full min-w-[820px] text-left text-sm">
//                         <thead>
//                             <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-[#0B1A16]/40">
//                                 <th className="px-5 py-3 font-medium">Booking ID</th>
//                                 <th className="px-5 py-3 font-medium">Driver</th>
//                                 <th className="px-5 py-3 font-medium">Station</th>
//                                 <th className="px-5 py-3 font-medium">Date & Slot</th>
//                                 <th className="px-5 py-3 font-medium">Amount</th>
//                                 <th className="px-5 py-3 font-medium">Status</th>
//                                 <th className="px-5 py-3 font-medium">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-black/5">
//                             {filtered.map((b) => {
//                                 const style = STATUS_STYLES[b.status] || STATUS_STYLES.Upcoming;
//                                 return (
//                                     <tr key={b.id} className="hover:bg-[#F4FAF7]">
//                                         <td className="px-5 py-3 font-medium text-[#0B1A16]">{b.booking_id}</td>
//                                         <td className="px-5 py-3 text-[#0B1A16]/80">{b.driver?.name ?? '—'}</td>
//                                         <td className="px-5 py-3 text-[#0B1A16]/70">{b.station?.station_name ?? '—'}</td>
//                                         <td className="px-5 py-3 text-[#0B1A16]/70">
//                                             {formatDate(b.booking_date)} · {b.start_time} – {b.end_time}
//                                         </td>
//                                         <td className="px-5 py-3 text-[#0B1A16]/70">
//                                             Rs {b.amount} <span className="text-[#0B1A16]/35">· {b.payment_method ?? '—'}</span>
//                                         </td>
//                                         <td className="px-5 py-3">
//                                             <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: style.color, backgroundColor: style.bg }}>
//                                                 {b.status}
//                                             </span>
//                                         </td>
//                                         <td className="px-5 py-3">
//                                             <div className="flex items-center gap-3">
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => setEditingBooking(b)}
//                                                     className="text-xs font-semibold"
//                                                     style={{ color: BRAND.greenDark }}
//                                                 >
//                                                     Edit
//                                                 </button>
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => handleDelete(b)}
//                                                     className="text-xs font-semibold text-red-500 hover:text-red-600"
//                                                 >
//                                                     Delete
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 );
//                             })}

//                             {filtered.length === 0 && (
//                                 <tr>
//                                     <td colSpan={7} className="px-5 py-8 text-center text-sm text-[#0B1A16]/40">
//                                         No bookings found.
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* ---------- Pagination ---------- */}
//             {bookings?.links?.length > 3 && (
//                 <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
//                     {bookings.links.map((link, i) => (
//                         <Link
//                             key={i}
//                             href={link.url || '#'}
//                             dangerouslySetInnerHTML={{ __html: link.label }}
//                             preserveScroll
//                             className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
//                                 link.active ? 'text-white' : 'text-[#0B1A16]/60 hover:bg-[#F4FAF7]'
//                             } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
//                             style={link.active ? { backgroundColor: BRAND.green } : undefined}
//                         />
//                     ))}
//                 </div>
//             )}

//             {/* ---------- Edit modal ---------- */}
//             {editingBooking && (
//                 <EditBooking
//                     booking={editingBooking}
//                     drivers={drivers}
//                     stations={stations}
//                     onClose={() => setEditingBooking(null)}
//                 />
//             )}
//         </AdminWrapper>
//     );
// }


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

function initials(name = '') {
    return name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

/** Station thumbnail with a safe fallback — avoids a broken-image icon if the
 *  storage symlink is missing (php artisan storage:link) or the station has
 *  no photo yet. */
function StationThumb({ station, size = 'h-9 w-9' }) {
    const [failed, setFailed] = useState(false);
    const src = station?.images?.[0];

    if (!src || failed) {
        return (
            <span
                className={`grid shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white ${size}`}
                style={{ backgroundColor: BRAND.ink }}
            >
                {initials(station?.station_name || '?')}
            </span>
        );
    }

    return (
        <img
            src={`/storage/${src}`}
            alt={station?.station_name}
            onError={() => setFailed(true)}
            className={`shrink-0 rounded-full object-cover ${size}`}
        />
    );
}

function StatusBadge({ status }) {
    const style = STATUS_STYLES[status] || STATUS_STYLES.Upcoming;
    return (
        <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: style.color, backgroundColor: style.bg }}>
            {status}
        </span>
    );
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

            {/* ---------- Mobile: stacked cards ---------- */}
            <div className="flex flex-col gap-3 sm:hidden">
                {filtered.map((b) => (
                    <div key={b.id} className="rounded-2xl border border-black/5 bg-white p-4">
                        <div className="flex items-start gap-3">
                            <StationThumb station={b.station} />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate text-sm font-semibold text-[#0B1A16]">{b.booking_id}</p>
                                    <StatusBadge status={b.status} />
                                </div>
                                <p className="mt-0.5 truncate text-xs text-[#0B1A16]/50">{b.station?.station_name ?? '—'}</p>
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-black/5 pt-3 text-xs">
                            <div>
                                <p className="text-[#0B1A16]/40">Driver</p>
                                <p className="font-medium text-[#0B1A16]">{b.driver?.name ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-[#0B1A16]/40">Amount</p>
                                <p className="font-medium text-[#0B1A16]">
                                    Rs {b.amount} <span className="text-[#0B1A16]/35">· {b.payment_method ?? '—'}</span>
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[#0B1A16]/40">Date & slot</p>
                                <p className="font-medium text-[#0B1A16]">
                                    {formatDate(b.booking_date)} · {b.start_time} – {b.end_time}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4 border-t border-black/5 pt-3">
                            <button type="button" onClick={() => setEditingBooking(b)} className="text-xs font-semibold" style={{ color: BRAND.greenDark }}>
                                Edit
                            </button>
                            <button type="button" onClick={() => handleDelete(b)} className="text-xs font-semibold text-red-500">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="rounded-2xl border border-black/5 bg-white py-8 text-center text-sm text-[#0B1A16]/40">No bookings found.</div>
                )}
            </div>

            {/* ---------- Tablet / laptop: table ---------- */}
            <div className="hidden overflow-hidden rounded-2xl border border-black/5 bg-white sm:block">
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
                            {filtered.map((b) => (
                                <tr key={b.id} className="hover:bg-[#F4FAF7]">
                                    <td className="px-5 py-3 font-medium text-[#0B1A16]">{b.booking_id}</td>
                                    <td className="px-5 py-3 text-[#0B1A16]/80">{b.driver?.name ?? '—'}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <StationThumb station={b.station} size="h-7 w-7" />
                                            <span className="text-[#0B1A16]/70">{b.station?.station_name ?? '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-[#0B1A16]/70">
                                        {formatDate(b.booking_date)} · {b.start_time} – {b.end_time}
                                    </td>
                                    <td className="px-5 py-3 text-[#0B1A16]/70">
                                        Rs {b.amount} <span className="text-[#0B1A16]/35">· {b.payment_method ?? '—'}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <StatusBadge status={b.status} />
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <button type="button" onClick={() => setEditingBooking(b)} className="text-xs font-semibold" style={{ color: BRAND.greenDark }}>
                                                Edit
                                            </button>
                                            <button type="button" onClick={() => handleDelete(b)} className="text-xs font-semibold text-red-500 hover:text-red-600">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

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