// import { Head, usePage } from '@inertiajs/react';
// import AdminNavbar from '@/AdminDashboard/AdminNavbar';
// import AdminSidebar from '@/AdminDashboard/AdminSidebar';

// /**
//  * ChargeSathi — Admin/Operator dashboard layout
//  * Wraps AdminSidebar + AdminNavbar around page content with the offsets
//  * AdminSidebar expects (80px rail on tablet, 256px on laptop, off-canvas on mobile).
//  *
//  * Usage in a page:
//  *   export default function Stations() {
//  *     return (
//  *       <AdminWrapper title="Stations">
//  *         ...page content...
//  *       </AdminWrapper>
//  *     );
//  *   }
//  */

// export default function AdminWrapper({ title, tenantName, children }) {
//     const { auth } = usePage().props;

//     return (
//         <>
//             {title && <Head title={title} />}

//             <div className="flex min-h-screen bg-[#F4FAF7]">
//                 <AdminSidebar tenantName={tenantName} />

//                 <div className="flex min-w-0 flex-1 flex-col">
//                     <AdminNavbar user={auth?.user} />

//                     <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
//                         {title && (
//                             <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#0B1A16]">
//                                 {title}
//                             </h1>
//                         )}
//                         {children}
//                     </main>
//                 </div>
//             </div>
//         </>
//     );
// }


import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

/**
 * ChargeSathi — Admin/Operator dashboard layout.
 * Wraps AdminSidebar + AdminNavbar around page content and owns the single
 * piece of shared state both need: whether the mobile drawer is open.
 *
 * Usage in a page:
 *   export default function Stations() {
 *     return (
 *       <AdminWrapper title="Stations" actions={<button>New station</button>}>
 *         ...page content...
 *       </AdminWrapper>
 *     );
 *   }
 */

export default function AdminWrapper({ title, tenantName, actions, children }) {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {title && <Head title={title} />}

            <div className="flex min-h-screen bg-[#F4FAF7]">
                <AdminSidebar tenantName={tenantName} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

                <div className="flex min-w-0 flex-1 flex-col">
                    <AdminNavbar user={auth?.user} onMenuClick={() => setMobileOpen(true)} />

                    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                        {(title || actions) && (
                            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                {title && <h1 className="text-2xl font-bold tracking-tight text-[#0B1A16]">{title}</h1>}
                                {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                            </div>
                        )}
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}