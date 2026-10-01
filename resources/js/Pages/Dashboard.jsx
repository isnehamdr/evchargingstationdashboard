
// import AdminWrapper from '@/AdminDashboard/AdminWrapper';
// import { Head } from '@inertiajs/react';

// /**
//  * ChargeSathi — Dashboard (operator home)
//  * Replaces the default Breeze "You're logged in!" placeholder.
//  */

// const BRAND = {
//     green: '#02C468',
//     greenDark: '#019654',
//     ink: '#0B1A16',
//     soft: '#F4FAF7',
// };

// const KPIS = [
//     { label: 'Active stations', value: '6', sub: 'across Pokhara & Kaski' },
//     { label: 'Sessions today', value: '38', sub: '+12% vs yesterday' },
//     { label: "Today's revenue", value: 'Rs 18,240', sub: 'via eSewa & Khalti' },
//     { label: 'Uptime', value: '99.2%', sub: 'last 7 days' },
// ];

// const WEEKLY_SESSIONS = [
//     { day: 'Mon', value: 24 },
//     { day: 'Tue', value: 31 },
//     { day: 'Wed', value: 28 },
//     { day: 'Thu', value: 40 },
//     { day: 'Fri', value: 35 },
//     { day: 'Sat', value: 52 },
//     { day: 'Sun', value: 38 },
// ];

// const STATIONS = [
//     { name: 'Lakeside Station 02', status: 'Available', free: '4 / 6' },
//     { name: 'Damside Station 01', status: 'Busy', free: '1 / 4' },
//     { name: 'Prithvi Chowk Hub', status: 'Available', free: '3 / 5' },
//     { name: 'Airport Road Station', status: 'Fault', free: '0 / 3' },
// ];

// const RECENT_BOOKINGS = [
//     { driver: 'Aayush T.', station: 'Lakeside Station 02', slot: '5:30 – 6:00 PM', paid: 'Rs 480', method: 'eSewa' },
//     { driver: 'Prakriti S.', station: 'Damside Station 01', slot: '4:00 – 4:30 PM', paid: 'Rs 420', method: 'Khalti' },
//     { driver: 'Bikash G.', station: 'Prithvi Chowk Hub', slot: '3:15 – 3:45 PM', paid: 'Rs 350', method: 'eSewa' },
// ];

// const STATUS_STYLES = {
//     Available: { color: BRAND.greenDark, bg: BRAND.soft },
//     Busy: { color: '#B45309', bg: '#FEF3C7' },
//     Fault: { color: '#B91C1C', bg: '#FEE2E2' },
// };

// export default function Dashboard() {
//     const maxSessions = Math.max(...WEEKLY_SESSIONS.map((d) => d.value));

//     return (
//         <>
//        <AdminWrapper title="Dashboard">
//             <Head title="Dashboard" />

//             {/* ---------- KPI cards ---------- */}
//             <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
//                 {KPIS.map((kpi) => (
//                     <div key={kpi.label} className="rounded-2xl border border-black/5 bg-white p-5">
//                         <p className="text-xs font-medium text-[#0B1A16]/50">{kpi.label}</p>
//                         <p className="mt-2 text-2xl font-bold tracking-tight text-[#0B1A16]">{kpi.value}</p>
//                         <p className="mt-1 text-xs" style={{ color: BRAND.greenDark }}>{kpi.sub}</p>
//                     </div>
//                 ))}
//             </div>

