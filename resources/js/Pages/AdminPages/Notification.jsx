import AdminWrapper from '@/AdminDashboard/AdminWrapper';
import { Head, router } from '@inertiajs/react';

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    soft: '#F4FAF7',
    ink: '#0B1A16',
    amber: '#B45309',
    amberSoft: '#FEF3C7',
    red: '#B91C1C',
    redSoft: '#FEE2E2',
    blue: '#1D4ED8',
    blueSoft: '#DBEAFE',
};

const SEVERITY_STYLES = {
    Critical: { color: BRAND.red, bg: BRAND.redSoft },
    Warning: { color: BRAND.amber, bg: BRAND.amberSoft },
    Info: { color: BRAND.blue, bg: BRAND.blueSoft },
};

const TYPE_LABELS = {
    fault: 'Fault',
    feeder: 'Grid',
    booking: 'Booking',
    payment: 'Payment',
    driver: 'Driver',
    system: 'System',
};

const STATUS_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
];
const SEVERITY_FILTERS = ['All', 'Critical', 'Warning', 'Info'];

const timeAgo = (iso) => {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
};

function Card({ children, className = '' }) {
    return <div className={`rounded-2xl border border-black/5 bg-white ${className}`}>{children}</div>;
}

function Kpi({ label, value, valueColor }) {
    return (
        <div className="rounded-2xl border border-black/5 bg-white p-5">
            <p className="text-xs font-medium text-[#0B1A16]/50">{label}</p>
            <p className="mt-2 text-2xl font-bold" style={{ color: valueColor || BRAND.ink }}>
                {value}
            </p>
        </div>
    );
}

export default function Notifications({ notifications, filters = {}, stats = {} }) {
    const items = notifications?.data ?? [];

    const applyFilters = (next) => {
        router.get(
            route('ournotifications.index'),
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const open = (n) => {
        const go = () => n.link && router.visit(n.link);
        if (!n.read_at) {
            router.put(route('ournotifications.read', n.id), {}, { preserveScroll: true, onSuccess: go });
        } else {
            go();
        }
    };

    const markRead = (e, n) => {
        e.stopPropagation();
        router.put(route('ournotifications.read', n.id), {}, { preserveScroll: true });
    };

    const remove = (e, n) => {
        e.stopPropagation();
        router.delete(route('ournotifications.destroy', n.id), { preserveScroll: true });
    };

    const markAll = () => router.put(route('ournotifications.readAll'), {}, { preserveScroll: true });

    const clearRead = () => {
        if (confirm('Delete all read notifications?')) {
            router.delete(route('ournotifications.clearRead'), { preserveScroll: true });
        }
    };

    return (
        <AdminWrapper title="Notifications">
            <Head title="Notifications" />

            {/* ---------- KPI row ---------- */}
            <div className="grid grid-cols-3 gap-4">
                <Kpi label="Total" value={stats.total ?? 0} />
                <Kpi label="Unread" value={stats.unread ?? 0} valueColor={stats.unread > 0 ? BRAND.greenDark : undefined} />
                <Kpi label="Critical unread" value={stats.critical ?? 0} valueColor={stats.critical > 0 ? BRAND.red : undefined} />
            </div>

            <Card className="mt-6 p-6">
                {/* ---------- Toolbar ---------- */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => applyFilters({ status: f.key })}
                                className="rounded-full px-3.5 py-1.5 text-xs font-medium transition"
                                style={
                                    filters.status === f.key
                                        ? { backgroundColor: BRAND.green, color: '#fff' }
                                        : { backgroundColor: '#fff', color: BRAND.ink, border: '1px solid rgba(0,0,0,0.08)' }
                                }
                            >
                                {f.label}
                            </button>
                        ))}

                        <span className="mx-1 h-5 w-px bg-black/10" />

                        {SEVERITY_FILTERS.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => applyFilters({ severity: s })}
                                className="rounded-full px-3.5 py-1.5 text-xs font-medium transition"
                                style={
                                    filters.severity === s
                                        ? { backgroundColor: BRAND.ink, color: '#fff' }
                                        : { backgroundColor: '#fff', color: BRAND.ink, border: '1px solid rgba(0,0,0,0.08)' }
                                }
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={markAll}
                            disabled={!stats.unread}
                            className="text-xs font-semibold disabled:opacity-40"
                            style={{ color: BRAND.greenDark }}
                        >
                            Mark all as read
                        </button>
                        <button
                            type="button"
                            onClick={clearRead}
                            className="text-xs font-semibold"
                            style={{ color: BRAND.red }}
                        >
                            Clear read
                        </button>
                    </div>
                </div>

                {/* ---------- List ---------- */}
                <ul className="divide-y divide-black/5">
                    {items.map((n) => {
                        const sev = SEVERITY_STYLES[n.severity] || SEVERITY_STYLES.Info;
                        const unread = !n.read_at;
                        return (
                            <li
                                key={n.id}
                                onClick={() => open(n)}
                                className={`flex items-start gap-4 py-4 ${n.link ? 'cursor-pointer' : ''} hover:bg-[#F4FAF7]`}
                            >
                                <span
                                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: unread ? sev.color : 'transparent', border: unread ? 'none' : '1px solid rgba(0,0,0,0.15)' }}
                                    title={unread ? 'Unread' : 'Read'}
                                />

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={`text-sm ${unread ? 'font-semibold' : 'font-medium'} text-[#0B1A16]`}>
                                            {n.title}
                                        </p>
                                        <span
                                            className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                            style={{ color: sev.color, backgroundColor: sev.bg }}
                                        >
                                            {n.severity}
                                        </span>
                                        <span className="text-[11px] text-[#0B1A16]/40">
                                            {TYPE_LABELS[n.type] ?? n.type}
                                        </span>
                                    </div>
                                    {n.message && <p className="mt-0.5 text-sm text-[#0B1A16]/60">{n.message}</p>}
                                    <p className="mt-1 text-xs text-[#0B1A16]/35">{timeAgo(n.created_at)}</p>
                                </div>

                                <div className="flex shrink-0 gap-3">
                                    {unread && (
                                        <button
                                            type="button"
                                            onClick={(e) => markRead(e, n)}
                                            className="text-xs font-semibold"
                                            style={{ color: BRAND.greenDark }}
                                        >
                                            Mark read
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={(e) => remove(e, n)}
                                        className="text-xs font-semibold"
                                        style={{ color: BRAND.red }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        );
                    })}

                    {items.length === 0 && (
                        <li className="py-10 text-center text-sm text-[#0B1A16]/40">No notifications here.</li>
                    )}
                </ul>

                {/* ---------- Pagination ---------- */}
                {(notifications?.prev_page_url || notifications?.next_page_url) && (
                    <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
                        <button
                            type="button"
                            disabled={!notifications.prev_page_url}
                            onClick={() => router.get(notifications.prev_page_url, {}, { preserveScroll: true })}
                            className="text-xs font-semibold disabled:opacity-30"
                            style={{ color: BRAND.ink }}
                        >
                            ← Previous
                        </button>
                        <span className="text-xs text-[#0B1A16]/40">
                            Page {notifications.current_page} of {notifications.last_page}
                        </span>
                        <button
                            type="button"
                            disabled={!notifications.next_page_url}
                            onClick={() => router.get(notifications.next_page_url, {}, { preserveScroll: true })}
                            className="text-xs font-semibold disabled:opacity-30"
                            style={{ color: BRAND.ink }}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </Card>
        </AdminWrapper>
    );
}