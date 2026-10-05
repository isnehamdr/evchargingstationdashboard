import AdminWrapper from '@/AdminDashboard/AdminWrapper';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    soft: '#F4FAF7',
    ink: '#0B1A16',
    amber: '#B45309',
    amberSoft: '#FEF3C7',
    red: '#B91C1C',
    redSoft: '#FEE2E2',
    blue: '#1D4ED8',
    blueSoft: '#DBEAFE',
};

// ---------- Grid feeder status — stability of the power supply itself ----------
const GRID_STATUS = {
    Stable: { color: BRAND.greenDark, bg: BRAND.soft },
    Elevated: { color: BRAND.amber, bg: BRAND.amberSoft },
    Critical: { color: BRAND.red, bg: BRAND.redSoft },
};

const FEEDERS = [
    { name: 'Lakeside Feeder', load: 54, status: 'Stable' },
    { name: 'Damside Feeder', load: 82, status: 'Elevated' },
    { name: 'Prithvi Chowk Feeder', load: 61, status: 'Stable' },
    { name: 'Airport Road Feeder', load: 38, status: 'Stable' },
];

// ---------- Hardware faults — problems at a specific station/connector ----------
const SEVERITY_STYLES = {
    Critical: { color: BRAND.red, bg: BRAND.redSoft },
    Warning: { color: BRAND.amber, bg: BRAND.amberSoft },
    Info: { color: BRAND.blue, bg: BRAND.blueSoft },
};

const STATUS_STYLES = {
    Open: { color: BRAND.red, bg: BRAND.redSoft },
    Acknowledged: { color: BRAND.amber, bg: BRAND.amberSoft },
    Resolved: { color: BRAND.greenDark, bg: BRAND.soft },
};

const INITIAL_FAULTS = [
    { id: 'FLT-104', station: 'Airport Road Station', connector: 'Connector A', issue: 'Connector unresponsive', severity: 'Critical', status: 'Open', time: '6m ago' },
    { id: 'FLT-103', station: 'Damside Station 01', connector: 'Connector C', issue: 'Intermittent power drop', severity: 'Warning', status: 'Open', time: '41m ago' },
    { id: 'FLT-102', station: 'Prithvi Chowk Hub', connector: 'Connector B', issue: 'Firmware update pending', severity: 'Info', status: 'Acknowledged', time: '3h ago' },
    { id: 'FLT-101', station: 'Lakeside Station 02', connector: 'Connector D', issue: 'Card reader offline', severity: 'Warning', status: 'Resolved', time: 'Yesterday' },
];

const FILTERS = ['All', 'Open', 'Acknowledged', 'Resolved'];

function Card({ title, children, className = '' }) {
    return (
        <div className={`rounded-2xl border border-black/5 bg-white p-6 ${className}`}>
            {title && <h3 className="mb-4 text-sm font-semibold text-[#0B1A16]">{title}</h3>}
            {children}
        </div>
    );
}

