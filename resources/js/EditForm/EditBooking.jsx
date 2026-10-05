import { useForm } from '@inertiajs/react';

/**
 * ChargeSathi — Edit Booking modal.
 * Rendered inline from Booking.jsx (same pattern as AddStation on the
 * Stations page) rather than being its own routed page.
 *
 * Props:
 *   booking   — the booking row being edited
 *   drivers   — [{ id, name }]  for the driver <select>
 *   stations  — [{ id, station_name }]  for the station <select>
 *   onClose   — called after a successful save, or when the user cancels
 */

const BRAND = {
    green: '#02C468',
    ink: '#0B1A16',
};

const STATUS_OPTIONS = ['Upcoming', 'Confirmed', 'Completed', 'Cancelled'];
const PAYMENT_STATUS_OPTIONS = ['Pending', 'Paid', 'Failed', 'Refunded'];
const PAYMENT_METHOD_OPTIONS = ['eSewa', 'Khalti', 'Cash'];

function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#0B1A16]/60">{label}</span>
            {children}
            {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
        </label>
    );
}

const inputClass =
    'w-full rounded-xl border border-black/10 bg-[#F4FAF7] px-3.5 py-2.5 text-sm text-[#0B1A16] outline-none transition focus:border-[#02C468] focus:bg-white focus:ring-2 focus:ring-[#02C468]/25';

export default function EditBooking({ booking, drivers = [], stations = [], onClose }) {
    const { data, setData, put, processing, errors } = useForm({
        driver_id: booking.driver_id,
        station_id: booking.station_id,
        booking_date: (booking.booking_date || '').slice(0, 10),
        start_time: booking.start_time || '',
        end_time: booking.end_time || '',
        amount: booking.amount || '',
        payment_method: booking.payment_method || PAYMENT_METHOD_OPTIONS[0],
        payment_status: booking.payment_status || 'Pending',
        status: booking.status || 'Upcoming',
        notes: booking.notes || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/ourbooking/${booking.id}`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-[#0B1A16]">Edit Booking</h2>
                        <p className="text-xs text-[#0B1A16]/45">{booking.booking_id}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-8 w-8 place-items-center rounded-full text-[#0B1A16]/40 hover:bg-[#F4FAF7]"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={submit}>
                    {/* ---------- Status — the field this modal exists for ---------- */}
                    <Field label="Booking status" error={errors.status}>
                        <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={inputClass}>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <Field label="Driver" error={errors.driver_id}>
                            <select value={data.driver_id} onChange={(e) => setData('driver_id', e.target.value)} className={inputClass}>
                                {drivers.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Station" error={errors.station_id}>
                            <select value={data.station_id} onChange={(e) => setData('station_id', e.target.value)} className={inputClass}>
                                {stations.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.station_name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Booking date" error={errors.booking_date}>
                            <input type="date" value={data.booking_date} onChange={(e) => setData('booking_date', e.target.value)} className={inputClass} />
                        </Field>

                        <Field label="Amount (Rs)" error={errors.amount}>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Start time" error={errors.start_time}>
                            <input type="time" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} className={inputClass} />
                        </Field>

                        <Field label="End time" error={errors.end_time}>
                            <input type="time" value={data.end_time} onChange={(e) => setData('end_time', e.target.value)} className={inputClass} />
                        </Field>

                        <Field label="Payment method" error={errors.payment_method}>
                            <select value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)} className={inputClass}>
                                {PAYMENT_METHOD_OPTIONS.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Payment status" error={errors.payment_status}>
                            <select value={data.payment_status} onChange={(e) => setData('payment_status', e.target.value)} className={inputClass}>
                                {PAYMENT_STATUS_OPTIONS.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <div className="mt-5">
                        <Field label="Notes" error={errors.notes}>
                            <textarea
                                rows={3}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className={inputClass}
                                placeholder="Optional"
                            />
                        </Field>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
                            style={{ backgroundColor: BRAND.green }}
                        >
                            {processing ? 'Saving…' : 'Save changes'}
                        </button>
                        <button type="button" onClick={onClose} className="text-sm font-medium text-[#0B1A16]/60 hover:text-[#0B1A16]">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}