//             {/* ---------- Chart + station status ---------- */}
//             <div className="mt-6 grid gap-4 lg:grid-cols-3">
//                 <div className="rounded-2xl border border-black/5 bg-white p-6 lg:col-span-2">
//                     <div className="flex items-center justify-between">
//                         <h3 className="text-sm font-semibold text-[#0B1A16]">Sessions this week</h3>
//                         <span className="text-xs text-[#0B1A16]/40">Mon – Sun</span>
//                     </div>
//                     <div className="mt-6 flex h-40 items-end gap-3 sm:gap-5">
//                         {WEEKLY_SESSIONS.map((d) => (
//                             <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
//                                 <div className="flex h-32 w-full items-end">
//                                     <div
//                                         className="w-full rounded-t-lg"
//                                         style={{
//                                             height: `${(d.value / maxSessions) * 100}%`,
//                                             backgroundColor: d.day === 'Sat' ? BRAND.green : BRAND.soft,
//                                         }}
//                                     />
//                                 </div>
//                                 <span className="text-[11px] text-[#0B1A16]/40">{d.day}</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="rounded-2xl border border-black/5 bg-white p-6">
//                     <h3 className="text-sm font-semibold text-[#0B1A16]">Station status</h3>
//                     <ul className="mt-4 space-y-3">
//                         {STATIONS.map((s) => {
//                             const style = STATUS_STYLES[s.status];
//                             return (
//                                 <li key={s.name} className="flex items-center justify-between">
//                                     <div className="min-w-0">
//                                         <p className="truncate text-sm font-medium text-[#0B1A16]">{s.name}</p>
//                                         <p className="text-xs text-[#0B1A16]/45">{s.free} connectors free</p>
//                                     </div>
//                                     <span
//                                         className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
//                                         style={{ color: style.color, backgroundColor: style.bg }}
//                                     >
//                                         {s.status}
//                                     </span>
//                                 </li>
//                             );
//                         })}
//                     </ul>
//                 </div>
//             </div>

//             {/* ---------- Recent bookings ---------- */}
//             <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6">
//                 <h3 className="text-sm font-semibold text-[#0B1A16]">Recent bookings</h3>
//                 <div className="mt-4 overflow-x-auto">
//                     <table className="w-full min-w-[520px] text-left text-sm">
//                         <thead>
//                             <tr className="text-xs uppercase tracking-wide text-[#0B1A16]/40">
//                                 <th className="pb-3 font-medium">Driver</th>
//                                 <th className="pb-3 font-medium">Station</th>
//                                 <th className="pb-3 font-medium">Slot</th>
//                                 <th className="pb-3 font-medium">Paid</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-black/5">
//                             {RECENT_BOOKINGS.map((b) => (
//                                 <tr key={b.driver + b.slot}>
//                                     <td className="py-3 font-medium text-[#0B1A16]">{b.driver}</td>
//                                     <td className="py-3 text-[#0B1A16]/70">{b.station}</td>
//                                     <td className="py-3 text-[#0B1A16]/70">{b.slot}</td>
//                                     <td className="py-3 text-[#0B1A16]/70">
//                                         {b.paid} <span className="text-[#0B1A16]/35">· {b.method}</span>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//             </AdminWrapper>
//       </>
//     );
// }



import AdminWrapper from '@/AdminDashboard/AdminWrapper';
import { Head, Link } from '@inertiajs/react';

/**
 * ChargeSathi — Dashboard (operator home)
 */

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    ink: '#0B1A16',
    soft: '#F4FAF7',
    amber: '#B45309',
    amberSoft: '#FEF3C7',
    red: '#B91C1C',
    redSoft: '#FEE2E2',
    blue: '#1D4ED8',
    blueSoft: '#DBEAFE',
    slate: '#4B5563',
};

const STATUS_STYLES = {
    Available: { color: BRAND.greenDark, bg: BRAND.soft },
    Busy: { color: BRAND.amber, bg: BRAND.amberSoft },
    Fault: { color: BRAND.red, bg: BRAND.redSoft },
};

const SEVERITY_STYLES = {
    critical: { color: BRAND.red, bg: BRAND.redSoft, label: 'Critical' },
    warning: { color: BRAND.amber, bg: BRAND.amberSoft, label: 'Warning' },
    info: { color: BRAND.blue, bg: BRAND.blueSoft, label: 'Info' },
};

