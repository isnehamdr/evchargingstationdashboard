import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

/**
 * ChargeSathi — Register page
 * Matches Welcome.jsx's design system (green #02C468 / ink #0B1A16 / white).
 * Not using GuestLayout — this is a self-contained split layout so it
 * doesn't inherit Breeze's default gray/indigo chrome.
 */

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    ink: '#0B1A16',
    soft: '#F4FAF7',
};

function BoltMark({ className = 'h-9 w-9' }) {
    return (
        <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 4 8 21h9l-3 15L29 19h-9l2-15Z" fill={BRAND.green} />
        </svg>
    );
}

function EyeIcon({ open }) {
    return open ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path
                d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M6.6 6.7C4.2 8.2 2 12 2 12s3.5 7 10 7c1.8 0 3.3-.5 4.6-1.2M9.9 4.2A9.7 9.7 0 0 1 12 4c6.5 0 10 8 10 8a17.4 17.4 0 0 1-2.4 3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function Field({ id, label, type = 'text', value, onChange, error, autoComplete, autoFocus }) {
    const isPassword = type === 'password';
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <label htmlFor={id} className="text-sm font-medium text-[#0B1A16]/70">
                {label}
            </label>
            <div className="relative mt-1.5">
                <input
                    id={id}
                    name={id}
                    type={isPassword && visible ? 'text' : type}
                    value={value}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    onChange={onChange}
                    required
                    className="block w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm text-[#0B1A16] outline-none transition placeholder:text-[#0B1A16]/30 focus:border-transparent focus:ring-2"
                    style={{ '--tw-ring-color': BRAND.green, paddingRight: isPassword ? '2.75rem' : undefined }}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        aria-label={visible ? 'Hide password' : 'Show password'}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-[#0B1A16]/40 transition hover:text-[#0B1A16]/70"
                    >
                        <EyeIcon open={visible} />
                    </button>
                )}
            </div>
            <InputError message={error} className="mt-1.5" />
        </div>
    );
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Register" />

            <div className="grid min-h-screen lg:grid-cols-2">
                {/* ---------- Brand panel ---------- */}
                <div
                    className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex"
                    style={{ backgroundColor: BRAND.ink }}
                >
                    {/* large watermark mark — decorative, sits behind the copy */}
                    <BoltMark className="pointer-events-none absolute -bottom-16 -right-16 h-96 w-96 opacity-[0.06]" />

                    <Link href="/" className="relative flex items-center gap-2.5">
                        <img
                            src="/images/logo.png"
                            alt="ChargeSathi"
                            className="h-24 w-auto"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextSibling.style.display = 'flex';
                            }}
                        />
                        <span className="hidden items-center gap-2 text-lg font-bold tracking-tight">
                           <img className='w-12 h-12' src="/images/logo.png" alt="" />
                        </span>
                    </Link>

                    <div className="relative max-w-sm">
                        <p className="text-sm font-semibold" style={{ color: BRAND.green }}>
                            Built for NEPAL
                        </p>
                        <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight">
                            Charge without the guesswork.
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-white/60">
                            Create an account to see live station availability, reserve
                            your slot ahead of time, and pay with eSewa or Khalti.
                        </p>
                    </div>

                    <p className="text-xs text-white/30">
                        &copy; {new Date().getFullYear()} ChargeSathi
                    </p>
                </div>

                {/* ---------- Form panel ---------- */}
                <div className="flex items-center justify-center px-6 py-12 sm:px-10">
                    <div className="w-full max-w-sm">
                        {/* logo shown only when brand panel is hidden (mobile) */}
                        <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
                            <img
                                src="/images/chargesathi-logo.png"
                                alt="ChargeSathi"
                                className="h-8 w-auto"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextSibling.style.display = 'flex';
                                }}
                            />
                            <span className="hidden items-center gap-2 text-base font-bold tracking-tight text-[#0B1A16]">
                                <BoltMark className="h-6 w-6" />
                                CHARGESATHI
                            </span>
                        </Link>

                        <h1 className="text-2xl font-bold tracking-tight text-[#0B1A16]">
                            Create your account
                        </h1>
                        <p className="mt-2 text-sm text-[#0B1A16]/55">
                            Already have one?{' '}
                            <Link
                                href={route('login')}
                                className="font-semibold"
                                style={{ color: BRAND.greenDark }}
                            >
                                Log in
                            </Link>
                        </p>

                        <form onSubmit={submit} className="mt-8 space-y-5">
                            <Field
                                id="name"
                                label="Full name"
                                value={data.name}
                                autoComplete="name"
                                autoFocus
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                            />

                            <Field
                                id="email"
                                label="Email"
                                type="email"
                                value={data.email}
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                            />

                            <Field
                                id="password"
                                label="Password"
                                type="password"
                                value={data.password}
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                            />

                            <Field
                                id="password_confirmation"
                                label="Confirm password"
                                type="password"
                                value={data.password_confirmation}
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                error={errors.password_confirmation}
                            />

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 w-full rounded-full py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
                                style={{ backgroundColor: BRAND.green }}
                            >
                                Create account
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}