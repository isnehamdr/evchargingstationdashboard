import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

/**
 * ChargeSathi — Admin/Operator dashboard sidebar.
 * White rail, green (#02C468) accents — same system as Welcome/Login/Register.
 *
 * Mobile open/close state is owned by AdminWrapper and passed down as props
 * (mobileOpen / onClose) so AdminNavbar's menu button and this drawer stay
 * in sync.
 *
 * - lg (laptop+):  full 256px rail with labels
 * - sm–lg (tablet): 80px icon-only rail, title attr for a native tooltip
 * - < sm (mobile):  off-canvas drawer, opened via AdminNavbar's menu button
 */

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    greenSoft: '#F4FAF7',
    ink: '#0B1A16',
    red: '#EF4444',
};

const NAV_SECTIONS = [
    {
        label: 'Overview',
        items: [{ name: 'Dashboard', href: '/dashboard', icon: 'grid' }],
    },
    {
        label: 'Operations',
        items: [
            { name: 'Stations', href: '/admin-station', icon: 'station' },
            { name: 'Bookings & Queue', href: '/admin-booking', icon: 'calendar' },
            { name: 'Grid & Faults', href: '/admin-gridfaults', icon: 'alert', badge: 1 },
        ],
    },
    {
        label: 'Business',
        items: [
            { name: 'Revenue & Payouts', href: '/admin-revenue', icon: 'wallet' },
            { name: 'Drivers', href: '/admin-drivers', icon: 'users' },
        ],
    },
    {
        label: 'General',
        items: [
            { name: 'Notifications', href: '/admin-notifications', icon: 'bell' },
            { name: 'Settings', href: '/settings', icon: 'settings' },
        ],
    },
];

function Icon({ name, className = 'h-5 w-5' }) {
    const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, className };
    switch (name) {
        case 'grid':
            return (
                <svg {...common}>
                    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
                    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
                    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
                    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
                </svg>
            );
        case 'station':
            return (
                <svg {...common}>
                    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" strokeLinejoin="round" />
                </svg>
            );
        case 'calendar':
            return (
                <svg {...common}>
                    <rect x="3.5" y="5" width="17" height="16" rx="2" />
                    <path d="M8 3v4M16 3v4M3.5 10h17" strokeLinecap="round" />
                </svg>
            );
        case 'alert':
            return (
                <svg {...common}>
                    <path d="M12 3 2 20h20L12 3Z" strokeLinejoin="round" />
                    <path d="M12 10v4" strokeLinecap="round" />
                    <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
                </svg>
            );
        case 'wallet':
            return (
                <svg {...common}>
                    <rect x="3" y="6" width="18" height="13" rx="2.2" />
                    <path d="M3 10h18" />
                    <path d="M15 14.2h3" strokeLinecap="round" />
                </svg>
            );
        case 'users':
            return (
                <svg {...common}>
                    <circle cx="9" cy="8" r="3.2" />
                    <path d="M2.8 20c.7-3.3 3.3-5.2 6.2-5.2s5.5 1.9 6.2 5.2" strokeLinecap="round" />
                    <path d="M16.2 5.3a3.2 3.2 0 0 1 0 6.2M20.2 20c-.4-2.1-1.5-3.7-3-4.6" strokeLinecap="round" />
                </svg>
            );
        case 'bell':
            return (
                <svg {...common}>
                    <path d="M6 9a6 6 0 1 1 12 0c0 3.5 1 5 1.5 6H4.5C5 14 6 12.5 6 9Z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 18a2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'settings':
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="3" />
                    <path
                        d="M19.4 13.5a7.9 7.9 0 0 0 0-3l2-1.5-2-3.4-2.3.9a8 8 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a8 8 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.9 7.9 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9a8 8 0 0 0 2.6 1.5l.5 2.6h4l.5-2.6a8 8 0 0 0 2.6-1.5l2.3.9 2-3.4-2-1.5Z"
                        strokeLinejoin="round"
                    />
                </svg>
            );
        case 'close':
            return (
                <svg {...common}>
                    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
            );
        default:
            return null;
    }
}

// function BoltMark({ className = 'h-7 w-7' }) {
//     return (
//         <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
//             <path d="M22 4 8 21h9l-3 15L29 19h-9l2-15Z" fill={BRAND.green} />
//         </svg>
//     );
// }

