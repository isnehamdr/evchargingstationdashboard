import AdminWrapper from '@/AdminDashboard/AdminWrapper';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    soft: '#F4FAF7',
    ink: '#0B1A16',
};

const ALL_TABS = [
    { key: 'profile', label: 'Profile' },
    { key: 'organization', label: 'Organization', ownerOnly: true },
    { key: 'payments', label: 'Payment gateways', ownerOnly: true },
    { key: 'notifications', label: 'Notifications' },
    { key: 'security', label: 'Security' },
];

const ROLE_LABELS = {
    super_admin: 'Super admin',
    owner: 'Owner',
    manager: 'Manager',
    staff: 'Staff',
};

const inputClass =
    'w-full rounded-xl border border-black/10 bg-[#F4FAF7] px-3.5 py-2.5 text-sm text-[#0B1A16] outline-none transition focus:border-[#02C468] focus:bg-white focus:ring-2 focus:ring-[#02C468]/25 disabled:opacity-60';

function Field({ label, children, hint, error }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#0B1A16]/60">{label}</span>
            {children}
            {hint && !error && <span className="mt-1 block text-xs text-[#0B1A16]/40">{hint}</span>}
            {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
        </label>
    );
}

function Toggle({ checked, onChange, label }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className="flex w-full items-center justify-between rounded-xl border border-black/[0.06] px-4 py-3"
        >
            <span className="text-sm font-medium text-[#0B1A16]">{label}</span>
            <span
                className="relative h-6 w-11 shrink-0 rounded-full transition"
                style={{ backgroundColor: checked ? BRAND.green : '#E5E7EB' }}
            >
                <span
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition"
                    style={{ left: checked ? '22px' : '2px' }}
                />
            </span>
        </button>
    );
}

function SaveBar({ onSave, processing }) {
    return (
        <div className="mt-6 flex items-center gap-3 border-t border-black/[0.06] pt-5">
            <button
                type="button"
                onClick={onSave}
                disabled={processing}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
                style={{ backgroundColor: BRAND.green }}
            >
                {processing ? 'Saving…' : 'Save changes'}
            </button>
        </div>
    );
}

