export const BRAND = {
    green: '#02C468',
    greenDark: '#019654',
    ink: '#0B1A16',
    soft: '#F4FAF7',
    amber: '#B45309',
    amberSoft: '#FEF3C7',
    red: '#B91C1C',
    redSoft: '#FEE2E2',
};

export const inputCls =
    'mt-1 block w-full rounded-xl border-black/10 bg-white text-sm text-[#0B1A16] shadow-none placeholder:text-[#0B1A16]/30 focus:!border-[#02C468] focus:!ring-[#02C468]/30';

export function Card({ title, desc, children, className = '' }) {
    return (
        <div className={`rounded-2xl border border-black/5 bg-white p-5 sm:p-6 ${className}`}>
            {title && (
                <header className="mb-5">
                    <h3 className="text-sm font-semibold text-[#0B1A16]">{title}</h3>
                    {desc && <p className="mt-1 text-xs text-[#0B1A16]/50">{desc}</p>}
                </header>
            )}
            {children}
        </div>
    );
}

export function Label({ htmlFor, children, className = '' }) {
    return (
        <label htmlFor={htmlFor} className={`block text-xs font-medium text-[#0B1A16]/60 ${className}`}>
            {children}
        </label>
    );
}

export function Btn({ variant = 'primary', type = 'button', className = '', style, ...props }) {
    const base =
        'inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50 sm:w-auto';
    const variants = {
        primary: { cls: 'text-white hover:brightness-95', style: { backgroundColor: BRAND.green } },
        danger: { cls: 'text-white hover:brightness-95', style: { backgroundColor: BRAND.red } },
        ghost: { cls: 'border border-black/10 text-[#0B1A16] hover:bg-[#F4FAF7]' },
    };
    const v = variants[variant];
    return (
        <button
            type={type}
            className={`${base} ${v.cls} ${className}`}
            style={{ ...v.style, ...style }}
            {...props}
        />
    );
}