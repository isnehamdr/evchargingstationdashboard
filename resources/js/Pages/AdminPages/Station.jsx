import AddStation from '@/AddForm/AddStation';
import AdminWrapper from '@/AdminDashboard/AdminWrapper';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

const BRAND = {
    green: '#00C368',
    greenDark: '#00A857',
    greenSoft: '#F4FAF7',
    ink: '#0B1A16',
    red: '#EF4444',
    amber: '#F59E0B',
    gray: '#D1D5DB',
};

const CONNECTOR_FILL = {
    available: '#E7F9EF',
    charging: BRAND.green,
    fault: BRAND.red,
    offline: BRAND.gray,
};

const CONNECTOR_TEXT = {
    available: BRAND.greenDark,
    charging: '#FFFFFF',
    fault: '#FFFFFF',
    offline: '#6B7280',
};

const STATUS_META = {
    online: { label: 'Online', dot: BRAND.green, bg: BRAND.greenSoft, text: BRAND.greenDark },
    fault: { label: 'Fault', dot: BRAND.red, bg: '#FEF2F2', text: '#B91C1C' },
    offline: { label: 'Offline', dot: BRAND.gray, bg: '#F3F4F6', text: '#6B7280' },
};

const ACCESS_LABELS = {
    public: 'Public',
    private: 'Private',
    restricted: 'Restricted',
    'fleet-only': 'Fleet only',
};

const DAY_ORDER = [
    ['mon', 'Monday'],
    ['tue', 'Tuesday'],
    ['wed', 'Wednesday'],
    ['thu', 'Thursday'],
    ['fri', 'Friday'],
    ['sat', 'Saturday'],
    ['sun', 'Sunday'],
];

// Common connector types suggested in the form. Anything else can be typed in.
const DEFAULT_CONNECTOR_TYPES = [
    'Type 1 (J1772)',
    'Type 2',
    'CCS1',
    'CCS2',
    'CHAdeMO',
    'GB/T AC',
    'GB/T DC',
    'NACS (Tesla)',
];

/* ---------- API <-> UI mapping ---------- */
// Only the status differs: the UI uses online/fault/offline, the database uses active/maintenance/closed.
const STATUS_TO_DB = { online: 'active', fault: 'maintenance', offline: 'closed' };
const STATUS_FROM_DB = { active: 'online', maintenance: 'fault', closed: 'offline' };

const fromApi = (s) => ({
    ...s,
    status: STATUS_FROM_DB[s.status] || 'offline',
    amenities: s.amenities || [],
    images: s.images || [],
    connectors: (s.connectors || []).map((c) => ({
        label: c.label,
        type: c.type,
        power_kw: c.power_kw,
        status: c.status,
    })),
    // No sessions/telemetry data yet, so these stay at 0 for now.
    powerKw: 0,
    sessionsToday: 0,
});

const toApi = (p) => ({
    ...p,
    status: STATUS_TO_DB[p.status] || 'active',
});

/** Row of connector ports drawn as SVG rects, colored by live status. */
function ConnectorRects({ connectors }) {
    const cell = 34;
    const gap = 6;
    const width = connectors.length * cell + Math.max(connectors.length - 1, 0) * gap;

    return (
        <svg
            viewBox={`0 0 ${Math.max(width, 1)} ${cell}`}
            className="h-8"
            style={{ width }}
            role="img"
            aria-label="Connector status"
        >
            {connectors.map((c, i) => (
                <g key={`${c.label}-${i}`}>
                    <rect
                        x={i * (cell + gap)}
                        y={0}
                        width={cell}
                        height={cell}
                        rx={9}
                        fill={CONNECTOR_FILL[c.status]}
                        stroke={c.status === 'available' ? '#CFEFDD' : 'transparent'}
                    />
                    <text
                        x={i * (cell + gap) + cell / 2}
                        y={cell / 2 + 4.5}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="700"
                        fill={CONNECTOR_TEXT[c.status]}
                    >
                        {c.label}
                    </text>
                </g>
            ))}
        </svg>
    );
}

