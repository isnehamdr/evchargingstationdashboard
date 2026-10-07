import AdminWrapper from '@/AdminDashboard/AdminWrapper';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { BRAND } from './Partials/ui';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const verified = !!user.email_verified_at;

    return (
        <AdminWrapper title="Profile">
            <Head title="Profile" />

            <div className="grid gap-4 lg:grid-cols-3">
                {/* Summary */}
                <div className="rounded-2xl border border-black/5 bg-white p-6 text-center lg:col-span-1 lg:self-start">
                    <div
                        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold"
                        style={{ backgroundColor: BRAND.soft, color: BRAND.greenDark }}
                    >
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="mt-4 text-lg font-bold tracking-tight text-[#0B1A16]">{user.name}</h3>
                    <p className="mt-0.5 break-all text-sm text-[#0B1A16]/50">{user.email}</p>
                    <span
                        className="mt-4 inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{
                            color: verified ? BRAND.greenDark : BRAND.amber,
                            backgroundColor: verified ? BRAND.soft : BRAND.amberSoft,
                        }}
                    >
                        {verified ? 'Email verified' : 'Email unverified'}
                    </span>
                </div>

                {/* Forms */}
                <div className="space-y-4 lg:col-span-2">
                    <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                    <UpdatePasswordForm />
                    <DeleteUserForm />
                </div>
            </div>
        </AdminWrapper>
    );
}