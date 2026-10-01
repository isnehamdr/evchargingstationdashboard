import axios from "axios";
import React, { useEffect, useState } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowSize: [41, 41],
});

const BRAND = { green: "#00C368", greenDark: "#00A857", ink: "#0B1A16" };

// Nepal map settings
const NEPAL_CENTER = [28.3949, 84.124];
const NEPAL_BOUNDS = [
    [26.35, 80.05], // south-west
    [30.45, 88.2], // north-east
];
const isInNepal = (lat, lng) =>
    lat >= NEPAL_BOUNDS[0][0] && lat <= NEPAL_BOUNDS[1][0] && lng >= NEPAL_BOUNDS[0][1] && lng <= NEPAL_BOUNDS[1][1];

const STATUS_OPTIONS = [
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
    { value: "fault", label: "Fault" },
];

const ACCESS_TYPES = [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
    { value: "restricted", label: "Restricted" },
    { value: "fleet-only", label: "Fleet only" },
];

const DAYS = [
    ["mon", "Monday"],
    ["tue", "Tuesday"],
    ["wed", "Wednesday"],
    ["thu", "Thursday"],
    ["fri", "Friday"],
    ["sat", "Saturday"],
    ["sun", "Sunday"],
];

const DEFAULT_AMENITIES = [
    "Restroom",
    "Cafe",
    "Wi-Fi",
    "Parking",
    "Shelter",
    "Shop",
    "Lounge",
    "Security",
    "CCTV",
    "Lighting",
];

const MAX_IMAGES = 6;
const MAX_IMAGE_MB = 2;

const labelFor = (i) => String.fromCharCode(65 + i); // A, B, C...

// uid is only a React key and is never sent to the server.
let uidCounter = 0;
const newUid = () => ++uidCounter;

const makeConnector = (i) => ({
    uid: newUid(),
    label: labelFor(i),
    type: "",
    power_kw: "",
    status: "available",
});

/* ---------- Operating hours helpers ---------- */
const emptyHours = () => ({
    is24: false,
    days: Object.fromEntries(DAYS.map(([k]) => [k, { closed: false, open: "", close: "" }])),
});

const hoursFromApi = (oh) => {
    const base = emptyHours();
    if (!oh) return base;
    if (oh.is_24_7) return { ...base, is24: true };
    DAYS.forEach(([k]) => {
        const d = oh.days?.[k];
        if (d) base.days[k] = { closed: !!d.closed, open: d.open || "", close: d.close || "" };
    });
    return base;
};

// Returns null when nothing was filled in, so the database stores no hours.
const hoursToApi = (h) => {
    if (h.is24) return { is_24_7: true };

    const days = {};
    DAYS.forEach(([k]) => {
        const d = h.days[k];
        if (d.closed) days[k] = { closed: true, open: null, close: null };
        else if (d.open && d.close) days[k] = { closed: false, open: d.open, close: d.close };
    });

    return Object.keys(days).length ? { is_24_7: false, days } : null;
};

const emptyForm = () => ({
    station_code: "",
    station_name: "",
    site_name: "",
    operator_name: "",
    status: "online",
    access_type: "public",
    address_line1: "",
    address_line2: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "Nepal",
    latitude: "",
    longitude: "",
    location_notes: "",
    contact_phone: "",
    contact_email: "",
    hours: emptyHours(),
    amenities: [],
    images: [],
    connectors: [makeConnector(0)],
});

const formFromStation = (s) => ({
    station_code: s.station_code ?? "",
    station_name: s.station_name ?? "",
    site_name: s.site_name ?? "",
    operator_name: s.operator_name ?? "",
    status: s.status || "online",
    access_type: s.access_type || "public",
    address_line1: s.address_line1 ?? "",
    address_line2: s.address_line2 ?? "",
    city: s.city ?? "",
    state_province: s.state_province ?? "",
    postal_code: s.postal_code ?? "",
    country: s.country || "Nepal",
    latitude: s.latitude ?? "",
    longitude: s.longitude ?? "",
    location_notes: s.location_notes ?? "",
    contact_phone: s.contact_phone ?? "",
    contact_email: s.contact_email ?? "",
    hours: hoursFromApi(s.operating_hours),
    amenities: s.amenities || [],
    images: s.images || [],
    connectors: s.connectors?.length
        ? s.connectors.map((c) => ({
              uid: newUid(),
              label: c.label,
              type: c.type || "",
              power_kw: c.power_kw ?? "",
              status: c.status || "available",
          }))
        : [makeConnector(0)],
});

