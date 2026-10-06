import AdminWrapper from '@/AdminDashboard/AdminWrapper';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    soft: '#F4FAF7',
    ink: '#0B1A16',
};

const NEPAL_BANKS = [
    'NIC Asia Bank',
    'Nabil Bank',
    'Global IME Bank',
    'Prabhu Bank',
    'NMB Bank',
    'Himalayan Bank',
    'Standard Chartered Nepal',
    'Everest Bank',
];

const TABS = [
    { key: 'profile', label: 'Profile' },
    { key: 'organization', label: 'Organization' },
    { key: 'payments', label: 'Payment gateways' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'security', label: 'Security' },
];

const inputClass =
    'w-full rounded-xl border border-black/10 bg-[#F4FAF7] px-3.5 py-2.5 text-sm text-[#0B1A16] outline-none transition focus:border-[#02C468] focus:bg-white focus:ring-2 focus:ring-[#02C468]/25';

function Field({ label, children, hint }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#0B1A16]/60">{label}</span>
            {children}
            {hint && <span className="mt-1 block text-xs text-[#0B1A16]/40">{hint}</span>}
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

function SaveBar({ onSave }) {
    return (
        <div className="mt-6 flex items-center gap-3 border-t border-black/[0.06] pt-5">
            <button
                type="button"
                onClick={onSave}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
                style={{ backgroundColor: BRAND.green }}
            >
                Save changes
            </button>
        </div>
    );
}

export default function Setting() {
    const [tab, setTab] = useState('profile');

    const [profile, setProfile] = useState({ name: 'Simran Rai', email: '', phone: '', role: 'Station Manager' });
    const [org, setOrg] = useState({ name: 'Lakeside Charging Pvt. Ltd.', regNo: '', currency: 'NPR', timezone: 'Asia/Kathmandu' });
    const [payments, setPayments] = useState({
        esewaEnabled: true,
        esewaMerchant: '',
        khaltiEnabled: true,
        khaltiKey: '',
        mobileBankingEnabled: false,
        mobileBankingBanks: [],
    });

    const toggleBank = (bank) => {
        setPayments((prev) => ({
            ...prev,
            mobileBankingBanks: prev.mobileBankingBanks.includes(bank)
                ? prev.mobileBankingBanks.filter((b) => b !== bank)
                : [...prev.mobileBankingBanks, bank],
        }));
    };
    const [notifPrefs, setNotifPrefs] = useState({ critical: true, warning: true, info: false, faults: true, bookings: true, payouts: true });
    const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', twoFactor: false });

    // Placeholder — wire to a SettingsController once the backend exists.
    const handleSave = () => alert('Hook this up to your SettingsController — form state is ready to send.');

    return (
        <AdminWrapper title="Settings">
            <Head title="Settings" />

            <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
                {/* ---------- Tab nav ---------- */}
                <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                    {TABS.map((t) => (
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
                                <Field label="Full name">
                                    <input className={inputClass} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                                </Field>
                                <Field label="Role" hint="Set by your organization — contact an owner to change">
                                    <input className={inputClass} value={profile.role} disabled />
                                </Field>
                                <Field label="Email">
                                    <input type="email" className={inputClass} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                                </Field>
                                <Field label="Phone">
                                    <input className={inputClass} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                                </Field>
                            </div>
                            <SaveBar onSave={handleSave} />
                        </>
                    )}

                    {tab === 'organization' && (
                        <>
                            <h3 className="text-sm font-semibold text-[#0B1A16]">Organization</h3>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <Field label="Organization name">
                                    <input className={inputClass} value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} />
                                </Field>
                                <Field label="Business registration no.">
                                    <input className={inputClass} value={org.regNo} onChange={(e) => setOrg({ ...org, regNo: e.target.value })} />
                                </Field>
                                <Field label="Currency">
                                    <select className={inputClass} value={org.currency} onChange={(e) => setOrg({ ...org, currency: e.target.value })}>
                                        <option value="NPR">NPR — Nepalese Rupee</option>
                                        <option value="USD">USD — US Dollar</option>
                                    </select>
                                </Field>
                                <Field label="Timezone">
                                    <select className={inputClass} value={org.timezone} onChange={(e) => setOrg({ ...org, timezone: e.target.value })}>
                                        <option value="Asia/Kathmandu">Asia/Kathmandu (NPT, UTC+5:45)</option>
                                    </select>
                                </Field>
                            </div>
                            <SaveBar onSave={handleSave} />
                        </>
                    )}

                    {tab === 'payments' && (
                        <>
                            <h3 className="text-sm font-semibold text-[#0B1A16]">Payment gateways</h3>
                            <div className="mt-5 flex flex-col gap-4">
                                <Toggle label="eSewa enabled" checked={payments.esewaEnabled} onChange={(v) => setPayments({ ...payments, esewaEnabled: v })} />
                                {payments.esewaEnabled && (
                                    <Field label="eSewa merchant code">
                                        <input className={inputClass} value={payments.esewaMerchant} onChange={(e) => setPayments({ ...payments, esewaMerchant: e.target.value })} />
                                    </Field>
                                )}

                                <Toggle label="Khalti enabled" checked={payments.khaltiEnabled} onChange={(v) => setPayments({ ...payments, khaltiEnabled: v })} />
                                {payments.khaltiEnabled && (
                                    <Field label="Khalti public key">
                                        <input type="password" className={inputClass} value={payments.khaltiKey} onChange={(e) => setPayments({ ...payments, khaltiKey: e.target.value })} />
                                    </Field>
                                )}

                                <Toggle
                                    label="Mobile banking enabled"
                                    checked={payments.mobileBankingEnabled}
                                    onChange={(v) => setPayments({ ...payments, mobileBankingEnabled: v })}
                                />
                                {payments.mobileBankingEnabled && (
                                    <Field label="Accepted banks" hint="Drivers will be able to pay via these banks' mobile banking apps">
                                        <div className="flex flex-wrap gap-2">
                                            {NEPAL_BANKS.map((bank) => {
                                                const active = payments.mobileBankingBanks.includes(bank);
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
                            <SaveBar onSave={handleSave} />
                        </>
                    )}

                    {tab === 'notifications' && (
                        <>
                            <h3 className="text-sm font-semibold text-[#0B1A16]">Notification preferences</h3>

                            <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-[#0B1A16]/40">By severity</p>
                            <div className="flex flex-col gap-3">
                                <Toggle label="Critical" checked={notifPrefs.critical} onChange={(v) => setNotifPrefs({ ...notifPrefs, critical: v })} />
                                <Toggle label="Warning" checked={notifPrefs.warning} onChange={(v) => setNotifPrefs({ ...notifPrefs, warning: v })} />
                                <Toggle label="Info" checked={notifPrefs.info} onChange={(v) => setNotifPrefs({ ...notifPrefs, info: v })} />
                            </div>

                            <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-[#0B1A16]/40">By category</p>
                            <div className="flex flex-col gap-3">
                                <Toggle label="Faults" checked={notifPrefs.faults} onChange={(v) => setNotifPrefs({ ...notifPrefs, faults: v })} />
                                <Toggle label="Bookings" checked={notifPrefs.bookings} onChange={(v) => setNotifPrefs({ ...notifPrefs, bookings: v })} />
                                <Toggle label="Payouts" checked={notifPrefs.payouts} onChange={(v) => setNotifPrefs({ ...notifPrefs, payouts: v })} />
                            </div>

                            <SaveBar onSave={handleSave} />
                        </>
                    )}

                    {tab === 'security' && (
                        <>
                            <h3 className="text-sm font-semibold text-[#0B1A16]">Security</h3>
                            <div className="mt-5 grid max-w-sm gap-5">
                                <Field label="Current password">
                                    <input type="password" className={inputClass} value={security.currentPassword} onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })} />
                                </Field>
                                <Field label="New password">
                                    <input type="password" className={inputClass} value={security.newPassword} onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })} />
                                </Field>
                                <Field label="Confirm new password">
                                    <input type="password" className={inputClass} value={security.confirmPassword} onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })} />
                                </Field>
                            </div>

                            <div className="mt-6 max-w-sm">
                                <Toggle label="Two-factor authentication" checked={security.twoFactor} onChange={(v) => setSecurity({ ...security, twoFactor: v })} />
                            </div>

                            <SaveBar onSave={handleSave} />
                        </>
                    )}
                </div>
            </div>
        </AdminWrapper>
    );
}