export default function GridFaults() {
    const [faults, setFaults] = useState(INITIAL_FAULTS);
    const [filter, setFilter] = useState('All');

    const filtered = filter === 'All' ? faults : faults.filter((f) => f.status === filter);
    const openCount = faults.filter((f) => f.status === 'Open').length;
    const criticalFeeders = FEEDERS.filter((f) => f.status !== 'Stable').length;

    const advanceStatus = (id) => {
        setFaults((prev) =>
            prev.map((f) => {
                if (f.id !== id) return f;
                const next = f.status === 'Open' ? 'Acknowledged' : f.status === 'Acknowledged' ? 'Resolved' : 'Resolved';
                return { ...f, status: next };
            })
        );
    };

    return (
        <AdminWrapper title="Grid & Faults">
            <Head title="Grid & Faults" />

            {/* ---------- KPI row ---------- */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border border-black/5 bg-white p-5">
                    <p className="text-xs font-medium text-[#0B1A16]/50">Open faults</p>
                    <p className="mt-2 text-2xl font-bold text-[#0B1A16]">{openCount}</p>
                    <p className="mt-1 text-xs" style={{ color: openCount > 0 ? BRAND.red : BRAND.greenDark }}>
                        {openCount > 0 ? 'Needs attention' : 'All clear'}
                    </p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-5">
                    <p className="text-xs font-medium text-[#0B1A16]/50">Feeders at risk</p>
                    <p className="mt-2 text-2xl font-bold text-[#0B1A16]">{criticalFeeders}/{FEEDERS.length}</p>
                    <p className="mt-1 text-xs text-[#0B1A16]/40">Above 75% load</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-5">
                    <p className="text-xs font-medium text-[#0B1A16]/50">Avg feeder load</p>
                    <p className="mt-2 text-2xl font-bold text-[#0B1A16]">
                        {Math.round(FEEDERS.reduce((n, f) => n + f.load, 0) / FEEDERS.length)}%
                    </p>
                    <p className="mt-1 text-xs text-[#0B1A16]/40">Across all feeders</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-5">
                    <p className="text-xs font-medium text-[#0B1A16]/50">Faults resolved today</p>
                    <p className="mt-2 text-2xl font-bold text-[#0B1A16]">{faults.filter((f) => f.status === 'Resolved').length}</p>
                    <p className="mt-1 text-xs" style={{ color: BRAND.greenDark }}>
                        Keep it up
                    </p>
                </div>
            </div>

            {/* ---------- Grid feeder status ---------- */}
            <Card title="Grid feeder status" className="mt-6">
                <ul className="space-y-3">
                    {FEEDERS.map((f) => {
                        const style = GRID_STATUS[f.status];
                        return (
                            <li key={f.name} className="flex items-center gap-4">
                                <div className="w-40 shrink-0">
                                    <p className="truncate text-sm font-medium text-[#0B1A16]">{f.name}</p>
                                </div>
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F4FAF7]">
                                    <div
                                        className="h-full rounded-full"
                                        style={{ width: `${f.load}%`, backgroundColor: style.color }}
                                    />
                                </div>
                                <span className="w-10 shrink-0 text-right text-xs font-semibold text-[#0B1A16]/60">{f.load}%</span>
                                <span
                                    className="w-24 shrink-0 rounded-full px-2.5 py-1 text-center text-xs font-semibold"
                                    style={{ color: style.color, backgroundColor: style.bg }}
                                >
                                    {f.status}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </Card>

            {/* ---------- Faults ---------- */}
            <Card className="mt-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-[#0B1A16]">Faults</h3>
                    <div className="flex flex-wrap gap-2">
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className="rounded-full px-3.5 py-1.5 text-xs font-medium transition"
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
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-[#0B1A16]/40">
                                <th className="py-3 font-medium">Fault ID</th>
                                <th className="py-3 font-medium">Station</th>
                                <th className="py-3 font-medium">Issue</th>
                                <th className="py-3 font-medium">Severity</th>
                                <th className="py-3 font-medium">Reported</th>
                                <th className="py-3 font-medium">Status</th>
                                <th className="py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {filtered.map((f) => {
                                const sev = SEVERITY_STYLES[f.severity];
                                const st = STATUS_STYLES[f.status];
                                return (
                                    <tr key={f.id} className="hover:bg-[#F4FAF7]">
                                        <td className="py-3 font-medium text-[#0B1A16]">{f.id}</td>
                                        <td className="py-3 text-[#0B1A16]/70">
                                            {f.station}
                                            <span className="text-[#0B1A16]/35"> · {f.connector}</span>
                                        </td>
                                        <td className="py-3 text-[#0B1A16]/70">{f.issue}</td>
                                        <td className="py-3">
                                            <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: sev.color, backgroundColor: sev.bg }}>
                                                {f.severity}
                                            </span>
                                        </td>
                                        <td className="py-3 text-[#0B1A16]/50">{f.time}</td>
                                        <td className="py-3">
                                            <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: st.color, backgroundColor: st.bg }}>
                                                {f.status}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            {f.status !== 'Resolved' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => advanceStatus(f.id)}
                                                    className="text-xs font-semibold"
                                                    style={{ color: BRAND.greenDark }}
                                                >
                                                    {f.status === 'Open' ? 'Acknowledge' : 'Mark resolved'}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-[#0B1A16]/30">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-sm text-[#0B1A16]/40">
                                        No faults in this filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AdminWrapper>
    );
}