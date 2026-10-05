import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    ink: '#0B1A16',
};

const CONNECTORS = ['CCS2', 'Type 2', 'CHAdeMO', 'GB/T'];

const inputClass =
    'w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-[#0B1A16] outline-none focus:border-[#02C468]';

function Field({ label, error, required, children, className = '' }) {
    return (
        <label className={`block text-xs font-medium text-[#0B1A16]/60 ${className}`}>
            {label}
            {required && <span className="text-red-600"> *</span>}
            <div className="mt-1">{children}</div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </label>
    );
}

export default function AddDriver({ show, onClose }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        vehicle_model: '',
        vehicle_number: '',
        connector_type: '',
    });

    const close = () => {
        reset();
        clearErrors();
        onClose();
    };

    // Close on Escape
    useEffect(() => {
        if (!show) return;
        const onKey = (e) => e.key === 'Escape' && close();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [show]);

    if (!show) return null;

    const submit = (e) => {
        e.preventDefault();
        post(route('ourdrivers.store'), {
            preserveScroll: true,
            onSuccess: close,
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={close}
        >
            <div
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-driver-title"
            >
                {/* Header */}
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <h2 id="add-driver-title" className="text-lg font-bold text-[#0B1A16]">
                            Add driver
                        </h2>
                        <p className="mt-0.5 text-xs text-[#0B1A16]/50">
                            Create a driver account and register their vehicle.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close"
                        className="rounded-full p-1.5 text-xl leading-none text-[#0B1A16]/40 hover:bg-black/5"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Account */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#0B1A16]/40">
                            Account
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Full name" required error={errors.name} className="sm:col-span-2">
                                <input
                                    className={inputClass}
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    autoFocus
                                />
                            </Field>
                            <Field label="Email" required error={errors.email}>
                                <input
                                    type="email"
                                    className={inputClass}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </Field>
                            <Field label="Phone" error={errors.phone}>
                                <input
                                    className={inputClass}
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                            </Field>
                            <Field
                                label="Password (min 8 characters)"
                                required
                                error={errors.password}
                                className="sm:col-span-2"
                            >
                                <input
                                    type="password"
                                    className={inputClass}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Vehicle */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#0B1A16]/40">
                            Vehicle
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Vehicle model" error={errors.vehicle_model}>
                                <input
                                    className={inputClass}
                                    placeholder="e.g. Nissan Leaf"
                                    value={data.vehicle_model}
                                    onChange={(e) => setData('vehicle_model', e.target.value)}
                                />
                            </Field>
                            <Field label="Vehicle number" error={errors.vehicle_number}>
                                <input
                                    className={inputClass}
                                    placeholder="e.g. BA 1 PA 1234"
                                    value={data.vehicle_number}
                                    onChange={(e) => setData('vehicle_number', e.target.value)}
                                />
                            </Field>
                            <Field label="Connector type" error={errors.connector_type} className="sm:col-span-2">
                                <select
                                    className={inputClass}
                                    value={data.connector_type}
                                    onChange={(e) => setData('connector_type', e.target.value)}
                                >
                                    <option value="">Select connector…</option>
                                    {CONNECTORS.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 border-t border-black/5 pt-4">
                        <button
                            type="button"
                            onClick={close}
                            className="rounded-full border border-black/10 px-5 py-2 text-xs font-semibold text-[#0B1A16]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-full px-5 py-2 text-xs font-semibold text-white disabled:opacity-60"
                            style={{ backgroundColor: BRAND.green }}
                        >
                            {processing ? 'Saving…' : 'Save driver'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}