import AdminWrapper from '@/AdminDashboard/AdminWrapper';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    soft: '#F4FAF7',
    ink: '#0B1A16',
    red: '#B91C1C',
    redSoft: '#FEE2E2',
    amber: '#B45309',
    amberSoft: '#FEF3C7',
};

const STATUS_STYLES = {
    active: { color: BRAND.greenDark, bg: BRAND.soft, label: 'Active' },
    trial: { color: BRAND.amber, bg: BRAND.amberSoft, label: 'Trial' },
    suspended: { color: BRAND.red, bg: BRAND.redSoft, label: 'Suspended' },
};

const FILTERS = ['all', 'active', 'trial', 'suspended'];

const inputClass =
    'w-full rounded-xl border border-black/10 bg-[#F4FAF7] px-3.5 py-2.5 text-sm text-[#0B1A16] outline-none transition focus:border-[#02C468] focus:bg-white focus:ring-2 focus:ring-[#02C468]/25';

function Kpi({ label, value }) {
    return (
        <div className="rounded-2xl border border-black/5 bg-white p-5">
            <p className="text-xs font-medium text-[#0B1A16]/50">{label}</p>
            <p className="mt-2 text-2xl font-bold text-[#0B1A16]">{value}</p>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#0B1A16]/60">{label}</span>
            {children}
            {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
        </label>
    );
}

function CreateModal({ plans, onClose }) {
    const form = useForm({
        name: '',
        contact_phone: '',
        status: 'trial',
        plan_id: plans[0]?.id ?? '',
        owner_name: '',
        owner_email: '',
        owner_password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('tenants.store'), { preserveScroll: true, onSuccess: () => onClose() });
    };

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
            <form
                onSubmit={submit}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            >
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[#0B1A16]">Create operator</h3>
                    <button type="button" onClick={onClose} className="text-sm text-[#0B1A16]/40 hover:text-[#0B1A16]">
                        Close
                    </button>
                </div>

                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#0B1A16]/40">Company</p>
                <div className="grid gap-4">
                    <Field label="Company name" error={form.errors.name}>
                        <input className={inputClass} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Phone (optional)" error={form.errors.contact_phone}>
                            <input className={inputClass} value={form.data.contact_phone} onChange={(e) => form.setData('contact_phone', e.target.value)} />
                        </Field>
                        <Field label="Status" error={form.errors.status}>
                            <select className={inputClass} value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
                                <option value="trial">Trial</option>
                                <option value="active">Active</option>
                            </select>
                        </Field>
                    </div>
                    <Field label="Plan" error={form.errors.plan_id}>
                        <select className={inputClass} value={form.data.plan_id} onChange={(e) => form.setData('plan_id', e.target.value)}>
                            {plans.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} (Rs. {Number(p.price_monthly).toLocaleString()}/mo)
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-[#0B1A16]/40">Owner login</p>
                <div className="grid gap-4">
                    <Field label="Owner name" error={form.errors.owner_name}>
                        <input className={inputClass} value={form.data.owner_name} onChange={(e) => form.setData('owner_name', e.target.value)} />
                    </Field>
                    <Field label="Owner email" error={form.errors.owner_email}>
                        <input type="email" className={inputClass} value={form.data.owner_email} onChange={(e) => form.setData('owner_email', e.target.value)} />
                    </Field>
                    <Field label="Temporary password" error={form.errors.owner_password}>
                        <input
                            type="password"
                            autoComplete="new-password"
                            className={inputClass}
                            value={form.data.owner_password}
                            onChange={(e) => form.setData('owner_password', e.target.value)}
                        />
                    </Field>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#0B1A16]/60">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                        style={{ backgroundColor: BRAND.green }}
                    >
                        {form.processing ? 'Creating…' : 'Create operator'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Tenants({ tenants = [], stats = {}, plans = [] }) {
    const { flash } = usePage().props;
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);

    const filtered = tenants.filter((t) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
            !q || [t.name, t.owner?.email, t.owner?.name].some((v) => (v ?? '').toLowerCase().includes(q));
        return (filter === 'all' || t.status === filter) && matchesSearch;
    });

    const setStatus = (t, status) => {
        const msg =
            status === 'suspended'
                ? `Suspend ${t.name}? Their team will be logged out and unable to sign in.`
                : `Set ${t.name} to ${status}?`;
        if (confirm(msg)) {
            router.put(route('tenants.update', t.id), { status }, { preserveScroll: true });
        }
    };

    const changePlan = (t, planId) => {
        router.put(route('tenants.update', t.id), { plan_id: planId }, { preserveScroll: true });
    };

    const renew = (t) => {
        if (confirm(`Renew ${t.name} for 1 month?`)) {
            router.put(route('tenants.update', t.id), { renew_months: 1 }, { preserveScroll: true });
        }
    };

    return (
        <AdminWrapper title="Operators">
            <Head title="Operators" />

            {flash?.success && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: BRAND.soft, color: BRAND.greenDark }}>
                    {flash.success}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Kpi label="Operators" value={stats.total ?? 0} />
                <Kpi label="Active" value={stats.active ?? 0} />
                <Kpi label="On trial" value={stats.trial ?? 0} />
                <Kpi label="Suspended" value={stats.suspended ?? 0} />
            </div>

            <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-[#0B1A16]">All operators</h3>

                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search company or owner…"
                            className="w-56 rounded-full border border-black/10 px-3.5 py-1.5 text-xs outline-none focus:border-[#02C468]"
                        />
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFilter(f)}
                                className="rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition"
                                style={
                                    filter === f
                                        ? { backgroundColor: BRAND.green, color: '#fff' }
                                        : { backgroundColor: '#fff', color: BRAND.ink, border: '1px solid rgba(0,0,0,0.08)' }
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
                            + Create operator
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[920px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-[#0B1A16]/40">
                                <th className="py-3 font-medium">Company</th>
                                <th className="py-3 font-medium">Owner</th>
                                <th className="py-3 font-medium">Plan</th>
                                <th className="py-3 font-medium">Stations</th>
                                <th className="py-3 font-medium">Bookings</th>
                                <th className="py-3 font-medium">Team</th>
                                <th className="py-3 font-medium">Status</th>
                                <th className="py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {filtered.map((t) => {
                                const st = STATUS_STYLES[t.status] || STATUS_STYLES.trial;
                                return (
                                    <tr key={t.id} className="hover:bg-[#F4FAF7]">
                                        <td className="py-3">
                                            <p className="font-medium text-[#0B1A16]">{t.name}</p>
                                            <p className="text-xs text-[#0B1A16]/40">
                                                {t.slug} · since {new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </td>
                                        <td className="py-3">
                                            <p className="text-[#0B1A16]/80">{t.owner?.name ?? '—'}</p>
                                            <p className="text-xs text-[#0B1A16]/40">{t.owner?.email ?? ''}</p>
                                        </td>
                                        <td className="py-3">
                                            <select
                                                value={t.plan_id ?? ''}
                                                onChange={(e) => changePlan(t, e.target.value)}
                                                className="rounded-lg border border-black/10 bg-white px-2 py-1 text-xs font-medium"
                                            >
                                                {!t.plan_id && <option value="">No plan</option>}
                                                {plans.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="mt-1 text-[11px]" style={{ color: t.expired ? BRAND.red : 'rgba(11,26,22,0.4)' }}>
                                                {t.expired
                                                    ? 'Expired'
                                                    : t.subscription_ends_at
                                                      ? `Until ${new Date(t.subscription_ends_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`
                                                      : ''}
                                            </p>
                                        </td>
                                        <td className="py-3 text-[#0B1A16]/70">{t.stations_count}</td>
                                        <td className="py-3 text-[#0B1A16]/70">{t.bookings_count}</td>
                                        <td className="py-3 text-[#0B1A16]/70">{t.users_count}</td>
                                        <td className="py-3">
                                            <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: st.color, backgroundColor: st.bg }}>
                                                {st.label}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex flex-wrap gap-3">
                                                {t.status !== 'active' && (
                                                    <button type="button" onClick={() => setStatus(t, 'active')} className="text-xs font-semibold" style={{ color: BRAND.greenDark }}>
                                                        Activate
                                                    </button>
                                                )}
                                                {t.status !== 'suspended' && (
                                                    <button type="button" onClick={() => setStatus(t, 'suspended')} className="text-xs font-semibold" style={{ color: BRAND.red }}>
                                                        Suspend
                                                    </button>
                                                )}
                                                <button type="button" onClick={() => renew(t)} className="text-xs font-semibold" style={{ color: BRAND.ink }}>
                                                    Renew +1 month
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-sm text-[#0B1A16]/40">
                                        No operators found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && <CreateModal plans={plans} onClose={() => setShowForm(false)} />}
        </AdminWrapper>
    );
}