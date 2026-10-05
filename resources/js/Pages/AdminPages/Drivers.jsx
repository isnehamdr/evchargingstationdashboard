import AdminWrapper from '@/AdminDashboard/AdminWrapper';
import AddDriver from '@/AddForm/AddDriver'; // adjust to where you saved AddDriver.jsx
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    soft: '#F4FAF7',
    ink: '#0B1A16',
    red: '#B91C1C',
    redSoft: '#FEE2E2',
};

const STATUS_STYLES = {
    Active: { color: BRAND.greenDark, bg: BRAND.soft },
    Suspended: { color: BRAND.red, bg: BRAND.redSoft },
};

const FILTERS = ['All', 'Active', 'Suspended'];

const money = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

function Card({ title, children, className = '' }) {
    return (
        <div className={`rounded-2xl border border-black/5 bg-white p-6 ${className}`}>
            {title && <h3 className="mb-4 text-sm font-semibold text-[#0B1A16]">{title}</h3>}
            {children}
        </div>
    );
}

function Kpi({ label, value }) {
    return (
        <div className="rounded-2xl border border-black/5 bg-white p-5">
            <p className="text-xs font-medium text-[#0B1A16]/50">{label}</p>
            <p className="mt-2 text-2xl font-bold text-[#0B1A16]">{value}</p>
        </div>
    );
}

export default function Drivers({ drivers = [], stats = {} }) {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);

    const filtered = drivers.filter((d) => {
        const matchesStatus = filter === 'All' || d.driver_status === filter;
        const q = search.trim().toLowerCase();
        const matchesSearch =
            !q ||
            [d.name, d.email, d.phone, d.vehicle_number].some((v) =>
                (v ?? '').toLowerCase().includes(q)
            );
        return matchesStatus && matchesSearch;
    });

    const toggleStatus = (d) => {
        const next = d.driver_status === 'Active' ? 'Suspended' : 'Active';
        router.put(route('ourdrivers.update', d.id), { driver_status: next }, { preserveScroll: true });
    };

    const remove = (d) => {
        if (confirm(`Remove ${d.name}? This cannot be undone.`)) {
            router.delete(route('ourdrivers.destroy', d.id), { preserveScroll: true });
        }
    };

    return (
        <AdminWrapper title="Drivers">
            <Head title="Drivers" />

            {/* ---------- KPI row ---------- */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Kpi label="Total drivers" value={stats.total ?? 0} />
                <Kpi label="Active" value={stats.active ?? 0} />
                <Kpi label="Suspended" value={stats.suspended ?? 0} />
                <Kpi label="Total bookings" value={stats.bookings ?? 0} />
            </div>

            {/* ---------- Drivers table ---------- */}
            <Card className="mt-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-[#0B1A16]">All drivers</h3>

                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name, email, vehicle…"
                            className="w-56 rounded-full border border-black/10 px-3.5 py-1.5 text-xs outline-none focus:border-[#02C468]"
                        />
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFilter(f)}
                                className="rounded-full px-3.5 py-1.5 text-xs font-medium transition"
                                style={
                                    filter === f
                                        ? { backgroundColor: BRAND.green, color: '#fff' }
                                        : {
                                              backgroundColor: '#fff',
                                              color: BRAND.ink,
                                              border: '1px solid rgba(0,0,0,0.08)',
                                          }
                                }
                            >
                                {f}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="rounded-full px-4 py-1.5 text-xs font-semibold text-white"
                            style={{ backgroundColor: BRAND.greenDark }}
                        >
                            + Add driver
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-[#0B1A16]/40">
                                <th className="py-3 font-medium">Driver</th>
                                <th className="py-3 font-medium">Phone</th>
                                <th className="py-3 font-medium">Vehicle</th>
                                <th className="py-3 font-medium">Connector</th>
                                <th className="py-3 font-medium">Bookings</th>
                                <th className="py-3 font-medium">Total spent</th>
                                <th className="py-3 font-medium">Status</th>
                                <th className="py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {filtered.map((d) => {
                                const st = STATUS_STYLES[d.driver_status] || STATUS_STYLES.Active;
                                return (
                                    <tr key={d.id} className="hover:bg-[#F4FAF7]">
                                        <td className="py-3">
                                            <p className="font-medium text-[#0B1A16]">{d.name}</p>
                                            <p className="text-xs text-[#0B1A16]/40">{d.email}</p>
                                        </td>
                                        <td className="py-3 text-[#0B1A16]/70">{d.phone ?? '—'}</td>
                                        <td className="py-3 text-[#0B1A16]/70">
                                            {d.vehicle_model ?? '—'}
                                            {d.vehicle_number && (
                                                <span className="text-[#0B1A16]/35"> · {d.vehicle_number}</span>
                                            )}
                                        </td>
                                        <td className="py-3 text-[#0B1A16]/70">{d.connector_type ?? '—'}</td>
                                        <td className="py-3 text-[#0B1A16]/70">{d.bookings_count ?? 0}</td>
                                        <td className="py-3 font-medium text-[#0B1A16]">{money(d.total_spent)}</td>
                                        <td className="py-3">
                                            <span
                                                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                                                style={{ color: st.color, backgroundColor: st.bg }}
                                            >
                                                {d.driver_status}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleStatus(d)}
                                                    className="text-xs font-semibold"
                                                    style={{ color: BRAND.greenDark }}
                                                >
                                                    {d.driver_status === 'Active' ? 'Suspend' : 'Activate'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(d)}
                                                    className="text-xs font-semibold"
                                                    style={{ color: BRAND.red }}
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
                                    <td colSpan={8} className="py-8 text-center text-sm text-[#0B1A16]/40">
                                        No drivers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ---------- Add driver popup ---------- */}
            <AddDriver show={showForm} onClose={() => setShowForm(false)} />
        </AdminWrapper>
    );
}