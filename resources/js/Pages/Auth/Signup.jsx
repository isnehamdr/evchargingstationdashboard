import { Head, Link, useForm } from '@inertiajs/react';

const BRAND = { green: '#02C468', greenDark: '#019654', soft: '#F4FAF7', ink: '#0B1A16' };

const inputClass =
    'w-full rounded-xl border border-black/10 bg-[#F4FAF7] px-3.5 py-2.5 text-sm text-[#0B1A16] outline-none transition focus:border-[#02C468] focus:bg-white focus:ring-2 focus:ring-[#02C468]/25';

function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#0B1A16]/60">{label}</span>
            {children}
            {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
        </label>
    );
}

export default function Signup() {
    const form = useForm({
        company_name: '',
        owner_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        accepted: false,
        website: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('signup.store'), { onFinish: () => form.reset('password', 'password_confirmation') });
    };

    const set = (key) => (e) => form.setData(key, e.target.value);

    return (
        <div className="min-h-screen bg-[#F4FAF7] px-4 py-10">
            <Head title="Start your free trial" />

            <div className="mx-auto w-full max-w-md">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-[#0B1A16]">Start your free trial</h1>
                    <p className="mt-1 text-sm text-[#0B1A16]/60">
                        14 days free. Manage your charging stations, bookings and payments in one place.
                    </p>
                </div>

                <form onSubmit={submit} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                    <div className="grid gap-4">
                        <Field label="Company name" error={form.errors.company_name}>
                            <input className={inputClass} value={form.data.company_name} onChange={set('company_name')} />
                        </Field>
                        <Field label="Your name" error={form.errors.owner_name}>
                            <input className={inputClass} value={form.data.owner_name} onChange={set('owner_name')} />
                        </Field>
                        <Field label="Email" error={form.errors.email}>
                            <input type="email" autoComplete="email" className={inputClass} value={form.data.email} onChange={set('email')} />
                        </Field>
                        <Field label="Phone" error={form.errors.phone}>
                            <input type="tel" className={inputClass} value={form.data.phone} onChange={set('phone')} />
                        </Field>
                        <Field label="Password" error={form.errors.password}>
                            <input type="password" autoComplete="new-password" className={inputClass} value={form.data.password} onChange={set('password')} />
                        </Field>
                        <Field label="Confirm password">
                            <input
                                type="password"
                                autoComplete="new-password"
                                className={inputClass}
                                value={form.data.password_confirmation}
                                onChange={set('password_confirmation')}
                            />
                        </Field>

                        {/* Honeypot: hidden from people, bots fill it in */}
                        <div className="hidden" aria-hidden="true">
                            <input tabIndex={-1} autoComplete="off" value={form.data.website} onChange={set('website')} />
                        </div>

                        <label className="flex items-start gap-2 text-xs text-[#0B1A16]/70">
                            <input
                                type="checkbox"
                                className="mt-0.5"
                                checked={form.data.accepted}
                                onChange={(e) => form.setData('accepted', e.target.checked)}
                            />
                            <span>I agree to the Terms of Service and Privacy Policy.</span>
                        </label>
                        {form.errors.accepted && <p className="-mt-2 text-xs font-medium text-red-600">{form.errors.accepted}</p>}
                        {form.errors.website && <p className="-mt-2 text-xs font-medium text-red-600">Could not create the account.</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="mt-6 w-full rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
                        style={{ backgroundColor: BRAND.green }}
                    >
                        {form.processing ? 'Creating your account…' : 'Create account'}
                    </button>

                    <p className="mt-4 text-center text-xs text-[#0B1A16]/60">
                        Already have an account?{' '}
                        <Link href={route('login')} className="font-semibold" style={{ color: BRAND.greenDark }}>
                            Log in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}