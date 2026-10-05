import AdminWrapper from '@/AdminDashboard/AdminWrapper';
import { Head, Link, usePage } from '@inertiajs/react';

function BackIcon(props) {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

const BRAND = {
    green: '#00C368',
    greenDark: '#00A857',
    red: '#EF4444',
    gray: '#D1D5DB',
};

const CONNECTOR_STYLES = {
    available: { bg: '#E7F9EF', text: BRAND.greenDark },
    charging: { bg: BRAND.green, text: '#FFFFFF' },
    fault: { bg: BRAND.red, text: '#FFFFFF' },
    offline: { bg: BRAND.gray, text: '#6B7280' },
};

export default function StationManage() {
    const { station } = usePage().props;
    const connectors = station.connectors || [];

    return (
        <AdminWrapper
            title={station.station_name}
            actions={
                <Link
                    href="/admin-station"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-black/[0.08] px-3.5 py-2 text-sm font-semibold text-[#0B1A16] transition hover:bg-[#F4FAF7]"
                >
                    <BackIcon />
                    Back to Stations
                </Link>
            }
        >
            <Head title={station.station_name} />

            <div className="grid gap-4 lg:grid-cols-3">
                {/* ---------- Connectors ---------- */}
                <div className="rounded-2xl border border-black/[0.06] bg-white p-6 lg:col-span-2">
                    <h3 className="text-sm font-semibold text-[#0B1A16]">Connectors ({connectors.length})</h3>

                    {connectors.length === 0 ? (
                        <p className="mt-4 text-sm text-[#0B1A16]/45">No connectors added for this station yet.</p>
                    ) : (
                        <div className="mt-4 flex flex-col gap-2">
                            {connectors.map((c) => {
                                const style = CONNECTOR_STYLES[c.status] || CONNECTOR_STYLES.offline;
                                return (
                                    <div
                                        key={c.id ?? c.label}
                                        className="flex items-center justify-between rounded-xl border border-black/[0.06] px-4 py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-[#0B1A16]">{c.label}</p>
                                            <p className="text-xs text-[#0B1A16]/50">
                                                {c.type} {c.power_kw ? `· ${c.power_kw} kW` : ''}
                                            </p>
                                        </div>
                                        <span
                                            className="rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
                                            style={{ backgroundColor: style.bg, color: style.text }}
                                        >
                                            {c.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ---------- Station info ---------- */}
                <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
                    <h3 className="text-sm font-semibold text-[#0B1A16]">Station info</h3>
                    <dl className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between gap-2">
                            <dt className="text-[#0B1A16]/50">Code</dt>
                            <dd className="font-medium text-[#0B1A16]">{station.station_code || '—'}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                            <dt className="text-[#0B1A16]/50">Status</dt>
                            <dd className="font-medium capitalize text-[#0B1A16]">{station.status}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                            <dt className="text-[#0B1A16]/50">City</dt>
                            <dd className="font-medium text-[#0B1A16]">{station.city || '—'}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                            <dt className="text-[#0B1A16]/50">Operator</dt>
                            <dd className="font-medium text-[#0B1A16]">{station.operator_name || '—'}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </AdminWrapper>
    );
}