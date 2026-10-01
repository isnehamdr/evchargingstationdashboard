import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';


const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    ink: '#0B1A16',
    soft: '#F4FAF7',
    red: '#EF4444',
};

const NOTIFICATIONS = [
    { id: 1, title: 'Connector fault', body: 'Lakeside Station 02 · Connector B offline', time: '4m ago', unread: true },
    { id: 2, title: 'New booking', body: 'Damside Station 01 · 5:30–6:00 PM slot reserved', time: '22m ago', unread: true },
    { id: 3, title: 'Payout settled', body: 'Rs 12,400 transferred via eSewa', time: '1h ago', unread: false },
];

// Ziggy's route() is normally injected globally via Blade (@routes). Guard
// against it being missing (e.g. component rendered before that script
// loads) so the navbar never crashes — it just falls back to a plain path.
const logoutHref = typeof route === 'function' ? route('logout') : '/logout';

function MenuIcon({ className = '', ...rest }) {
    return (
        <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8" {...rest}>
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
    );
}

function SearchIcon({ className = '', ...rest }) {
    return (
        <svg viewBox="0 0 24 24" className={`h-[18px] w-[18px] ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8" {...rest}>
            <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CloseIcon({ className = '', ...rest }) {
    return (
        <svg viewBox="0 0 24 24" className={`h-4 w-4 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" {...rest}>
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
        </svg>
    );
}

function BellIcon({ className = '', ...rest }) {
    return (
        <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8" {...rest}>
            <path d="M6 9a6 6 0 1 1 12 0c0 3.5 1 5 1.5 6H4.5C5 14 6 12.5 6 9Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 18a2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ChevronIcon({ className = '', ...rest }) {
    return (
        <svg viewBox="0 0 24 24" className={`h-4 w-4 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" {...rest}>
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/** Closes a panel on outside click or Escape. */
function usePanel() {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return [ref, open, setOpen];
}

/** Shared search field — controlled value, clear button, Enter submits. */
function SearchField({ autoFocus = false, onSubmitted }) {
    const [query, setQuery] = useState('');

    const submit = () => {
        const q = query.trim();
        if (!q) return;
        router.get('/search', { q }, { preserveState: true, preserveScroll: true });
        onSubmitted?.();
    };

    return (
        <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0B1A16]/35" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                autoFocus={autoFocus}
                placeholder="Search stations, bookings, transactions…"
                aria-label="Search"
                className="w-full rounded-xl border border-black/[0.08] bg-[#F4FAF7] py-2.5 pl-10 pr-9 text-sm text-[#0B1A16] outline-none transition placeholder:text-[#0B1A16]/40 focus:border-[#02C468] focus:bg-white focus:ring-2 focus:ring-[#02C468]/25"
            />
            {query && (
                <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-[#0B1A16]/40 hover:bg-black/5 hover:text-[#0B1A16]"
                    aria-label="Clear search"
                >
                    <CloseIcon className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}

export default function AdminNavbar({ user = { name: 'Simran Rai', role: 'Station Manager' }, onMenuClick = () => {} }) {
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const mobileSearchRef = useRef(null);
    const [notifRef, notifOpen, setNotifOpen] = usePanel();
    const [profileRef, profileOpen, setProfileOpen] = usePanel();

    // Close the mobile search row on outside click / Escape, same as the
    // other two panels — previously only its own toggle button could close it.
    useEffect(() => {
        if (!mobileSearchOpen) return;
        const onClick = (e) => {
            if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
                setMobileSearchOpen(false);
            }
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setMobileSearchOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [mobileSearchOpen]);

    const openNotif = () => {
        setNotifOpen((v) => !v);
        setProfileOpen(false);
        setMobileSearchOpen(false);
    };

    const openProfile = () => {
        setProfileOpen((v) => !v);
        setNotifOpen(false);
        setMobileSearchOpen(false);
    };

    const toggleMobileSearch = () => {
        setMobileSearchOpen((v) => !v);
        setNotifOpen(false);
        setProfileOpen(false);
    };

    const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;
    const initials = user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('');

    return (
        <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center gap-2 px-4 sm:px-6 lg:px-8">
                {/* ---------- Mobile menu trigger ---------- */}
                <button
                    onClick={onMenuClick}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#0B1A16]/60 transition hover:bg-[#F4FAF7] sm:hidden"
                    aria-label="Open menu"
                >
                    <MenuIcon />
                </button>

                {/* ---------- Search (desktop / tablet) ---------- */}
                <div className="hidden flex-1 max-w-sm sm:block">
                    <SearchField />
                </div>

                <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
                    {/* ---------- Search (mobile icon) ---------- */}
                    <button
                        onClick={toggleMobileSearch}
                        className="grid h-10 w-10 place-items-center rounded-xl text-[#0B1A16]/60 transition hover:bg-[#F4FAF7] sm:hidden"
                        aria-label="Search"
                        aria-expanded={mobileSearchOpen}
                    >
                        <SearchIcon />
                    </button>

                    {/* ---------- Notifications ---------- */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={openNotif}
                            className="relative grid h-10 w-10 place-items-center rounded-xl text-[#0B1A16]/60 transition hover:bg-[#F4FAF7]"
                            aria-label="Notifications"
                            aria-haspopup="true"
                            aria-expanded={notifOpen}
                        >
                            <BellIcon />
                            {unreadCount > 0 && (
                                <span
                                    className="absolute right-1.5 top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
                                    style={{ backgroundColor: BRAND.red }}
                                >
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {notifOpen && (
                            <div className="absolute right-0 mt-2 w-80 max-w-[85vw] overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-xl ring-1 ring-black/[0.03]">
                                <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
                                    <span className="text-sm font-semibold text-[#0B1A16]">Notifications</span>
                                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: BRAND.soft, color: BRAND.greenDark }}>
                                        {unreadCount} new
                                    </span>
                                </div>
                                <ul className="max-h-80 overflow-y-auto">
                                    {NOTIFICATIONS.map((n) => (
                                        <li key={n.id} className="flex gap-3 border-b border-black/[0.06] px-4 py-3 last:border-0 hover:bg-[#F4FAF7]">
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: n.unread ? BRAND.green : 'transparent' }} />
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

                    <div className="mx-1 hidden h-8 w-px bg-black/[0.08] sm:block" />

                    {/* ---------- Profile ---------- */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={openProfile}
                            className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2 transition hover:bg-[#F4FAF7] sm:pr-3"
                            aria-haspopup="true"
                            aria-expanded={profileOpen}
                        >
                            <span
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white ring-2 ring-white"
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
                            <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-black/[0.06] bg-white py-1.5 shadow-xl ring-1 ring-black/[0.03]">
                                <Link href="/profile" className="block px-4 py-2 text-sm text-[#0B1A16]/75 hover:bg-[#F4FAF7]">
                                    Profile
                                </Link>
                                <Link href="/settings" className="block px-4 py-2 text-sm text-[#0B1A16]/75 hover:bg-[#F4FAF7]">
                                    Settings
                                </Link>
                                <div className="my-1 border-t border-black/[0.06]" />
                                <Link href={logoutHref} method="post" as="button" className="block w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                                    Log out
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ---------- Search (mobile expanded row) ---------- */}
            {mobileSearchOpen && (
                <div ref={mobileSearchRef} className="border-t border-black/[0.06] px-4 py-3 sm:hidden">
                    <SearchField autoFocus onSubmitted={() => setMobileSearchOpen(false)} />
                </div>
            )}
        </header>
    );
}