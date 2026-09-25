import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

/**
 * ChargeSathi — Login page
 * Matches Register.jsx / Welcome.jsx's design system (green #02C468 / ink #0B1A16 / white).
 * Not using GuestLayout — self-contained split layout, no Breeze gray/indigo chrome.
 */

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    ink: '#0B1A16',
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

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />

            <div className="grid min-h-screen lg:grid-cols-2">
                {/* ---------- Brand panel ---------- */}
                <div
                    className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex"
                    style={{ backgroundColor: BRAND.ink }}
                >
               

                    <Link href="/" className="relative flex items-center gap-2.5">
                        <img
                            src="/images/chargesathi-logo.png"
                            alt="ChargeSathi"
                            className="h-9 w-auto"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextSibling.style.display = 'flex';
                            }}
                        />
                        <span className="hidden items-center gap-2 text-lg font-bold tracking-tight">
                           <img src="/images/logo.png" alt="ChargeSathi" className="h-24 w-auto" />
                        </span>
                    </Link>

                    <div className="relative max-w-sm">
                        <p className="text-sm font-semibold" style={{ color: BRAND.green }}>
                            Welcome back
                        </p>
                        <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight">
                            Your next station is a tap away.
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-white/60">
                            Log in to check live availability, manage your
                            bookings, and pick up right where you left off.
                        </p>
                    </div>

                    <p className="relative text-xs text-white/30">
                        &copy; {new Date().getFullYear()} ChargeSathi
                    </p>
                </div>

                {/* ---------- Form panel ---------- */}
                <div className="flex items-center justify-center px-6 py-12 sm:px-10">
                    <div className="w-full max-w-sm">
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
                            Log in to your account
                        </h1>
                        <p className="mt-2 text-sm text-[#0B1A16]/55">
                            New to ChargeSathi?{' '}
                            <Link
                                href={route('register')}
                                className="font-semibold"
                                style={{ color: BRAND.greenDark }}
                            >
                                Create an account
                            </Link>
                        </p>

                        {status && (
                            <div
                                className="mt-6 rounded-xl px-4 py-3 text-sm font-medium"
                                style={{ backgroundColor: '#F4FAF7', color: BRAND.greenDark }}
                            >
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="mt-8 space-y-5">
                            <Field
                                id="email"
                                label="Email"
                                type="email"
                                value={data.email}
                                autoComplete="username"
                                autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                            />

                            <Field
                                id="password"
                                label="Password"
                                type="password"
                                value={data.password}
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                            />

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-[#0B1A16]/70">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 rounded border-black/20 text-[#02C468] focus:ring-2 focus:ring-offset-0"
                                        style={{ accentColor: BRAND.green, '--tw-ring-color': BRAND.green }}
                                    />
                                    Remember me
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-medium text-[#0B1A16]/55 hover:text-[#0B1A16]"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 w-full rounded-full py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
                                style={{ backgroundColor: BRAND.green }}
                            >
                                Log in
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}