/** Thin utilization bar — track + fill, both SVG rects, rounded. */
function UsageBar({ value, max, fill = BRAND.green }) {
    const w = 160;
    const h = 6;
    const pct = max > 0 ? Math.min(1, value / max) : 0;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="h-1.5 w-full" preserveAspectRatio="none">
            <rect x="0" y="0" width={w} height={h} rx={h / 2} fill="#ECEEED" />
            <rect x="0" y="0" width={w * pct} height={h} rx={h / 2} fill={fill} />
        </svg>
    );
}

function StatusPill({ status }) {
    const meta = STATUS_META[status] || STATUS_META.offline;
    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ backgroundColor: meta.bg, color: meta.text }}
        >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
            {meta.label}
        </span>
    );
}

function StatCard({ label, value, sub, value2, max2 }) {
    return (
        <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
            <p className="text-xs font-medium text-[#0B1A16]/50">{label}</p>
            <p className="mt-1 text-2xl font-bold text-[#0B1A16]">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-[#0B1A16]/40">{sub}</p>}
            {max2 != null && (
                <div className="mt-3">
                    <UsageBar value={value2} max={max2} />
                </div>
            )}
        </div>
    );
}

function StationCard({ station, onView, onEdit, onDelete }) {
    const online = station.status !== 'offline';
    const inUse = station.connectors.filter((c) => c.status === 'charging').length;

    return (
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#0B1A16]">{station.station_name}</p>
                    <p className="mt-0.5 truncate text-xs text-[#0B1A16]/45">
                        {station.address_line1}
                        {station.city ? `, ${station.city}` : ''}
                    </p>
                </div>
                <StatusPill status={station.status} />
            </div>

            <div className="mt-4">
                <ConnectorRects connectors={station.connectors} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-black/[0.06] pt-3">
                <div>
                    <p className="text-[11px] font-medium text-[#0B1A16]/40">Live draw</p>
                    <p className="text-sm font-semibold text-[#0B1A16]">
                        {online ? `${Number(station.powerKw || 0).toFixed(1)} kW` : '—'}
                    </p>
                </div>
                <div>
                    <p className="text-[11px] font-medium text-[#0B1A16]/40">Sessions today</p>
                    <p className="text-sm font-semibold text-[#0B1A16]">{station.sessionsToday}</p>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-[11px] text-[#0B1A16]/40">
                    {inUse}/{station.connectors.length} connectors in use
                </p>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => onView(station)}
                        className="text-xs font-semibold text-[#0B1A16]/60 hover:text-[#0B1A16]"
                    >
                        View
                    </button>
                    <button
                        type="button"
                        onClick={() => onEdit(station)}
                        className="text-xs font-semibold text-[#0B1A16]/60 hover:text-[#0B1A16]"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(station)}
                        className="text-xs font-semibold text-red-500 hover:text-red-600"
                    >
                        Delete
                    </button>
                    <Link
                        href={`/stations/${station.id}`}
                        className="text-xs font-semibold"
                        style={{ color: BRAND.greenDark }}
                    >
                        Manage →
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Row({ label, children }) {
    return (
        <div className="flex justify-between gap-4 border-b border-black/[0.06] py-2 text-sm">
            <span className="shrink-0 text-[#0B1A16]/50">{label}</span>
            <span className="text-right font-medium text-[#0B1A16]">{children || '—'}</span>
        </div>
    );
}

function SubTitle({ children }) {
    return (
        <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-widest text-[#0B1A16]/40">{children}</p>
    );
}

function StationDetails({ station, onClose }) {
    const hours = station.operating_hours;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-[#0B1A16]">{station.station_name}</h2>
                        <p className="text-xs text-[#0B1A16]/45">{station.station_code}</p>
                    </div>
                    <StatusPill status={station.status} />
                </div>

                {station.images.length > 0 && (
                    <div className="mb-4 grid grid-cols-3 gap-2">
                        {station.images.map((path) => (
                            <img
                                key={path}
                                src={`/storage/${path}`}
                                alt={station.station_name}
                                className="aspect-square w-full rounded-md object-cover"
                            />
                        ))}
                    </div>
                )}

                <Row label="Site">{station.site_name}</Row>
                <Row label="Operator">{station.operator_name}</Row>
                <Row label="Access">{ACCESS_LABELS[station.access_type] || station.access_type}</Row>

                <SubTitle>Address</SubTitle>
                <Row label="Address line 1">{station.address_line1}</Row>
                <Row label="Address line 2">{station.address_line2}</Row>
                <Row label="City">{station.city}</Row>
                <Row label="State / Province">{station.state_province}</Row>
                <Row label="Postal code">{station.postal_code}</Row>
                <Row label="Country">{station.country}</Row>
                <Row label="Latitude">{station.latitude}</Row>
                <Row label="Longitude">{station.longitude}</Row>
                <Row label="Location notes">{station.location_notes}</Row>

                <SubTitle>Contact</SubTitle>
                <Row label="Phone">{station.contact_phone}</Row>
                <Row label="Email">{station.contact_email}</Row>

                <SubTitle>Operating hours</SubTitle>
                {!hours && <p className="text-sm text-[#0B1A16]/50">Not set</p>}
                {hours?.is_24_7 && <p className="text-sm font-medium text-[#0B1A16]">Open 24 hours, every day</p>}
                {hours && !hours.is_24_7 && (
                    <div>
                        {DAY_ORDER.filter(([k]) => hours.days?.[k]).map(([k, label]) => {
                            const d = hours.days[k];
                            return (
                                <Row key={k} label={label}>
                                    {d.closed ? 'Closed' : `${d.open} – ${d.close}`}
                                </Row>
                            );
                        })}
                    </div>
                )}

                <SubTitle>Amenities</SubTitle>
                {station.amenities.length === 0 ? (
                    <p className="text-sm text-[#0B1A16]/50">None listed</p>
                ) : (
                    <div className="flex flex-wrap gap-1.5">
                        {station.amenities.map((a) => (
                            <span
                                key={a}
                                className="rounded-full bg-[#F4FAF7] px-2.5 py-1 text-xs font-medium text-[#00A857]"
                            >
                                {a}
                            </span>
                        ))}
                    </div>
                )}

                <SubTitle>Connectors ({station.connectors.length})</SubTitle>
                <div className="flex flex-col gap-2">
                    {station.connectors.map((c, i) => (
                        <div
                            key={`${c.label}-${i}`}
                            className="flex items-center justify-between rounded-md border border-black/[0.06] bg-gray-50 px-3 py-2 text-sm"
                        >
                            <span className="font-semibold">
                                {c.label} · {c.type}
                            </span>
                            <span className="text-[#0B1A16]/60">
                                {Number(c.power_kw) ? `${Number(c.power_kw)} kW` : '—'} · {c.status}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Station() {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingStation, setEditingStation] = useState(null);
    const [viewing, setViewing] = useState(null);

    // READ (list)
    useEffect(() => {
        axios
            .get('/ourstation')
            .then((res) => setStations(res.data.data.map(fromApi)))
            .catch(() => setLoadError('Could not load stations. Please refresh the page.'))
            .finally(() => setLoading(false));
    }, []);

    // Suggested connector types: the defaults plus any type already used on a station.
    const typeSuggestions = useMemo(() => {
        const seen = new Map();
        [...DEFAULT_CONNECTOR_TYPES, ...stations.flatMap((s) => s.connectors.map((c) => c.type))].forEach((t) => {
            const name = (t || '').trim();
            if (name && !seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), name);
        });
        return [...seen.values()].sort((a, b) => a.localeCompare(b));
    }, [stations]);

    // CREATE + UPDATE. Errors are rethrown so AddStation can show them.
    const handleSave = async (payload, id) => {
        const body = toApi(payload);

        if (id) {
            const res = await axios.put(`/ourstation/${id}`, body);
            const updated = fromApi(res.data.data);
            setStations((prev) => prev.map((s) => (s.id === id ? updated : s)));
        } else {
            const res = await axios.post('/ourstation', body);
            setStations((prev) => [fromApi(res.data.data), ...prev]);
        }
    };

    const handleEdit = (station) => {
        setEditingStation(station);
        setShowForm(true);
    };

    // READ (single)
    const handleView = async (station) => {
        try {
            const res = await axios.get(`/ourstation/${station.id}`);
            setViewing(fromApi(res.data.data));
        } catch {
            setViewing(station);
        }
    };

    // DELETE
    const handleDelete = async (station) => {
        if (!window.confirm(`Delete "${station.station_name}"?`)) return;
        try {
            await axios.delete(`/ourstation/${station.id}`);
            setStations((prev) => prev.filter((s) => s.id !== station.id));
        } catch (err) {
            alert(err?.response?.data?.message || 'Could not delete the station. Please try again.');
        }
    };

    const totalConnectors = stations.reduce((n, s) => n + s.connectors.length, 0);
    const inUseConnectors = stations.reduce(
        (n, s) => n + s.connectors.filter((c) => c.status === 'charging').length,
        0
    );
    const onlineStations = stations.filter((s) => s.status !== 'offline').length;
    const faults = stations.reduce(
        (n, s) => n + s.connectors.filter((c) => c.status === 'fault').length,
        0
    );
    const activeSessions = inUseConnectors;

    return (
        <AdminWrapper>
            <div className="p-4 sm:p-6 lg:p-8">
                {/* ---------- Header ---------- */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-[#0B1A16]">Station Operations</h1>
                        <p className="mt-0.5 text-sm text-[#0B1A16]/50">
                            Live connector status across your charging network
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setEditingStation(null);
                            setShowForm(true);
                        }}
                        className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
                        style={{ backgroundColor: BRAND.green }}
                    >
                        + Add Station
                    </button>
                </div>

                {/* ---------- KPI row ---------- */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <StatCard
                        label="Stations online"
                        value={`${onlineStations}/${stations.length}`}
                        sub="Across your network"
                    />
                    <StatCard
                        label="Connectors in use"
                        value={`${inUseConnectors}/${totalConnectors}`}
                        value2={inUseConnectors}
                        max2={totalConnectors}
                    />
                    <StatCard label="Active sessions" value={activeSessions} sub="Right now" />
                    <StatCard
                        label="Open faults"
                        value={faults}
                        sub={faults > 0 ? 'Needs attention' : 'All clear'}
                    />
                </div>

                {/* ---------- Station grid ---------- */}
                {loading ? (
                    <div className="mt-6 rounded-2xl border border-black/[0.06] bg-white p-10 text-center text-sm text-[#0B1A16]/50">
                        Loading stations…
                    </div>
                ) : loadError ? (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-600">
                        {loadError}
                    </div>
                ) : stations.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center text-sm text-[#0B1A16]/50">
                        No stations yet. Click “+ Add Station” to create one.
                    </div>
                ) : (
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {stations.map((station) => (
                            <StationCard
                                key={station.id}
                                station={station}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

                {/* ---------- Legend ---------- */}
                <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-black/[0.06] bg-white px-4 py-3">
                    {[
                        { label: 'Available', fill: CONNECTOR_FILL.available, ring: true },
                        { label: 'Charging', fill: CONNECTOR_FILL.charging },
                        { label: 'Fault', fill: CONNECTOR_FILL.fault },
                        { label: 'Offline', fill: CONNECTOR_FILL.offline },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                            <svg viewBox="0 0 16 16" className="h-4 w-4">
                                <rect
                                    x="0"
                                    y="0"
                                    width="16"
                                    height="16"
                                    rx="4"
                                    fill={item.fill}
                                    stroke={item.ring ? '#CFEFDD' : 'transparent'}
                                />
                            </svg>
                            <span className="text-xs font-medium text-[#0B1A16]/60">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ---------- Add / Edit modal ---------- */}
            {showForm && (
                <AddStation
                    editingStation={editingStation}
                    setEditingStation={setEditingStation}
                    setShowForm={setShowForm}
                    onSave={handleSave}
                    typeSuggestions={typeSuggestions}
                />
            )}

            {/* ---------- View modal ---------- */}
            {viewing && <StationDetails station={viewing} onClose={() => setViewing(null)} />}
        </AdminWrapper>
    );
}