const KPIS = [
    { label: 'Active stations', value: '6', sub: 'across Pokhara & Kaski' },
    { label: 'Charging now', value: '9', sub: 'across all stations' },
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

// Sessions actively drawing power right now — distinct from future bookings.
const LIVE_SESSIONS = [
    { driver: 'Rohan K.', station: 'Lakeside Station 02', connector: 'CCS2', kwh: '12.4', elapsed: '18 min', cost: 'Rs 310' },
    { driver: 'Manisha P.', station: 'Damside Station 01', connector: 'Type 2', kwh: '6.8', elapsed: '9 min', cost: 'Rs 170' },
    { driver: 'Suman R.', station: 'Prithvi Chowk Hub', connector: 'CHAdeMO', kwh: '21.1', elapsed: '27 min', cost: 'Rs 528' },
];

// Grid stability + fault alerts — surfaces the load-shedding / congestion problem the platform targets.
const ALERTS = [
    { severity: 'critical', title: 'Connector offline', detail: 'Airport Road Station · Connector A unresponsive', time: '6m ago' },
    { severity: 'warning', title: 'Grid load rising', detail: 'Damside feeder at 82% capacity', time: '24m ago' },
    { severity: 'info', title: 'Scheduled maintenance', detail: 'Prithvi Chowk Hub · Sunday 6–8 AM', time: '2h ago' },
];

const RECENT_BOOKINGS = [
    { driver: 'Aayush T.', station: 'Lakeside Station 02', slot: '5:30 – 6:00 PM', paid: 'Rs 480', method: 'eSewa' },
    { driver: 'Prakriti S.', station: 'Damside Station 01', slot: '4:00 – 4:30 PM', paid: 'Rs 420', method: 'Khalti' },
    { driver: 'Bikash G.', station: 'Prithvi Chowk Hub', slot: '3:15 – 3:45 PM', paid: 'Rs 350', method: 'eSewa' },
];

const PAYMENT_SPLIT = [
    { label: 'eSewa', pct: 58, color: BRAND.green },
    { label: 'Khalti', pct: 34, color: BRAND.blue },
    { label: 'Cash', pct: 8, color: BRAND.slate },
];

const CONNECTOR_MIX = [
    { label: 'CCS2', pct: 46 },
    { label: 'Type 2', pct: 37 },
    { label: 'CHAdeMO', pct: 17 },
];

function ClockIcon(props) {
    return (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function PlugIcon(props) {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-5 5 5 5 0 0 1-5-5V8Z" strokeLinejoin="round" />
            <path d="M12 16v5" strokeLinecap="round" />
        </svg>
    );
}

function PlusIcon(props) {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
    );
}

function CalendarIcon(props) {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <rect x="3.5" y="5" width="17" height="16" rx="2" />
            <path d="M8 3v4M16 3v4M3.5 10h17" strokeLinecap="round" />
        </svg>
    );
}

function Card({ title, action, children, className = '' }) {
    return (
        <div className={`rounded-2xl border border-black/5 bg-white p-6 ${className}`}>
            {title && (
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#0B1A16]">{title}</h3>
                    {action}
                </div>
            )}
            {children}
        </div>
    );
}

