import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

/**
 * ChargeSathi — Admin/Operator dashboard navbar
 * Same design system as Welcome/Login/Register (green #02C468 / ink #0B1A16 / white).
 * Self-contained: logo, search, notifications, profile — no external icon package.
 */

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    ink: '#0B1A16',
    soft: '#F4FAF7',
};

const NOTIFICATIONS = [
    { id: 1, title: 'Connector fault', body: 'Lakeside Station 02 · Connector B offline', time: '4m ago', unread: true },
    { id: 2, title: 'New booking', body: 'Damside Station 01 · 5:30–6:00 PM slot reserved', time: '22m ago', unread: true },
    { id: 3, title: 'Payout settled', body: 'Rs 12,400 transferred via eSewa', time: '1h ago', unread: false },
];

function BoltMark({ className = 'h-8 w-8' }) {
    return (
        <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 4 8 21h9l-3 15L29 19h-9l2-15Z" fill={BRAND.green} />
        </svg>
    );
}

function SearchIcon(props) {
    return (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function BellIcon(props) {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path
                d="M6 9a6 6 0 1 1 12 0c0 3.5 1 5 1.5 6H4.5C5 14 6 12.5 6 9Z"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M10 18a2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ChevronIcon(props) {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/** Closes a panel when the user clicks / taps outside its ref. */
function usePanel() {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open]);

    return [ref, open, setOpen];
}

export default function AdminNavbar({ user = { name: 'Simran Rai', role: 'Station Manager' } }) {
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [notifRef, notifOpen, setNotifOpen] = usePanel();
    const [profileRef, profileOpen, setProfileOpen] = usePanel();

    const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;
    const initials = user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('');

    return (
        <header className="sticky top-0 z-40 border-b border-black/5 bg-white">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
               

                {/* ---------- Search (desktop / tablet) ---------- */}
                <div className="ml-2 hidden flex-1 max-w-md sm:block">
                    <div className="relative">
                        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#0B1A16]/35" />
                        <input
                            type="text"
                            placeholder="Search stations, bookings, transactions…"
                            className="w-full rounded-full border border-black/10 bg-[#F4FAF7] py-2.5 pl-10 pr-4 text-sm text-[#0B1A16] outline-none transition placeholder:text-[#0B1A16]/40 focus:border-transparent focus:bg-white focus:ring-2"
                            style={{ '--tw-ring-color': BRAND.green }}
                        />
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
                    {/* ---------- Search (mobile icon) ---------- */}
                    <button
                        onClick={() => setMobileSearchOpen((v) => !v)}
                        className="grid h-9 w-9 place-items-center rounded-full text-[#0B1A16]/60 transition hover:bg-[#F4FAF7] sm:hidden"
                        aria-label="Search"
                    >
                        <SearchIcon />
                    </button>

                    {/* ---------- Notifications ---------- */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => {
                                setNotifOpen((v) => !v);
                                setProfileOpen(false);
                            }}
                            className="relative grid h-9 w-9 place-items-center rounded-full text-[#0B1A16]/60 transition hover:bg-[#F4FAF7]"
                            aria-label="Notifications"
                        >
                            <BellIcon />
                            {unreadCount > 0 && (
                                <span
                                    className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-white"
                                    style={{ backgroundColor: BRAND.green }}
                                />
                            )}
                        </button>

                        {notifOpen && (
                            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl">
                                <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
                                    <span className="text-sm font-semibold text-[#0B1A16]">Notifications</span>
                                    <span
                                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                                        style={{ backgroundColor: BRAND.soft, color: BRAND.greenDark }}
                                    >
                                        {unreadCount} new
                                    </span>
                                </div>
                                <ul className="max-h-80 overflow-y-auto">
                                    {NOTIFICATIONS.map((n) => (
                                        <li key={n.id} className="flex gap-3 border-b border-black/5 px-4 py-3 last:border-0 hover:bg-[#F4FAF7]">
                                            <span
                                                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                                                style={{ backgroundColor: n.unread ? BRAND.green : 'transparent' }}
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-[#0B1A16]">{n.title}</p>
                                                <p className="truncate text-xs text-[#0B1A16]/55">{n.body}</p>
                                                <p className="mt-0.5 text-[11px] text-[#0B1A16]/35">{n.time}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* ---------- Profile ---------- */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => {
                                setProfileOpen((v) => !v);
                                setNotifOpen(false);
                            }}
                            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 transition hover:bg-[#F4FAF7] sm:pr-2.5"
                        >
                            <span
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                                style={{ backgroundColor: BRAND.ink }}
                            >
                                {initials}
                            </span>
                            <span className="hidden text-left sm:block">
                                <span className="block text-sm font-semibold leading-tight text-[#0B1A16]">{user.name}</span>
                                <span className="block text-xs leading-tight text-[#0B1A16]/50">{user.role}</span>
                            </span>
                            <ChevronIcon className="hidden text-[#0B1A16]/40 sm:block" />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-black/5 bg-white py-1.5 shadow-xl">
                                <Link href="/profile" className="block px-4 py-2 text-sm text-[#0B1A16]/75 hover:bg-[#F4FAF7]">
                                    Profile
                                </Link>
                                <Link href="/settings" className="block px-4 py-2 text-sm text-[#0B1A16]/75 hover:bg-[#F4FAF7]">
                                    Settings
                                </Link>
                                <div className="my-1 border-t border-black/5" />
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="block w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    Log out
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ---------- Search (mobile expanded row) ---------- */}
            {mobileSearchOpen && (
                <div className="border-t border-black/5 px-4 py-3 sm:hidden">
                    <div className="relative">
                        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#0B1A16]/35" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search stations, bookings…"
                            className="w-full rounded-full border border-black/10 bg-[#F4FAF7] py-2.5 pl-10 pr-4 text-sm text-[#0B1A16] outline-none focus:border-transparent focus:bg-white focus:ring-2"
                            style={{ '--tw-ring-color': BRAND.green }}
                        />
                    </div>
                </div>
            )}
        </header>
    );
}