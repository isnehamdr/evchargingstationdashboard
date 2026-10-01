// import ApplicationLogo from '@/Components/ApplicationLogo';
// import { Link } from '@inertiajs/react';

import AdminWrapper from "@/AdminDashboard/AdminWrapper";

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            {/* <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                </Link>
            </div> */}

            <AdminWrapper>
             {children}
             </AdminWrapper>


           
        </div>
    );
}