export default function Setting({ profile, prefs, organization, payments, banks = [] }) {
    const { flash } = usePage().props;
    const tabs = ALL_TABS.filter((t) => !t.ownerOnly || organization);
    const [tab, setTab] = useState('profile');

    const opts = { preserveScroll: true };

    const profileForm = useForm({
        name: profile?.name ?? '',
        email: profile?.email ?? '',
        phone: profile?.phone ?? '',
    });

    const orgForm = useForm({
        name: organization?.name ?? '',
        reg_no: organization?.reg_no ?? '',
        currency: organization?.currency ?? 'NPR',
        timezone: organization?.timezone ?? 'Asia/Kathmandu',
    });

    const payForm = useForm({
        esewa_enabled: payments?.esewa_enabled ?? false,
        esewa_merchant: payments?.esewa_merchant ?? '',
        khalti_enabled: payments?.khalti_enabled ?? false,
        khalti_key: '',
        mobile_banking_enabled: payments?.mobile_banking_enabled ?? false,
        mobile_banking_banks: payments?.mobile_banking_banks ?? [],
    });

    const notifForm = useForm({ ...prefs });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const toggleBank = (bank) => {
        const list = payForm.data.mobile_banking_banks;
        payForm.setData(
            'mobile_banking_banks',
            list.includes(bank) ? list.filter((b) => b !== bank) : [...list, bank]
        );
    };

    return (
        <AdminWrapper title="Settings">
            <Head title="Settings" />

            {flash?.success && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: BRAND.soft, color: BRAND.greenDark }}>
                    {flash.success}
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
                {/* ---------- Tab nav ---------- */}
                <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className="shrink-0 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition lg:w-full"
                            style={
                                tab === t.key
                                    ? { backgroundColor: BRAND.soft, color: BRAND.greenDark }
                                    : { color: 'rgba(11,26,22,0.6)' }
                            }
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ---------- Tab content ---------- */}
                <div className="rounded-2xl border border-black/5 bg-white p-6">
                    {tab === 'profile' && (
                        <>
                            <h3 className="text-sm font-semibold text-[#0B1A16]">Profile</h3>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <Field label="Full name" error={profileForm.errors.name}>
                                    <input className={inputClass} value={profileForm.data.name} onChange={(e) => profileForm.setData('name', e.target.value)} />
                                </Field>
                                <Field label="Role" hint="Set by your organization. Contact an owner to change">
                                    <input className={inputClass} value={ROLE_LABELS[profile?.role] ?? profile?.role ?? ''} disabled />
                                </Field>
                                <Field label="Email" error={profileForm.errors.email}>
                                    <input type="email" className={inputClass} value={profileForm.data.email} onChange={(e) => profileForm.setData('email', e.target.value)} />
                                </Field>
                                <Field label="Phone" error={profileForm.errors.phone}>
                                    <input className={inputClass} value={profileForm.data.phone} onChange={(e) => profileForm.setData('phone', e.target.value)} />
                                </Field>
                            </div>
                            <SaveBar processing={profileForm.processing} onSave={() => profileForm.put(route('settings.profile'), opts)} />
                        </>
                    )}

                    {tab === 'organization' && organization && (
                        <>
                            <h3 className="text-sm font-semibold text-[#0B1A16]">Organization</h3>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <Field label="Organization name" error={orgForm.errors.name}>
                                    <input className={inputClass} value={orgForm.data.name} onChange={(e) => orgForm.setData('name', e.target.value)} />
                                </Field>
                                <Field label="Business registration no." error={orgForm.errors.reg_no}>
                                    <input className={inputClass} value={orgForm.data.reg_no} onChange={(e) => orgForm.setData('reg_no', e.target.value)} />
                                </Field>
                                <Field label="Currency" error={orgForm.errors.currency}>
                                    <select className={inputClass} value={orgForm.data.currency} onChange={(e) => orgForm.setData('currency', e.target.value)}>
                                        <option value="NPR">NPR: Nepalese Rupee</option>
                                        <option value="USD">USD: US Dollar</option>
                                    </select>
                                </Field>
                                <Field label="Timezone" error={orgForm.errors.timezone}>
                                    <select className={inputClass} value={orgForm.data.timezone} onChange={(e) => orgForm.setData('timezone', e.target.value)}>
                                        <option value="Asia/Kathmandu">Asia/Kathmandu (NPT, UTC+5:45)</option>
                                    </select>
                                </Field>
                            </div>
                            <SaveBar processing={orgForm.processing} onSave={() => orgForm.put(route('settings.organization'), opts)} />
                        </>
                    )}

                    {tab === 'payments' && payments && (
                        <>
                            <h3 className="text-sm font-semibold text-[#0B1A16]">Payment gateways</h3>
                            <div className="mt-5 flex flex-col gap-4">
                                <Toggle label="eSewa enabled" checked={payForm.data.esewa_enabled} onChange={(v) => payForm.setData('esewa_enabled', v)} />
                                {payForm.data.esewa_enabled && (
                                    <Field label="eSewa merchant code" error={payForm.errors.esewa_merchant}>
                                        <input className={inputClass} value={payForm.data.esewa_merchant} onChange={(e) => payForm.setData('esewa_merchant', e.target.value)} />
                                    </Field>
                                )}

                                <Toggle label="Khalti enabled" checked={payForm.data.khalti_enabled} onChange={(v) => payForm.setData('khalti_enabled', v)} />
                                {payForm.data.khalti_enabled && (
                                    <Field
                                        label="Khalti key"
                                        error={payForm.errors.khalti_key}
                                        hint={payments.khalti_key_set ? 'A key is saved. Leave blank to keep it, or type a new one to replace it.' : undefined}
                                    >
                                        <input
                                            type="password"
                                            autoComplete="new-password"
                                            className={inputClass}
                                            value={payForm.data.khalti_key}
                                            onChange={(e) => payForm.setData('khalti_key', e.target.value)}
                                            placeholder={payments.khalti_key_set ? '••••••••••••' : ''}
                                        />
                                    </Field>
                                )}

                                <Toggle
                                    label="Mobile banking enabled"
                                    checked={payForm.data.mobile_banking_enabled}
                                    onChange={(v) => payForm.setData('mobile_banking_enabled', v)}
                                />
                                {payForm.data.mobile_banking_enabled && (
                                    <Field label="Accepted banks" hint="Drivers will be able to pay via these banks' mobile banking apps">
                                        <div className="flex flex-wrap gap-2">
                                            {banks.map((bank) => {
                                                const active = payForm.data.mobile_banking_banks.includes(bank);
                                                return (
                                                    <button
                                                        key={bank}
                                                        type="button"
                                                        onClick={() => toggleBank(bank)}
                                                        className="rounded-full px-3.5 py-1.5 text-xs font-medium transition"
                                                        style={
                                                            active
                                                                ? { backgroundColor: BRAND.green, color: '#fff' }
                                                                : { backgroundColor: '#fff', color: BRAND.ink, border: '1px solid rgba(0,0,0,0.08)' }
                                                        }
                                                    >
                                                        {bank}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </Field>
                                )}
                            </div>
                            <SaveBar processing={payForm.processing} onSave={() => payForm.put(route('settings.payments'), opts)} />
                        </>
                    )}

                    {tab === 'notifications' && (
                        <>
                            <h3 className="text-sm font-semibold text-[#0B1A16]">Notification preferences</h3>

                            <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-[#0B1A16]/40">By severity</p>
                            <div className="flex flex-col gap-3">
                                <Toggle label="Critical" checked={notifForm.data.critical} onChange={(v) => notifForm.setData('critical', v)} />
                                <Toggle label="Warning" checked={notifForm.data.warning} onChange={(v) => notifForm.setData('warning', v)} />
                                <Toggle label="Info" checked={notifForm.data.info} onChange={(v) => notifForm.setData('info', v)} />
                            </div>

                            <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-[#0B1A16]/40">By category</p>
                            <div className="flex flex-col gap-3">
                                <Toggle label="Faults" checked={notifForm.data.faults} onChange={(v) => notifForm.setData('faults', v)} />
                                <Toggle label="Bookings" checked={notifForm.data.bookings} onChange={(v) => notifForm.setData('bookings', v)} />
                                <Toggle label="Payouts" checked={notifForm.data.payouts} onChange={(v) => notifForm.setData('payouts', v)} />
                            </div>

                            <SaveBar processing={notifForm.processing} onSave={() => notifForm.put(route('settings.notifications'), opts)} />
                        </>
                    )}

                    {tab === 'security' && (
                        <>
                            <h3 className="text-sm font-semibold text-[#0B1A16]">Security</h3>
                            <div className="mt-5 grid max-w-sm gap-5">
                                <Field label="Current password" error={passwordForm.errors.current_password}>
                                    <input type="password" autoComplete="current-password" className={inputClass} value={passwordForm.data.current_password} onChange={(e) => passwordForm.setData('current_password', e.target.value)} />
                                </Field>
                                <Field label="New password" error={passwordForm.errors.password}>
                                    <input type="password" autoComplete="new-password" className={inputClass} value={passwordForm.data.password} onChange={(e) => passwordForm.setData('password', e.target.value)} />
                                </Field>
                                <Field label="Confirm new password">
                                    <input type="password" autoComplete="new-password" className={inputClass} value={passwordForm.data.password_confirmation} onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)} />
                                </Field>
                            </div>
                            <SaveBar
                                processing={passwordForm.processing}
                                onSave={() => passwordForm.put(route('settings.password'), { ...opts, onSuccess: () => passwordForm.reset() })}
                            />
                        </>
                    )}
                </div>
            </div>
        </AdminWrapper>
    );
}