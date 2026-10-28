import AdminWrapper from '@/AdminDashboard/AdminWrapper';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    soft: '#F4FAF7',
    ink: '#0B1A16',
    red: '#B91C1C',
};

const ROLE_STYLES = {
    owner: { color: '#7C3AED', bg: '#EDE9FE', label: 'Owner' },
    manager: { color: '#1D4ED8', bg: '#DBEAFE', label: 'Manager' },
    staff: { color: BRAND.greenDark, bg: BRAND.soft, label: 'Staff' },
};

const ROLE_HELP = {
    manager: 'Everything except team and settings. Can see revenue.',
    staff: 'Day-to-day pages only. Cannot see revenue.',
};

const inputClass =
    'w-full rounded-xl border border-black/10 bg-[#F4FAF7] px-3.5 py-2.5 text-sm text-[#0B1A16] outline-none transition focus:border-[#02C468] focus:bg-white focus:ring-2 focus:ring-[#02C468]/25';

function Field({ label, error, hint, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#0B1A16]/60">{label}</span>
            {children}
            {hint && !error && <span className="mt-1 block text-xs text-[#0B1A16]/40">{hint}</span>}
            {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
        </label>
    );
}

function RoleBadge({ role }) {
    const s = ROLE_STYLES[role] || ROLE_STYLES.staff;
    return (
        <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: s.color, backgroundColor: s.bg }}>
            {s.label}
        </span>
    );
}

function AddMemberModal({ roles, onClose }) {
    const form = useForm({ name: '', email: '', phone: '', password: '', role: roles[0] ?? 'staff' });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('team.store'), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
            <form
                onSubmit={submit}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[#0B1A16]">Add team member</h3>
                    <button type="button" onClick={onClose} className="text-sm text-[#0B1A16]/40 hover:text-[#0B1A16]">
                        Close
                    </button>
                </div>

                <div className="grid gap-4">
                    <Field label="Full name" error={form.errors.name}>
                        <input className={inputClass} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                    </Field>
                    <Field label="Email" error={form.errors.email}>
                        <input type="email" className={inputClass} value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                    </Field>
                    <Field label="Phone (optional)" error={form.errors.phone}>
                        <input className={inputClass} value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                    </Field>
                    <Field label="Role" error={form.errors.role} hint={ROLE_HELP[form.data.role]}>
                        <select className={inputClass} value={form.data.role} onChange={(e) => form.setData('role', e.target.value)}>
                            {roles.map((r) => (
                                <option key={r} value={r}>
                                    {ROLE_STYLES[r]?.label ?? r}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Temporary password" error={form.errors.password} hint="Share it with them. They can change it in Settings.">
                        <input
                            type="password"
                            autoComplete="new-password"
                            className={inputClass}
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
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
                        {form.processing ? 'Adding…' : 'Add member'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Team({ members = [], currentId, roles = ['manager', 'staff'] }) {
    const { flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);

    const changeRole = (m, role) => {
        router.put(route('team.update', m.id), { role }, { preserveScroll: true });
    };

    const remove = (m) => {
        if (confirm(`Remove ${m.name}? They will no longer be able to log in.`)) {
            router.delete(route('team.destroy', m.id), { preserveScroll: true });
        }
    };

    return (
        <AdminWrapper title="Team">
            <Head title="Team" />

            {flash?.success && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: BRAND.soft, color: BRAND.greenDark }}>
                    {flash.success}
                </div>
            )}

            <div className="rounded-2xl border border-black/5 bg-white p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-[#0B1A16]">Your team</h3>
                        <p className="mt-0.5 text-xs text-[#0B1A16]/40">People who can log in and manage your stations.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className="rounded-full px-4 py-1.5 text-xs font-semibold text-white"
                        style={{ backgroundColor: BRAND.greenDark }}
                    >
                        + Add member
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-[#0B1A16]/40">
                                <th className="py-3 font-medium">Member</th>
                                <th className="py-3 font-medium">Phone</th>
                                <th className="py-3 font-medium">Role</th>
                                <th className="py-3 font-medium">Joined</th>
                                <th className="py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {members.map((m) => {
                                const isMe = m.id === currentId;
                                const editable = !isMe && m.role !== 'owner';
                                return (
                                    <tr key={m.id} className="hover:bg-[#F4FAF7]">
                                        <td className="py-3">
                                            <p className="font-medium text-[#0B1A16]">
                                                {m.name} {isMe && <span className="text-xs font-normal text-[#0B1A16]/40">(you)</span>}
                                            </p>
                                            <p className="text-xs text-[#0B1A16]/40">{m.email}</p>
                                        </td>
                                        <td className="py-3 text-[#0B1A16]/70">{m.phone ?? '—'}</td>
                                        <td className="py-3">
                                            {editable ? (
                                                <select
                                                    value={m.role}
                                                    onChange={(e) => changeRole(m, e.target.value)}
                                                    className="rounded-lg border border-black/10 bg-white px-2 py-1 text-xs font-medium"
                                                >
                                                    {roles.map((r) => (
                                                        <option key={r} value={r}>
                                                            {ROLE_STYLES[r]?.label ?? r}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <RoleBadge role={m.role} />
                                            )}
                                        </td>
                                        <td className="py-3 text-[#0B1A16]/70">
                                            {new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-3">
                                            {editable ? (
                                                <button type="button" onClick={() => remove(m)} className="text-xs font-semibold" style={{ color: BRAND.red }}>
                                                    Remove
                                                </button>
                                            ) : (
                                                <span className="text-xs text-[#0B1A16]/30">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {members.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-sm text-[#0B1A16]/40">
                                        No team members yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && <AddMemberModal roles={roles} onClose={() => setShowForm(false)} />}
        </AdminWrapper>
    );
}