export default function AdminSidebar({ tenantName = 'Lakeside Charging Pvt. Ltd.', logoSrc = '/images/logo.png', mobileOpen = false, onClose = () => {} }) {
    const { url } = usePage();
    // Tries the real logo file first; falls back to the bolt mark + wordmark
    // via React state instead of raw DOM manipulation, so a missing/renamed
    // asset never silently leaves the brand row blank.
    const [logoFailed, setLogoFailed] = useState(false);

    const isActive = (href) => url === href || url.startsWith(href + '/');

    return (
        <>
            {/* ---------- Mobile backdrop ---------- */}
            {mobileOpen && <div onClick={onClose} className="fixed inset-0 z-40 bg-black/30 sm:hidden" aria-hidden="true" />}

            {/* ---------- Sidebar ---------- */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-black/[0.06] bg-white transition-transform duration-300 ease-in-out
                    sm:sticky sm:top-0 sm:z-30 sm:h-screen sm:w-20 sm:translate-x-0
                    lg:w-72
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Brand */}
                <div className="flex h-16 shrink-0 items-center gap-2.5 px-5 sm:justify-center sm:px-0 lg:justify-start lg:px-6">
                    {logoSrc && !logoFailed ? (
                        <img
                            src={logoSrc}
                            alt="ChargeSathi"
                            className="h-7 w-auto sm:h-24"
                            onError={() => setLogoFailed(true)}
                        />
                    ) : (
                        <span className="flex items-center gap-2">
                            <BoltMark className="h-7 w-7 shrink-0" />
                            <span className="text-[17px] font-bold tracking-tight text-[#0B1A16] sm:hidden lg:inline">ChargeSathi</span>
                        </span>
                    )}

                    <button
                        onClick={onClose}
                        className="ml-auto grid h-8 w-8 place-items-center rounded-full text-[#0B1A16]/50 hover:bg-[#F4FAF7] sm:hidden"
                        aria-label="Close menu"
                    >
                        <Icon name="close" className="h-4 w-4" />
                    </button>
                </div>

                {/* Tenant indicator — multi-tenant SaaS context */}
                {/* <div className="hidden px-6 pb-4 lg:block">
                    <p className="truncate rounded-lg bg-[#F4FAF7] px-2.5 py-1.5 text-xs font-medium text-[#0B1A16]/50">{tenantName}</p>
                </div>
                <div className="h-px shrink-0 bg-black/[0.06]" /> */}

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 sm:px-2.5 lg:px-4">
                    {NAV_SECTIONS.map((section) => (
                        <div key={section.label} className="mb-6">
                            <p className="mb-2 hidden px-3 text-[11px] font-semibold uppercase tracking-wide text-[#0B1A16]/35 lg:block">
                                {section.label}
                            </p>
                            <ul className="space-y-0.5">
                                {section.items.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                title={item.name}
                                                onClick={onClose}
                                                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition sm:justify-center lg:justify-start
                                                    ${active ? 'text-[#0B1A16]' : 'text-[#0B1A16]/55 hover:bg-[#F4FAF7] hover:text-[#0B1A16]'}`}
                                                style={active ? { backgroundColor: BRAND.greenSoft } : undefined}
                                            >
                                                {active && (
                                                    <span
                                                        className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                                                        style={{ backgroundColor: BRAND.green }}
                                                    />
                                                )}
                                                <span className="relative shrink-0" style={{ color: active ? BRAND.greenDark : undefined }}>
                                                    <Icon name={item.icon} />
                                                    {item.badge ? (
                                                        <span
                                                            className="absolute -right-1.5 -top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full text-[9px] font-bold text-white ring-2 ring-white sm:flex lg:hidden"
                                                            style={{ backgroundColor: BRAND.red }}
                                                        >
                                                            {item.badge}
                                                        </span>
                                                    ) : null}
                                                </span>
                                                <span className="sm:hidden lg:inline">{item.name}</span>
                                                {item.badge ? (
                                                    <span
                                                        className="ml-auto hidden rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white lg:inline"
                                                        style={{ backgroundColor: BRAND.red }}
                                                    >
                                                        {item.badge}
                                                    </span>
                                                ) : null}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Grid status footer — quick-glance, echoes the hero card on Welcome */}
                {/* <div className="shrink-0 p-4">
                    <div className="hidden rounded-2xl p-3.5 lg:block" style={{ backgroundColor: BRAND.ink }}>
                        <p className="text-[11px] font-medium text-white/45">Grid status</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold" style={{ color: BRAND.green }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: BRAND.green }} />
                            Stable · No load-shedding
                        </p>
                    </div>
                    <div className="mx-auto hidden h-2.5 w-2.5 rounded-full sm:block lg:hidden" style={{ backgroundColor: BRAND.green }} title="Grid stable" />
                </div> */}
            </aside>
        </>
    );
}