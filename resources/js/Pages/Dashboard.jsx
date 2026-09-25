
import AdminWrapper from '@/AdminDashboard/AdminWrapper';
import { Head } from '@inertiajs/react';

/**
 * ChargeSathi — Dashboard (operator home)
 * Replaces the default Breeze "You're logged in!" placeholder.
 */

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    ink: '#0B1A16',
    soft: '#F4FAF7',
};

const KPIS = [
    { label: 'Active stations', value: '6', sub: 'across Pokhara & Kaski' },
    { label: 'Sessions today', value: '38', sub: '+12% vs yesterday' },
    { label: "Today's revenue", value: 'Rs 18,240', sub: 'via eSewa & Khalti' },
    { label: 'Uptime', value: '99.2%', sub: 'last 7 days' },
];

const WEEKLY_SESSIONS = [
    { day: 'Mon', value: 24 },
    { day: 'Tue', value: 31 },
    { day: 'Wed', value: 28 },
    { day: 'Thu', value: 40 },
    { day: 'Fri', value: 35 },
    { day: 'Sat', value: 52 },
    { day: 'Sun', value: 38 },
];

const STATIONS = [
    { name: 'Lakeside Station 02', status: 'Available', free: '4 / 6' },
    { name: 'Damside Station 01', status: 'Busy', free: '1 / 4' },
    { name: 'Prithvi Chowk Hub', status: 'Available', free: '3 / 5' },
    { name: 'Airport Road Station', status: 'Fault', free: '0 / 3' },
];

const RECENT_BOOKINGS = [
    { driver: 'Aayush T.', station: 'Lakeside Station 02', slot: '5:30 – 6:00 PM', paid: 'Rs 480', method: 'eSewa' },
    { driver: 'Prakriti S.', station: 'Damside Station 01', slot: '4:00 – 4:30 PM', paid: 'Rs 420', method: 'Khalti' },
    { driver: 'Bikash G.', station: 'Prithvi Chowk Hub', slot: '3:15 – 3:45 PM', paid: 'Rs 350', method: 'eSewa' },
];

const STATUS_STYLES = {
    Available: { color: BRAND.greenDark, bg: BRAND.soft },
    Busy: { color: '#B45309', bg: '#FEF3C7' },
    Fault: { color: '#B91C1C', bg: '#FEE2E2' },
};

export default function Dashboard() {
    const maxSessions = Math.max(...WEEKLY_SESSIONS.map((d) => d.value));

    return (
        <>
       <AdminWrapper title="Dashboard">
            <Head title="Dashboard" />

            {/* ---------- KPI cards ---------- */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {KPIS.map((kpi) => (
                    <div key={kpi.label} className="rounded-2xl border border-black/5 bg-white p-5">
                        <p className="text-xs font-medium text-[#0B1A16]/50">{kpi.label}</p>
                        <p className="mt-2 text-2xl font-bold tracking-tight text-[#0B1A16]">{kpi.value}</p>
                        <p className="mt-1 text-xs" style={{ color: BRAND.greenDark }}>{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* ---------- Chart + station status ---------- */}
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-black/5 bg-white p-6 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[#0B1A16]">Sessions this week</h3>
                        <span className="text-xs text-[#0B1A16]/40">Mon – Sun</span>
                    </div>
                    <div className="mt-6 flex h-40 items-end gap-3 sm:gap-5">
                        {WEEKLY_SESSIONS.map((d) => (
                            <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                                <div className="flex h-32 w-full items-end">
                                    <div
                                        className="w-full rounded-t-lg"
                                        style={{
                                            height: `${(d.value / maxSessions) * 100}%`,
                                            backgroundColor: d.day === 'Sat' ? BRAND.green : BRAND.soft,
                                        }}
                                    />
                                </div>
                                <span className="text-[11px] text-[#0B1A16]/40">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-black/5 bg-white p-6">
                    <h3 className="text-sm font-semibold text-[#0B1A16]">Station status</h3>
                    <ul className="mt-4 space-y-3">
                        {STATIONS.map((s) => {
                            const style = STATUS_STYLES[s.status];
                            return (
                                <li key={s.name} className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-[#0B1A16]">{s.name}</p>
                                        <p className="text-xs text-[#0B1A16]/45">{s.free} connectors free</p>
                                    </div>
                                    <span
                                        className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
                                        style={{ color: style.color, backgroundColor: style.bg }}
                                    >
                                        {s.status}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* ---------- Recent bookings ---------- */}
            <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6">
                <h3 className="text-sm font-semibold text-[#0B1A16]">Recent bookings</h3>
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wide text-[#0B1A16]/40">
                                <th className="pb-3 font-medium">Driver</th>
                                <th className="pb-3 font-medium">Station</th>
                                <th className="pb-3 font-medium">Slot</th>
                                <th className="pb-3 font-medium">Paid</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {RECENT_BOOKINGS.map((b) => (
                                <tr key={b.driver + b.slot}>
                                    <td className="py-3 font-medium text-[#0B1A16]">{b.driver}</td>
                                    <td className="py-3 text-[#0B1A16]/70">{b.station}</td>
                                    <td className="py-3 text-[#0B1A16]/70">{b.slot}</td>
                                    <td className="py-3 text-[#0B1A16]/70">
                                        {b.paid} <span className="text-[#0B1A16]/35">· {b.method}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            </AdminWrapper>
      </>
    );
}