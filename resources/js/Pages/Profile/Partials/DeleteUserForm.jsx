import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { BRAND, Btn, Card, inputCls, Label } from './ui';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <Card className={className}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl">
                    <h3 className="text-sm font-semibold" style={{ color: BRAND.red }}>
                        Delete account
                    </h3>
                    <p className="mt-1 text-xs text-[#0B1A16]/50">
                        Once your account is deleted, all of its resources and data will be permanently
                        deleted. Download anything you want to keep first.
                    </p>
                </div>
                <Btn variant="danger" onClick={() => setConfirmingUserDeletion(true)}>
                    Delete account
                </Btn>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-5 sm:p-6">
                    <h2 className="text-base font-semibold text-[#0B1A16]">
                        Are you sure you want to delete your account?
                    </h2>
                    <p className="mt-1 text-sm text-[#0B1A16]/60">
                        This is permanent. Enter your password to confirm.
                    </p>

                    <div className="mt-5">
                        <Label htmlFor="password" className="sr-only">Password</Label>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className={inputCls}
                            isFocused
                            placeholder="Password"
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
                        <Btn variant="danger" type="submit" disabled={processing}>Delete account</Btn>
                    </div>
                </form>
            </Modal>
        </Card>
    );
}