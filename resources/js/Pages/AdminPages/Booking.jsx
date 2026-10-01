import AdminWrapper from '@/AdminDashboard/AdminWrapper';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    soft: '#F4FAF7',
    ink: '#0B1A16',
};

const STATUS_STYLES = {
    Upcoming: { color: '#1D4ED8', bg: '#DBEAFE' },
    Completed: { color: BRAND.greenDark, bg: BRAND.soft },
    Cancelled: { color: '#B91C1C', bg: '#FEE2E2' },
};

const BOOKINGS = [
    { id: 'BK-1042', driver: 'Aayush T.', station: 'Lakeside Station 02', date: '29 Sep', slot: '5:30 – 6:00 PM', amount: 'Rs 480', method: 'eSewa', status: 'Upcoming' },
    { id: 'BK-1041', driver: 'Prakriti S.', station: 'Damside Station 01', date: '29 Sep', slot: '4:00 – 4:30 PM', amount: 'Rs 420', method: 'Khalti', status: 'Upcoming' },
    { id: 'BK-1040', driver: 'Bikash G.', station: 'Prithvi Chowk Hub', date: '28 Sep', slot: '3:15 – 3:45 PM', amount: 'Rs 350', method: 'eSewa', status: 'Completed' },
    { id: 'BK-1039', driver: 'Sujata M.', station: 'Lakeside Station 02', date: '28 Sep', slot: '1:00 – 1:30 PM', amount: 'Rs 300', method: 'Khalti', status: 'Completed' },
    { id: 'BK-1038', driver: 'Rohan K.', station: 'Airport Road Station', date: '27 Sep', slot: '11:00 – 11:30 AM', amount: 'Rs 280', method: 'eSewa', status: 'Cancelled' },
];

const FILTERS = ['All', 'Upcoming', 'Completed', 'Cancelled'];

export default function Booking() {
    const [filter, setFilter] = useState('All');

    const filtered = filter === 'All' ? BOOKINGS : BOOKINGS.filter((b) => b.status === filter);

    return (
        <AdminWrapper title="Bookings">
            <Head title="Bookings" />

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
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-[#0B1A16]/40">
                                <th className="px-5 py-3 font-medium">Booking ID</th>
                                <th className="px-5 py-3 font-medium">Driver</th>
                                <th className="px-5 py-3 font-medium">Station</th>
                                <th className="px-5 py-3 font-medium">Date & Slot</th>
                                <th className="px-5 py-3 font-medium">Amount</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {filtered.map((b) => {
                                const style = STATUS_STYLES[b.status];
                                return (
                                    <tr key={b.id} className="hover:bg-[#F4FAF7]">
                                        <td className="px-5 py-3 font-medium text-[#0B1A16]">{b.id}</td>
                                        <td className="px-5 py-3 text-[#0B1A16]/80">{b.driver}</td>
                                        <td className="px-5 py-3 text-[#0B1A16]/70">{b.station}</td>
                                        <td className="px-5 py-3 text-[#0B1A16]/70">
                                            {b.date} · {b.slot}
                                        </td>
                                        <td className="px-5 py-3 text-[#0B1A16]/70">
                                            {b.amount} <span className="text-[#0B1A16]/35">· {b.method}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span
                                                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                                                style={{ color: style.color, backgroundColor: style.bg }}
                                            >
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-[#0B1A16]/40">
                                        No bookings found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminWrapper>
    );
}