import AdminWrapper from '@/AdminDashboard/AdminWrapper';
import { Head, router, usePage } from '@inertiajs/react';

const BRAND = { green: '#02C468', greenDark: '#019654', soft: '#F4FAF7', ink: '#0B1A16', amber: '#B45309', amberSoft: '#FEF3C7' };

const money = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

function Kpi({ label, value }) {
    return (
        <div className="rounded-2xl border border-black/5 bg-white p-5">
            <p className="text-xs font-medium text-[#0B1A16]/50">{label}</p>
            <p className="mt-2 text-2xl font-bold text-[#0B1A16]">{value}</p>
        </div>
    );
}

export default function Commission({ period, percent, rows = [], totals = {} }) {
    const { flash } = usePage().props;

    const changeMonth = (month) => {
        if (month) router.get(route('commission.index'), { month }, { preserveState: true, replace: true });
    };

    const settle = (r) => {
        if (confirm(`Mark ${r.name} as settled for ${period}? Total ${money(r.total_due)}.`)) {
            router.post(route('commission.settle', r.id), { month: period }, { preserveScroll: true });
        }
    };

    return (
        <AdminWrapper title="Commission">
            <Head title="Commission" />

            {flash?.success && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: BRAND.soft, color: BRAND.greenDark }}>
                    {flash.success}
                </div>
            )}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[#0B1A16]/60">
                    Commission is {percent}% of the money each operator kept (paid bookings, plus cancellation fees).
                </p>
                <input
                    type="month"
                    value={period}
                    onChange={(e) => changeMonth(e.target.value)}
                    className="rounded-xl border border-black/10 bg-white px-3.5 py-2 text-sm outline-none focus:border-[#02C468]"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Kpi label="Operators' revenue" value={money(totals.kept)} />
                <Kpi label={`Commission (${percent}%)`} value={money(totals.commission)} />
                <Kpi label="Plan fees" value={money(totals.plan_fees)} />
                <Kpi label="Still to collect" value={money(totals.unsettled)} />
            </div>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-black/5 bg-white p-6">
                <table className="w-full min-w-[820px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-[#0B1A16]/40">
                            <th className="py-3 font-medium">Operator</th>
                            <th className="py-3 font-medium">Plan</th>
                            <th className="py-3 font-medium">Bookings</th>
                            <th className="py-3 font-medium">Revenue kept</th>
                            <th className="py-3 font-medium">Commission</th>
                            <th className="py-3 font-medium">Plan fee</th>
                            <th className="py-3 font-medium">Total due</th>
                            <th className="py-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {rows.map((r) => (
                            <tr key={r.id} className="hover:bg-[#F4FAF7]">
                                <td className="py-3 font-medium text-[#0B1A16]">{r.name}</td>
                                <td className="py-3 text-[#0B1A16]/70">{r.plan ?? '—'}</td>
                                <td className="py-3 text-[#0B1A16]/70">{r.bookings}</td>
                                <td className="py-3 text-[#0B1A16]/70">{money(r.kept)}</td>
                                <td className="py-3 text-[#0B1A16]/70">{money(r.commission)}</td>
                                <td className="py-3 text-[#0B1A16]/70">{money(r.plan_fee)}</td>
                                <td className="py-3 font-semibold text-[#0B1A16]">{money(r.total_due)}</td>
                                <td className="py-3">
                                    {r.settled ? (
                                        <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: BRAND.greenDark, backgroundColor: BRAND.soft }}>
                                            Settled
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => settle(r)}
                                            disabled={r.total_due <= 0}
                                            className="rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-40"
                                            style={{ color: BRAND.amber, backgroundColor: BRAND.amberSoft }}
                                        >
                                            Mark settled
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-8 text-center text-sm text-[#0B1A16]/40">No operators yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminWrapper>
    );
}