const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
const hintClass = "text-xs text-gray-400 mb-1.5";
const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#00C368] focus:border-[#00C368] transition";

const SectionTitle = ({ children }) => (
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
        {children}
    </p>
);

// Defined outside AddStation so inputs keep focus while typing.
const Field = ({ label, required, optional, hint, error, children }) => (
    <div className="flex flex-col">
        <label className={labelClass}>
            {label}
            {required && <span className="text-red-500"> *</span>}
            {optional && <span className="text-gray-400 font-normal"> (optional)</span>}
        </label>
        {hint && <p className={hintClass}>{hint}</p>}
        {children}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

/* ---------- Map helpers ---------- */
const ClickHandler = ({ onPick }) => {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Keeps the map view in sync when position changes from inputs / edit mode,
// and fixes sizing since the map renders inside a modal.
const MapSync = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        const t = setTimeout(() => map.invalidateSize(), 100);
        return () => clearTimeout(t);
    }, [map]);
    useEffect(() => {
        if (position) map.flyTo(position, Math.max(map.getZoom(), 13), { duration: 0.6 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position?.[0], position?.[1]]);
    return null;
};

const AddStation = ({
    editingStation = null,
    setEditingStation,
    setShowForm,
    onSave, // async (payload, editingId|null) => void
    typeSuggestions = [], // strings shown as suggestions under the connector type field
}) => {
    const [form, setForm] = useState(emptyForm());
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [customAmenity, setCustomAmenity] = useState("");
    const [uploading, setUploading] = useState(false);
    const [imageError, setImageError] = useState("");

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    useEffect(() => {
        setForm(editingStation ? formFromStation(editingStation) : emptyForm());
        setErrors({});
        setImageError("");
        setCustomAmenity("");
    }, [editingStation]);

    // Marker position derived from form lat/lng
    const latNum = form.latitude === "" ? NaN : Number(form.latitude);
    const lngNum = form.longitude === "" ? NaN : Number(form.longitude);
    const position = !isNaN(latNum) && !isNaN(lngNum) ? [latNum, lngNum] : null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined, location: undefined }));
    };

    const handleMapPick = (lat, lng) => {
        if (!isInNepal(lat, lng)) {
            setErrors((prev) => ({ ...prev, location: "Please select a location within Nepal" }));
            return;
        }
        setForm((prev) => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
        }));
        setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined, location: undefined }));
    };

    /* ----- Operating hours ----- */
    const setHours = (fn) => {
        setForm((prev) => ({ ...prev, hours: fn(prev.hours) }));
        setErrors((prev) => ({ ...prev, hours: undefined }));
    };

    const updateDay = (key, patch) =>
        setHours((h) => ({ ...h, days: { ...h.days, [key]: { ...h.days[key], ...patch } } }));

    const copyMondayToAll = () =>
        setHours((h) => ({
            ...h,
            days: Object.fromEntries(DAYS.map(([k]) => [k, { ...h.days.mon }])),
        }));

    /* ----- Amenities ----- */
    const toggleAmenity = (name) =>
        setForm((prev) => {
            const has = prev.amenities.some((a) => a.toLowerCase() === name.toLowerCase());
            return {
                ...prev,
                amenities: has
                    ? prev.amenities.filter((a) => a.toLowerCase() !== name.toLowerCase())
                    : [...prev.amenities, name],
            };
        });

    const addCustomAmenity = () => {
        const name = customAmenity.trim();
        if (!name) return;
        setForm((prev) =>
            prev.amenities.some((a) => a.toLowerCase() === name.toLowerCase()) || prev.amenities.length >= 20
                ? prev
                : { ...prev, amenities: [...prev.amenities, name] }
        );
        setCustomAmenity("");
    };

    // Default options first, then any custom ones that are selected.
    const amenityOptions = [
        ...DEFAULT_AMENITIES,
        ...form.amenities.filter((a) => !DEFAULT_AMENITIES.some((d) => d.toLowerCase() === a.toLowerCase())),
    ];

    /* ----- Images ----- */
    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = "";
        if (!files.length) return;

        const slots = MAX_IMAGES - form.images.length;
        if (slots <= 0) {
            setImageError(`You can add up to ${MAX_IMAGES} images.`);
            return;
        }

        setImageError("");
        setUploading(true);

        try {
            for (const file of files.slice(0, slots)) {
                if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
                    setImageError(`${file.name} is larger than ${MAX_IMAGE_MB} MB.`);
                    continue;
                }
                const fd = new FormData();
                fd.append("image", file);
                const res = await axios.post("/ourstation/images", fd);
                setForm((prev) => ({ ...prev, images: [...prev.images, res.data.path] }));
            }
        } catch (err) {
            setImageError(
                err?.response?.data?.errors?.image?.[0] || err?.response?.data?.message || "Image upload failed."
            );
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (path) =>
        setForm((prev) => ({ ...prev, images: prev.images.filter((p) => p !== path) }));

    /* ----- Connectors ----- */
    const updateConnector = (idx, key, value) => {
        setForm((prev) => ({
            ...prev,
            connectors: prev.connectors.map((c, i) => (i === idx ? { ...c, [key]: value } : c)),
        }));
        setErrors((prev) => ({ ...prev, connectors: undefined }));
    };

    const addConnector = () =>
        setForm((prev) =>
            prev.connectors.length >= 12
                ? prev
                : { ...prev, connectors: [...prev.connectors, makeConnector(prev.connectors.length)] }
        );

    const removeConnector = (idx) =>
        setForm((prev) => ({
            ...prev,
            connectors: prev.connectors.filter((_, i) => i !== idx).map((c, i) => ({ ...c, label: labelFor(i) })),
        }));

    /* ----- Validation + submit ----- */
    const validate = () => {
        const e = {};
        if (!form.station_name.trim()) e.station_name = "Station name is required";
        if (!form.address_line1.trim()) e.address_line1 = "Address is required";
        if (!form.city.trim()) e.city = "City is required";
        if (!form.country.trim()) e.country = "Country is required";

        if (form.contact_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim()))
            e.contact_email = "Enter a valid email address";

        if (form.latitude !== "" && (isNaN(form.latitude) || Math.abs(form.latitude) > 90))
            e.latitude = "Invalid latitude";
        if (form.longitude !== "" && (isNaN(form.longitude) || Math.abs(form.longitude) > 180))
            e.longitude = "Invalid longitude";

        // Map location is required
        if (!position) {
            e.location = "Please select the station location on the map";
        } else if (!isInNepal(position[0], position[1])) {
            e.location = "Location must be within Nepal";
        }

        if (!form.hours.is24) {
            const half = DAYS.some(([k]) => {
                const d = form.hours.days[k];
                return !d.closed && (!!d.open !== !!d.close);
            });
            if (half) e.hours = "Set both opening and closing time for a day, or mark it as closed";
        }

        if (form.connectors.length === 0) {
            e.connectors = "Add at least one connector";
        } else if (form.connectors.some((c) => !c.type.trim())) {
            e.connectors = "Enter a connector type for every connector";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingStation?.(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = {
            // Left out when blank so the server keeps / generates the code.
            station_code: form.station_code.trim() || undefined,
            station_name: form.station_name.trim(),
            site_name: form.site_name.trim(),
            operator_name: form.operator_name.trim(),
            status: form.status, // online / offline / fault (mapped in Station.jsx)
            access_type: form.access_type,
            address_line1: form.address_line1.trim(),
            address_line2: form.address_line2.trim(),
            city: form.city.trim(),
            state_province: form.state_province.trim(),
            postal_code: form.postal_code.trim(),
            country: form.country.trim(),
            latitude: Number(form.latitude),
            longitude: Number(form.longitude),
            location_notes: form.location_notes.trim(),
            contact_phone: form.contact_phone.trim(),
            contact_email: form.contact_email.trim(),
            operating_hours: hoursToApi(form.hours),
            amenities: form.amenities,
            images: form.images,
            connectors: form.connectors.map((c) => ({
                label: c.label,
                type: c.type.trim(),
                power_kw: c.power_kw === "" ? 0 : Number(c.power_kw),
                status: form.status === "offline" ? "offline" : c.status,
            })),
        };

        try {
            setSubmitting(true);
            await onSave(payload, editingStation?.id ?? null);
            closeForm();
        } catch (err) {
            const v = err?.response?.data?.errors;
            if (v) {
                const first = Object.keys(v)[0];
                alert(v[first]?.[0] || "Please check the form fields.");
            } else {
                alert(err?.response?.data?.message || "Error saving station. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl flex flex-col">
                {/* Header */}
                <div className="sticky top-0 z-[1100] flex justify-between items-center px-8 py-5 bg-white border-b border-gray-200">
                    <h2 className="text-xl font-bold tracking-wide" style={{ color: BRAND.ink }}>
                        {editingStation ? "Edit Station" : "Add New Station"}
                    </h2>
                    <button type="button" onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-8">
                    {/* Section 1: Basic */}
                    <div className="flex flex-col gap-4">
                        <SectionTitle>Basic Information</SectionTitle>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                label="Station Code"
                                optional
                                hint="Leave blank to generate one automatically."
                                error={errors.station_code}
                            >
                                <input
                                    type="text"
                                    name="station_code"
                                    maxLength={50}
                                    value={form.station_code}
                                    onChange={handleChange}
                                    placeholder="e.g., STN-LAKE-03"
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Station Name"
                                required
                                hint="Shown on the map and in station lists."
                                error={errors.station_name}
                            >
                                <input
                                    type="text"
                                    name="station_name"
                                    maxLength={255}
                                    value={form.station_name}
                                    onChange={handleChange}
                                    placeholder="e.g., Lakeside Station 03"
                                    className={inputClass}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Site Name" optional error={errors.site_name}>
                                <input
                                    type="text"
                                    name="site_name"
                                    maxLength={255}
                                    value={form.site_name}
                                    onChange={handleChange}
                                    placeholder="e.g., Lakeside Mall"
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="Operator Name" optional error={errors.operator_name}>
                                <input
                                    type="text"
                                    name="operator_name"
                                    maxLength={255}
                                    value={form.operator_name}
                                    onChange={handleChange}
                                    placeholder="e.g., Blue Lotus Hospitality"
                                    className={inputClass}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Status" hint="Initial operating state.">
                                <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Access Type" hint="Who can use this station.">
                                <select
                                    name="access_type"
                                    value={form.access_type}
                                    onChange={handleChange}
                                    className={inputClass}
                                >
                                    {ACCESS_TYPES.map((a) => (
                                        <option key={a.value} value={a.value}>
                                            {a.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </div>

                    {/* Section 2: Address */}
                    <div className="flex flex-col gap-4">
                        <SectionTitle>Address</SectionTitle>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Address Line 1" required error={errors.address_line1}>
                                <input
                                    type="text"
                                    name="address_line1"
                                    maxLength={255}
                                    value={form.address_line1}
                                    onChange={handleChange}
                                    placeholder="e.g., Lakeside, Pokhara-6"
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="Address Line 2" optional error={errors.address_line2}>
                                <input
                                    type="text"
                                    name="address_line2"
                                    maxLength={255}
                                    value={form.address_line2}
                                    onChange={handleChange}
                                    placeholder="Landmark, building, floor"
                                    className={inputClass}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="City" required error={errors.city}>
                                <input
                                    type="text"
                                    name="city"
                                    maxLength={100}
                                    value={form.city}
                                    onChange={handleChange}
                                    placeholder="e.g., Pokhara"
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="State / Province" optional error={errors.state_province}>
                                <input
                                    type="text"
                                    name="state_province"
                                    maxLength={100}
                                    value={form.state_province}
                                    onChange={handleChange}
                                    placeholder="e.g., Gandaki Province"
                                    className={inputClass}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Postal Code" optional error={errors.postal_code}>
                                <input
                                    type="text"
                                    name="postal_code"
                                    maxLength={20}
                                    value={form.postal_code}
                                    onChange={handleChange}
                                    placeholder="e.g., 33700"
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="Country" required error={errors.country}>
                                <input
                                    type="text"
                                    name="country"
                                    maxLength={100}
                                    value={form.country}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Section 3: Location (map required) */}
                    <div className="flex flex-col gap-4">
                        <SectionTitle>Location</SectionTitle>

                        <div className="flex flex-col">
                            <label className={labelClass}>
                                Select on Map <span className="text-red-500">*</span>
                            </label>
                            <p className={hintClass}>Click anywhere on the map of Nepal to place the station.</p>

                            <div
                                className={`isolate relative z-0 h-72 w-full overflow-hidden rounded-md border ${
                                    errors.location ? "border-red-400" : "border-gray-300"
                                }`}
                            >
                                <MapContainer
                                    center={position || NEPAL_CENTER}
                                    zoom={position ? 13 : 7}
                                    minZoom={7}
                                    maxBounds={NEPAL_BOUNDS}
                                    maxBoundsViscosity={1.0}
                                    scrollWheelZoom
                                    style={{ height: "100%", width: "100%" }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <ClickHandler onPick={handleMapPick} />
                                    <MapSync position={position} />
                                    {position && <Marker position={position} icon={markerIcon} />}
                                </MapContainer>
                            </div>
                            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Latitude" optional error={errors.latitude}>
                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    value={form.latitude}
                                    onChange={handleChange}
                                    placeholder="28.2096"
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="Longitude" optional error={errors.longitude}>
                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    value={form.longitude}
                                    onChange={handleChange}
                                    placeholder="83.9856"
                                    className={inputClass}
                                />
                            </Field>
                        </div>

                        <Field
                            label="Location Notes"
                            optional
                            hint="Directions or hints for drivers, e.g. “Behind the main gate, near the parking lot.”"
                            error={errors.location_notes}
                        >
                            <textarea
                                name="location_notes"
                                rows={3}
                                maxLength={2000}
                                value={form.location_notes}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </Field>
                    </div>

                    {/* Section 4: Operating hours */}
                    <div className="flex flex-col gap-4">
                        <SectionTitle>Operating Hours</SectionTitle>

                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={form.hours.is24}
                                onChange={(e) => setHours((h) => ({ ...h, is24: e.target.checked }))}
                            />
                            Open 24 hours, every day
                        </label>

                        {!form.hours.is24 && (
                            <div className="flex flex-col gap-2">
                                <p className="text-xs text-gray-400">
                                    Leave a day empty if you don't want to set hours for it.
                                </p>

                                {DAYS.map(([key, label]) => {
                                    const d = form.hours.days[key];
                                    return (
                                        <div
                                            key={key}
                                            className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                                        >
                                            <span className="w-24 text-sm font-medium text-gray-700">{label}</span>
                                            <input
                                                type="time"
                                                value={d.open}
                                                disabled={d.closed}
                                                onChange={(e) => updateDay(key, { open: e.target.value })}
                                                className={`w-32 ${inputClass} disabled:opacity-40`}
                                            />
                                            <span className="text-xs text-gray-400">to</span>
                                            <input
                                                type="time"
                                                value={d.close}
                                                disabled={d.closed}
                                                onChange={(e) => updateDay(key, { close: e.target.value })}
                                                className={`w-32 ${inputClass} disabled:opacity-40`}
                                            />
                                            <label className="ml-auto flex items-center gap-1.5 text-xs text-gray-600">
                                                <input
                                                    type="checkbox"
                                                    checked={d.closed}
                                                    onChange={(e) => updateDay(key, { closed: e.target.checked })}
                                                />
                                                Closed
                                            </label>
                                        </div>
                                    );
                                })}

                                <button
                                    type="button"
                                    onClick={copyMondayToAll}
                                    className="w-fit text-xs font-semibold"
                                    style={{ color: BRAND.greenDark }}
                                >
                                    Copy Monday to all days
                                </button>
                            </div>
                        )}

                        {errors.hours && <p className="text-xs text-red-500">{errors.hours}</p>}
                    </div>

                    {/* Section 5: Amenities */}
                    <div className="flex flex-col gap-4">
                        <SectionTitle>Amenities</SectionTitle>

                        <div className="flex flex-wrap gap-2">
                            {amenityOptions.map((a) => {
                                const selected = form.amenities.some((x) => x.toLowerCase() === a.toLowerCase());
                                return (
                                    <button
                                        key={a}
                                        type="button"
                                        onClick={() => toggleAmenity(a)}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                            selected
                                                ? "border-[#00C368] bg-[#F4FAF7] text-[#00A857]"
                                                : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                                        }`}
                                    >
                                        {selected ? "✓ " : ""}
                                        {a}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                maxLength={50}
                                value={customAmenity}
                                onChange={(e) => setCustomAmenity(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addCustomAmenity();
                                    }
                                }}
                                placeholder="Add another amenity"
                                className={inputClass}
                            />
                            <button
                                type="button"
                                onClick={addCustomAmenity}
                                className="shrink-0 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Section 6: Contact */}
                    <div className="flex flex-col gap-4">
                        <SectionTitle>Contact</SectionTitle>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Contact Phone" optional error={errors.contact_phone}>
                                <input
                                    type="tel"
                                    name="contact_phone"
                                    maxLength={30}
                                    value={form.contact_phone}
                                    onChange={handleChange}
                                    placeholder="e.g., +977 98XXXXXXXX"
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="Contact Email" optional error={errors.contact_email}>
                                <input
                                    type="email"
                                    name="contact_email"
                                    maxLength={255}
                                    value={form.contact_email}
                                    onChange={handleChange}
                                    placeholder="e.g., support@example.com"
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Section 7: Images */}
                    <div className="flex flex-col gap-4">
                        <SectionTitle>Images</SectionTitle>

                        {form.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                                {form.images.map((path) => (
                                    <div
                                        key={path}
                                        className="relative aspect-square overflow-hidden rounded-md border border-gray-200"
                                    >
                                        <img
                                            src={`/storage/${path}`}
                                            alt="Station"
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(path)}
                                            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                                            aria-label="Remove image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div>
                            <label
                                className={`inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 ${
                                    uploading || form.images.length >= MAX_IMAGES ? "pointer-events-none opacity-50" : ""
                                }`}
                            >
                                <Plus size={16} />
                                {uploading ? "Uploading..." : "Upload images"}
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    multiple
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                            </label>
                            <p className="mt-1.5 text-xs text-gray-400">
                                Up to {MAX_IMAGES} images, JPG, PNG or WebP, max {MAX_IMAGE_MB} MB each.
                            </p>
                            {imageError && <p className="mt-1 text-xs text-red-500">{imageError}</p>}
                        </div>
                    </div>

                    {/* Section 8: Connectors */}
                    <div className="flex flex-col gap-4">
                        <SectionTitle>Connectors</SectionTitle>
                        <p className="-mt-2 text-xs text-gray-400">
                            Type a connector type or click one of the suggestions.
                        </p>
                        {errors.connectors && <p className="text-xs text-red-500">{errors.connectors}</p>}

                        <div className="flex flex-col gap-3">
                            {form.connectors.map((c, i) => {
                                const typed = c.type.trim().toLowerCase();
                                const matches = typeSuggestions.filter(
                                    (t) => t.toLowerCase().includes(typed) && t.toLowerCase() !== typed
                                );

                                return (
                                    <div
                                        key={c.uid}
                                        className="grid grid-cols-2 sm:grid-cols-[40px_1.4fr_1fr_1fr_auto] items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md"
                                    >
                                        {/* Badge */}
                                        <div
                                            className="order-1 h-9 w-9 flex items-center justify-center rounded-lg text-sm font-bold text-white justify-self-start"
                                            style={{ backgroundColor: BRAND.green }}
                                        >
                                            {c.label}
                                        </div>

                                        {/* Delete (top-right on mobile, last column on desktop) */}
                                        <button
                                            type="button"
                                            onClick={() => removeConnector(i)}
                                            disabled={form.connectors.length === 1}
                                            className="order-2 sm:order-5 justify-self-end p-2 text-red-600 hover:bg-red-50 rounded-md transition disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        {/* Type */}
                                        <input
                                            type="text"
                                            maxLength={50}
                                            value={c.type}
                                            onChange={(e) => updateConnector(i, "type", e.target.value)}
                                            placeholder="Connector type (e.g., CCS2)"
                                            className={`order-3 sm:order-2 col-span-2 sm:col-span-1 ${inputClass}`}
                                        />

                                        {/* Power */}
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={c.power_kw}
                                            onChange={(e) => updateConnector(i, "power_kw", e.target.value)}
                                            placeholder="Power (kW)"
                                            className={`order-4 sm:order-3 ${inputClass}`}
                                        />

                                        {/* Status */}
                                        <select
                                            value={c.status}
                                            onChange={(e) => updateConnector(i, "status", e.target.value)}
                                            className={`order-5 sm:order-4 ${inputClass}`}
                                        >
                                            <option value="available">Available</option>
                                            <option value="charging">Charging</option>
                                            <option value="fault">Fault</option>
                                            <option value="offline">Offline</option>
                                        </select>

                                        {/* Suggestions */}
                                        {matches.length > 0 && (
                                            <div className="order-6 col-span-2 sm:col-span-5 flex flex-wrap gap-1.5">
                                                {matches.map((t) => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => updateConnector(i, "type", t)}
                                                        className="rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:border-[#00C368] hover:text-[#00A857]"
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={addConnector}
                            disabled={form.connectors.length >= 12}
                            className="inline-flex items-center gap-1.5 w-fit text-sm font-semibold disabled:opacity-40"
                            style={{ color: BRAND.greenDark }}
                        >
                            <Plus size={16} /> Add connector
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 pb-2 border-t border-gray-200 bg-white">
                        <button
                            type="button"
                            onClick={closeForm}
                            className="px-5 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || uploading}
                            className="px-5 py-2 text-sm text-white rounded-md transition font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-95"
                            style={{ backgroundColor: BRAND.green }}
                        >
                            {submitting ? "Saving..." : editingStation ? "Update Station" : "Create Station"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStation;