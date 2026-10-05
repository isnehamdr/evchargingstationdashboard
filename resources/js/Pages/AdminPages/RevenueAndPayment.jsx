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
};

const STATUS_STYLES = {
    Paid: { color: BRAND.greenDark, bg: BRAND.soft },
    Pending: { color: BRAND.amber, bg: BRAND.amberSoft },
    Failed: { color: BRAND.red, bg: BRAND.redSoft },
};

const FILTERS = ['All', 'Paid', 'Pending', 'Failed'];

const money = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

function Card({ title, children, className = '' }) {
    return (
        <div className={`rounded-2xl border border-black/5 bg-white p-6 ${className}`}>
            {title && <h3 className="mb-4 text-sm font-semibold text-[#0B1A16]">{title}</h3>}
            {children}
        </div>
    );
}

function Kpi({ label, value, note, noteColor }) {
    return (
        <div className="rounded-2xl border border-black/5 bg-white p-5">
            <p className="text-xs font-medium text-[#0B1A16]/50">{label}</p>
            <p className="mt-2 text-2xl font-bold text-[#0B1A16]">{value}</p>
            <p className="mt-1 text-xs" style={{ color: noteColor || 'rgba(11,26,22,0.4)' }}>
                {note}
            </p>
        </div>
    );
}

export default function RevenueAndPayment({ stats = {}, monthly = [], payments = [] }) {
    const [filter, setFilter] = useState('All');

    const filtered = filter === 'All' ? payments : payments.filter((p) => p.payment_status === filter);
    const maxMonth = Math.max(...monthly.map((m) => m.total), 1);

    return (
        <AdminWrapper title="Revenue & Payments">
            <Head title="Revenue & Payments" />

            {/* ---------- KPI row ---------- */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Kpi label="Total revenue" value={money(stats.total)} note="All paid bookings" />
                <Kpi
                    label="This month"
                    value={money(stats.month)}
                    note="Paid so far"
                    noteColor={BRAND.greenDark}
                />
                <Kpi
                    label="Pending payments"
                    value={money(stats.pending)}
                    note="Awaiting payment"
                    noteColor={BRAND.amber}
                />
                <Kpi
                    label="Failed payments"
                    value={stats.failed ?? 0}
                    note="Needs follow-up"
                    noteColor={stats.failed > 0 ? BRAND.red : BRAND.greenDark}
                />
            </div>

            {/* ---------- Monthly revenue chart ---------- */}
            <Card title="Revenue, last 6 months" className="mt-6">
                <div className="flex h-48 items-end gap-4">
                    {monthly.map((m) => (
                        <div key={m.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                            <span className="text-xs text-[#0B1A16]/50">{m.total ? money(m.total) : ''}</span>
                            <div
                                className="w-full rounded-t-lg"
                                style={{
                                    height: `${(m.total / maxMonth) * 100}%`,
                                    minHeight: 4,
                                    backgroundColor: BRAND.green,
                                }}
                            />
                            <span className="text-xs font-medium text-[#0B1A16]/60">{m.label}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* ---------- Payments table ---------- */}
            <Card className="mt-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-[#0B1A16]">Payments</h3>
                    <div className="flex flex-wrap gap-2">
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
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-[#0B1A16]/40">
                                <th className="py-3 font-medium">Booking</th>
                                <th className="py-3 font-medium">Driver</th>
                                <th className="py-3 font-medium">Station</th>
                                <th className="py-3 font-medium">Method</th>
                                <th className="py-3 font-medium">Amount</th>
                                <th className="py-3 font-medium">Date</th>
                                <th className="py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {filtered.map((p) => {
                                const st = STATUS_STYLES[p.payment_status] || STATUS_STYLES.Pending;
                                return (
                                    <tr key={p.id} className="hover:bg-[#F4FAF7]">
                                        <td className="py-3 font-medium text-[#0B1A16]">{p.booking_id}</td>
                                        <td className="py-3 text-[#0B1A16]/70">{p.driver?.name ?? '—'}</td>
                                        <td className="py-3 text-[#0B1A16]/70">{p.station?.name ?? '—'}</td>
                                        <td className="py-3 text-[#0B1A16]/70">{p.payment_method ?? '—'}</td>
                                        <td className="py-3 font-medium text-[#0B1A16]">{money(p.amount)}</td>
                                        <td className="py-3 text-[#0B1A16]/50">{formatDate(p.booking_date)}</td>
                                        <td className="py-3">
                                            <span
                                                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                                                style={{ color: st.color, backgroundColor: st.bg }}
                                            >
                                                {p.payment_status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-sm text-[#0B1A16]/40">
                                        No payments in this filter.
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