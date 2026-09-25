import { Head, Link } from '@inertiajs/react';

/**
 * ChargeSathi — Welcome / landing page
 * Replaces the default Laravel Breeze welcome screen.
 *
 * Setup:
 * 1. Save your logo file to: public/images/chargesathi-logo.png
 *    (transparent background, the green bolt + navy wordmark from your brand image)
 * 2. This file only needs Tailwind (already in a default Breeze/Inertia install) — no extra packages.
 */

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    ink: '#0B1A16',
    soft: '#F4FAF7',
};

function BoltMark({ className = 'h-9 w-9' }) {
    // Inline fallback mark (used in footer / favicon-style spots) in case the PNG isn't wired up yet.
    return (
        <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M22 4 8 21h9l-3 15L29 19h-9l2-15Z"
                fill={BRAND.green}
            />
        </svg>
    );
}

function NavLink({ href, children }) {
    return (
        <Link
            href={href}
            className="text-sm font-medium text-[#0B1A16]/70 transition hover:text-[#0B1A16]"
        >
            {children}
        </Link>
    );
}

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="ChargeSathi — EV charging, sorted" />

            <div className="min-h-screen bg-white text-[#0B1A16] antialiased">
                {/* ---------- Header ---------- */}
                <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
                        <Link href="/" className="flex items-center gap-2.5">
                            <img
                                src="/images/chargesathi-logo.png"
                                alt="ChargeSathi"
                                className="h-8 w-auto sm:h-9"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextSibling.style.display = 'flex';
                                }}
                            />
                            <span className="hidden items-center gap-2 text-lg font-bold tracking-tight">
                                <BoltMark className="h-7 w-7" />
                                CHARGESATHI
                            </span>
                        </Link>

                        <nav className="hidden items-center gap-8 md:flex">
                            <NavLink href="#how-it-works">How it works</NavLink>
                            <NavLink href="#drivers">For drivers</NavLink>
                            <NavLink href="/operators">For operators</NavLink>
                        </nav>

                        <div className="flex items-center gap-3">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-full bg-[#0B1A16] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0B1A16]/90"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="hidden text-sm font-medium text-[#0B1A16]/70 transition hover:text-[#0B1A16] sm:block"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:brightness-95"
                                        style={{ backgroundColor: BRAND.green }}
                                    >
                                        Get started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* ---------- Hero ---------- */}
                <section className="relative overflow-hidden">
                    <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr,0.9fr] lg:py-28">
                        <div>
                            <p className="text-xl font-semibold" style={{ color: BRAND.greenDark }}>
                                Built for <span className="font-bold text-2xl tracking-[2px]">NEPAL</span> 
                            </p>
                            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                                Never guess where
                                <br />
                                your next charge is.
                            </h1>
                            <p className="mt-6 max-w-md text-base leading-relaxed text-[#0B1A16]/65 sm:text-lg">
                                ChargeSathi shows you every nearby charging station in real time,
                                lets you reserve a slot before you arrive — even during festival
                                rush — and pay instantly with eSewa or Khalti.
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href={route('register')}
                                    className="rounded-full px-7 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
                                    style={{ backgroundColor: BRAND.green }}
                                >
                                    Find a station near you
                                </Link>
                                <Link
                                    href="/operators"
                                    className="rounded-full border border-[#0B1A16]/15 px-7 py-3.5 text-center text-sm font-semibold text-[#0B1A16] transition hover:border-[#0B1A16]/30"
                                >
                                    I run a charging station
                                </Link>
                            </div>
                        </div>

                        {/* Hero graphic panel — a station "ticket" mock, not a stock illustration */}
                        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
                            <div
                                className="rounded-3xl p-6 shadow-xl sm:p-8"
                                style={{ backgroundColor: BRAND.ink }}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium uppercase tracking-wide text-white/50">
                                        Lakeside Station 02
                                    </span>
                                    <span
                                        className="rounded-full px-2.5 py-1 text-xs font-semibold text-[#0B1A16]"
                                        style={{ backgroundColor: BRAND.green }}
                                    >
                                        Available
                                    </span>
                                </div>

                                <div className="mt-8 flex items-end gap-2">
                                    <BoltMark className="h-10 w-10" />
                                    <div>
                                        <p className="text-3xl font-bold text-white">4 / 6</p>
                                        <p className="text-xs text-white/50">connectors free</p>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm text-white/70">
                                    <div className="flex justify-between">
                                        <span>Your slot</span>
                                        <span className="font-medium text-white">5:30 – 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Connector</span>
                                        <span className="font-medium text-white">CCS · Type 2</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Pay with</span>
                                        <span className="font-medium text-white">eSewa</span>
                                    </div>
                                </div>
                            </div>

                            {/* small floating badge */}
                            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-lg sm:block">
                                <p className="text-xs text-[#0B1A16]/50">Grid status</p>
                                <p className="text-sm font-semibold" style={{ color: BRAND.greenDark }}>
                                    Stable · No load-shedding
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---------- How it works ---------- */}
                <section id="how-it-works" className="border-t border-black/5 bg-[#F4FAF7] py-20 sm:py-24">
                    <div className="mx-auto max-w-6xl px-5 sm:px-8">
                        <h2 className="max-w-lg text-2xl font-bold tracking-tight sm:text-3xl">
                            Three steps between you and a full battery.
                        </h2>

                        <div className="mt-12 grid gap-10 sm:grid-cols-3">
                            {[
                                {
                                    n: '1',
                                    title: 'Find a station',
                                    body: 'See live availability across Pokhara and Kaski — not just a pin on a map, but which connectors are actually free right now.',
                                },
                                {
                                    n: '2',
                                    title: 'Reserve your slot',
                                    body: 'Book ahead, especially during Dashain and Tihar rush, so you\'re not queuing behind twenty other drivers.',
                                },
                                {
                                    n: '3',
                                    title: 'Charge & pay',
                                    body: 'Plug in, charge, and settle the bill instantly through eSewa or Khalti — no cash, no receipts to chase.',
                                },
                            ].map((step) => (
                                <div key={step.n}>
                                    <span
                                        className="text-4xl font-extrabold"
                                        style={{ color: BRAND.green }}
                                    >
                                        {step.n}
                                    </span>
                                    <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[#0B1A16]/60">
                                        {step.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ---------- Drivers / Operators split ---------- */}
                <section className="py-20 sm:py-24">
                    <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-2">
                        <div id="drivers" className="rounded-3xl border border-black/5 p-8 sm:p-10">
                            <span
                                className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                                style={{ backgroundColor: BRAND.soft, color: BRAND.greenDark }}
                            >
                                For drivers
                            </span>
                            <h3 className="mt-4 text-xl font-bold">The app that ends charge anxiety.</h3>
                            <ul className="mt-6 space-y-4 text-sm text-[#0B1A16]/70">
                                <li className="flex gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: BRAND.green }} />
                                    Real-time station &amp; connector availability
                                </li>
                                <li className="flex gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: BRAND.green }} />
                                    Slot booking for festival-season congestion
                                </li>
                                <li className="flex gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: BRAND.green }} />
                                    In-app payment via eSewa or Khalti
                                </li>
                                <li className="flex gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: BRAND.green }} />
                                    Full charging history &amp; digital receipts
                                </li>
                            </ul>
                        </div>

                        <div id="operators" className="rounded-3xl p-8 text-white sm:p-10" style={{ backgroundColor: BRAND.ink }}>
                            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                                For station operators
                            </span>
                            <h3 className="mt-4 text-xl font-bold">Run every station from one dashboard.</h3>
                            <ul className="mt-6 space-y-4 text-sm text-white/70">
                                <li className="flex gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: BRAND.green }} />
                                    Multi-station, multi-tenant management
                                </li>
                                <li className="flex gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: BRAND.green }} />
                                    Revenue, usage &amp; peak-hour analytics
                                </li>
                                <li className="flex gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: BRAND.green }} />
                                    Connector fault &amp; grid-stability alerts
                                </li>
                                <li className="flex gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: BRAND.green }} />
                                    Automated eSewa / Khalti settlement
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* ---------- Footer ---------- */}
                <footer className="border-t border-black/5 py-10">
                    <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 sm:flex-row sm:justify-between sm:px-8">
                        <div className="flex items-center gap-2">
                            <BoltMark className="h-5 w-5" />
                            <span className="text-sm font-semibold tracking-tight">ChargeSathi</span>
                        </div>
                        <p className="text-xs text-[#0B1A16]/45">
                            Charging infrastructure for Nepal, one station at a time.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}