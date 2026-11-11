import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    UserRound,
    Mail,
    ShieldCheck,
    LogOut,
    ShieldAlert,
    X,
} from 'lucide-react'

const Profile = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const user = JSON.parse(
        localStorage.getItem('resolveon-user') || '{}'
    )

    const [showLogoutModal, setShowLogoutModal] = useState(false)

    useEffect(() => {
        if (location.state?.openLogoutModal) {
            setShowLogoutModal(true)

            navigate(location.pathname, {
                replace: true,
                state: {},
            })
        }
    }, [location.state, location.pathname, navigate])

    const handleLogout = () => {
        localStorage.removeItem('resolveon-token')
        localStorage.removeItem('resolveon-user')

        navigate('/login', { replace: true })
    }


    return (
        <div className="min-h-full text-white">

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">
                    Profile
                </h1>

                <p className="mt-1.5 text-sm text-slate-400">
                    Manage your personal account details and session.
                </p>
            </div>

            {/* Profile Content */}
            <div className="w-full max-w-3xl space-y-5">

                {/* Account Card */}
                <div className="overflow-hidden rounded-2xl border border-[#27324D] bg-[#151C32]">

                    {/* Profile Header */}
                    <div className="flex items-center gap-5 border-b border-[#27324D] px-6 py-6">

                        <div className="flex h-16 w-16 min-w-16 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-2xl font-bold text-indigo-400">
                            {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-xl font-semibold tracking-tight text-white">
                                {user.name || 'User'}
                            </h2>

                            <p className="mt-1 break-all text-sm text-slate-400">
                                {user.email || 'Email not available'}
                            </p>

                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Workspace Member
                            </div>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="p-6">

                        <div className="mb-5">
                            <h3 className="text-sm font-semibold text-white">
                                Account Details
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                                Your registered information
                            </p>
                        </div>

                        <div className="divide-y divide-[#27324D]">

                            {/* Name */}
                            <div className="flex items-center justify-between gap-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#202A45]">
                                        <UserRound className="h-4 w-4 text-indigo-400" />
                                    </div>

                                    <span className="text-sm text-slate-400">
                                        Full Name
                                    </span>
                                </div>

                                <span className="text-right text-sm font-medium text-slate-200">
                                    {user.name || 'Not available'}
                                </span>
                            </div>

                            {/* Email */}
                            <div className="flex items-center justify-between gap-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#202A45]">
                                        <Mail className="h-4 w-4 text-indigo-400" />
                                    </div>

                                    <span className="text-sm text-slate-400">
                                        Email Address
                                    </span>
                                </div>

                                <span className="max-w-[65%] break-all text-right text-sm font-medium text-slate-200">
                                    {user.email || 'Not available'}
                                </span>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="rounded-2xl border border-[#27324D] bg-[#151C32]">

                    <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                                <LogOut className="h-4 w-4 text-red-400" />
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-white">
                                    Sign out
                                </h3>

                                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                                    End your current session on this device.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/15"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>

            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-sm rounded-2xl border border-[#303B57] bg-[#151C32] p-6 shadow-2xl">

                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                                <ShieldAlert className="h-5 w-5 text-red-400" />
                            </div>

                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-[#202A45] hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <h2 className="text-lg font-semibold text-white">
                            Sign out of Resolveon?
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed text-slate-400">
                            You will need to log in again to access your workspace.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="rounded-xl border border-[#303B57] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-[#202A45]"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                            >
                                <LogOut className="h-4 w-4" />
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profile