function HeaderButton({ href, icon, children, primary = false }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                primary ? 'text-white hover:brightness-95' : 'border border-black/10 text-[#0B1A16] hover:bg-[#F4FAF7]'
            }`}
            style={primary ? { backgroundColor: BRAND.green } : undefined}
        >
            {icon}
            {children}
        </Link>
    );
}

export default function Dashboard() {
    const maxSessions = Math.max(...WEEKLY_SESSIONS.map((d) => d.value));

    return (
        <AdminWrapper
            title="Dashboard"
            actions={
                <>
                    <HeaderButton href="/stations/create" icon={<PlusIcon />}>
                        Add station
                    </HeaderButton>
                    <HeaderButton href="/bookings/create" icon={<CalendarIcon />} primary>
                        New booking
                    </HeaderButton>
                </>
            }
        >
            <Head title="Dashboard" />

            {/* ---------- KPI cards ---------- */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {KPIS.map((kpi) => (
                    <div key={kpi.label} className="rounded-2xl border border-black/5 bg-white p-5">
                        <p className="text-xs font-medium text-[#0B1A16]/50">{kpi.label}</p>
                        <p className="mt-2 text-2xl font-bold tracking-tight text-[#0B1A16]">{kpi.value}</p>
                        <p className="mt-1 text-xs" style={{ color: BRAND.greenDark }}>
                            {kpi.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* ---------- Chart + station status ---------- */}
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <Card title="Sessions this week" action={<span className="text-xs text-[#0B1A16]/40">Mon – Sun</span>} className="lg:col-span-2">
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
                </Card>

                <Card title="Station status">
                    <ul className="mt-4 space-y-3">
                        {STATIONS.map((s) => {
                            const style = STATUS_STYLES[s.status];
                            return (
                                <li key={s.name} className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-[#0B1A16]">{s.name}</p>
                                        <p className="text-xs text-[#0B1A16]/45">{s.free} connectors free</p>
                                    </div>
                                    <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: style.color, backgroundColor: style.bg }}>
                                        {s.status}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </Card>
            </div>

            {/* ---------- Live sessions + alerts ---------- */}
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <Card title="Live charging sessions" action={<span className="text-xs text-[#0B1A16]/40">{LIVE_SESSIONS.length} in progress</span>} className="lg:col-span-2">
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full min-w-[520px] text-left text-sm">
                            <thead>
                                <tr className="text-xs uppercase tracking-wide text-[#0B1A16]/40">
                                    <th className="pb-3 font-medium">Driver</th>
                                    <th className="pb-3 font-medium">Station</th>
                                    <th className="pb-3 font-medium">Connector</th>
                                    <th className="pb-3 font-medium">Delivered</th>
                                    <th className="pb-3 font-medium">Elapsed</th>
                                    <th className="pb-3 font-medium">Est. cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                {LIVE_SESSIONS.map((s) => (
                                    <tr key={s.driver}>
                                        <td className="py-3 font-medium text-[#0B1A16]">{s.driver}</td>
                                        <td className="py-3 text-[#0B1A16]/70">{s.station}</td>
                                        <td className="py-3 text-[#0B1A16]/70">{s.connector}</td>
                                        <td className="py-3 text-[#0B1A16]/70">{s.kwh} kWh</td>
                                        <td className="py-3 text-[#0B1A16]/70">
                                            <span className="inline-flex items-center gap-1">
                                                <ClockIcon className="text-[#0B1A16]/35" />
                                                {s.elapsed}
                                            </span>
                                        </td>
                                        <td className="py-3 font-medium text-[#0B1A16]">{s.cost}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card title="Grid & fault alerts" action={<Link href="/faults" className="text-xs font-semibold" style={{ color: BRAND.greenDark }}>View all</Link>}>
                    <ul className="mt-4 space-y-3">
                        {ALERTS.map((a) => {
                            const style = SEVERITY_STYLES[a.severity];
                            return (
                                <li key={a.title} className="rounded-xl p-3" style={{ backgroundColor: style.bg }}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold" style={{ color: style.color }}>
                                            {style.label}
                                        </span>
                                        <span className="text-[11px] text-[#0B1A16]/40">{a.time}</span>
                                    </div>
                                    <p className="mt-1 text-sm font-medium text-[#0B1A16]">{a.title}</p>
                                    <p className="text-xs text-[#0B1A16]/55">{a.detail}</p>
                                </li>
                            );
                        })}
                    </ul>
                </Card>
            </div>

            {/* ---------- Recent bookings + revenue / connector mix ---------- */}
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <Card title="Recent bookings" className="lg:col-span-2">
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
                </Card>

                <div className="flex flex-col gap-4">
                    <Card title="Revenue by method">
                        <ul className="mt-4 space-y-3">
                            {PAYMENT_SPLIT.map((p) => (
                                <li key={p.label}>
                                    <div className="mb-1 flex items-center justify-between text-xs">
                                        <span className="font-medium text-[#0B1A16]/70">{p.label}</span>
                                        <span className="font-semibold text-[#0B1A16]">{p.pct}%</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F4FAF7]">
                                        <div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: p.color }} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card title="Connector mix">
                        <ul className="mt-4 space-y-3">
                            {CONNECTOR_MIX.map((c) => (
                                <li key={c.label} className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-2 text-sm text-[#0B1A16]/70">
                                        <PlugIcon className="text-[#0B1A16]/35" />
                                        {c.label}
                                    </span>
                                    <span className="text-sm font-semibold text-[#0B1A16]">{c.pct}%</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </AdminWrapper>
    );
}