import { router } from '@inertiajs/react';

const BRAND = { green: '#02C468', greenDark: '#019654', soft: '#F4FAF7', ink: '#0B1A16', red: '#B91C1C', redSoft: '#FEE2E2', amber: '#B45309', amberSoft: '#FEF3C7' };

const money = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

function Usage({ label, used, max }) {
    const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 100;
    const full = max > 0 && used >= max;

    return (
        <div>
            <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-[#0B1A16]">{label}</span>
                <span className={full ? 'font-semibold text-red-600' : 'text-[#0B1A16]/60'}>
                    {used} of {max} used
                </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#ECEEED]">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: full ? BRAND.red : BRAND.green }} />
            </div>
        </div>
    );
}

export default function PlanTab({ plan }) {
    if (!plan) return null;

    const ends = plan.ends_at ? new Date(plan.ends_at) : null;
    const daysLeft = ends ? Math.ceil((ends - new Date()) / 86400000) : null;
    const current = plan.plans.find((p) => p.id === plan.current_id);

    const request = (p) => {
        if (confirm(`Request the ${p.name} plan (${money(p.price_monthly)}/month)? We will contact you to arrange payment.`)) {
            router.post(route('settings.plan.upgrade'), { plan_id: p.id }, { preserveScroll: true });
        }
    };

    return (
        <>
            <h3 className="text-sm font-semibold text-[#0B1A16]">Your plan</h3>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl p-4" style={{ backgroundColor: BRAND.soft }}>
                <div>
                    <p className="text-lg font-bold text-[#0B1A16]">{plan.name ?? 'No plan'}</p>
                    <p className="text-xs text-[#0B1A16]/50">{plan.price ? `${money(plan.price)} per month` : ''}</p>
                </div>
                <div className="text-right">
                    {plan.status === 'trial' && (
                        <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: BRAND.amber, backgroundColor: BRAND.amberSoft }}>
                            Free trial
                        </span>
                    )}
                    <p className="mt-1 text-xs" style={{ color: plan.active ? 'rgba(11,26,22,0.5)' : BRAND.red }}>
                        {!plan.active
                            ? 'Expired. Contact us to renew. You can still view your data.'
                            : ends
                              ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left (until ${ends.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })})`
                              : ''}
                    </p>
                </div>
            </div>

            <div className="mt-6 grid gap-5">
                <Usage label="Stations" used={plan.limits.stations.used} max={plan.limits.stations.max} />
                <Usage label="Connectors" used={plan.limits.connectors.used} max={plan.limits.connectors.max} />
                <Usage label="Team members" used={plan.limits.users.used} max={plan.limits.users.max} />
            </div>

            <p className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-[#0B1A16]/40">Available plans</p>
            <div className="grid gap-3 sm:grid-cols-2">
                {plan.plans.map((p) => {
                    const isCurrent = p.id === plan.current_id;
                    const isUpgrade = !current || Number(p.price_monthly) > Number(current.price_monthly);

                    return (
                        <div key={p.id} className="rounded-xl border p-4" style={{ borderColor: isCurrent ? BRAND.green : 'rgba(0,0,0,0.08)' }}>
                            <div className="flex items-baseline justify-between">
                                <p className="font-semibold text-[#0B1A16]">{p.name}</p>
                                <p className="text-sm text-[#0B1A16]/60">{money(p.price_monthly)}/mo</p>
                            </div>
                            <ul className="mt-2 space-y-0.5 text-xs text-[#0B1A16]/60">
                                <li>{p.max_stations} stations</li>
                                <li>{p.max_connectors} connectors</li>
                                <li>{p.max_users} team members</li>
                            </ul>
                            <div className="mt-3">
                                {isCurrent ? (
                                    <span className="text-xs font-semibold" style={{ color: BRAND.greenDark }}>Current plan</span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => request(p)}
                                        className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                                        style={{ backgroundColor: isUpgrade ? BRAND.green : '#6B7280' }}
                                    >
                                        {isUpgrade ? 'Request upgrade' : 'Request change'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}