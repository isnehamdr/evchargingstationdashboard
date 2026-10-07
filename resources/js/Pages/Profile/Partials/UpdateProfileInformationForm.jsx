import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { BRAND, Btn, Card, inputCls, Label } from './ui';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <Card
            title="Profile information"
            desc="Update your account's profile information and email address."
            className={className}
        >
            <form onSubmit={submit} className="max-w-xl space-y-5">
                <div>
                    <Label htmlFor="name">Name</Label>
                    <TextInput
                        id="name"
                        className={inputCls}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <Label htmlFor="email">Email</Label>
                    <TextInput
                        id="email"
                        type="email"
                        className={inputCls}
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-xl p-3" style={{ backgroundColor: BRAND.amberSoft }}>
                        <p className="text-sm text-[#0B1A16]">
                            Your email address is unverified.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="text-sm font-semibold underline"
                                style={{ color: BRAND.amber }}
                            >
                                Re-send verification email
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="mt-2 text-xs font-semibold" style={{ color: BRAND.greenDark }}>
                                A new verification link has been sent to your email address.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Btn type="submit" disabled={processing}>Save</Btn>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs font-medium" style={{ color: BRAND.greenDark }}>Saved.</p>
                    </Transition>
                </div>
            </form>
        </Card>
    );
}