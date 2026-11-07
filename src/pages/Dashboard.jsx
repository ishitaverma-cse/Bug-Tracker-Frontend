import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
    const navigate = useNavigate()

    const user = JSON.parse(
        localStorage.getItem('resolveon-user') || '{}'
    )

    const handleLogout = () => {
        localStorage.removeItem('resolveon-token')
        localStorage.removeItem('resolveon-user')

        navigate('/login', {
            replace: true,
        })
    }

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-10">
            <div className="mx-auto max-w-5xl">

                {/* Header */}
                <header className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div>
                        <h1 className="text-3xl font-bold text-indigo-400">
                            Resolveon
                        </h1>

                        <p className="mt-1 text-sm text-slate-400">
                            Your workspace for smarter bug tracking
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="rounded-lg bg-red-500/10 px-4 py-2 font-medium text-red-400 transition hover:bg-red-500/20"
                    >
                        Logout
                    </button>
                </header>

                {/* Welcome */}
                <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
                    <p className="text-sm font-medium text-indigo-400">
                        DASHBOARD
                    </p>

                    <h2 className="mt-3 text-3xl font-semibold text-white">
                        Welcome back, {user.name || 'User'}! 👋
                    </h2>

                    <p className="mt-3 text-slate-400">
                        You have successfully logged in to Resolveon.
                        Your workspace is ready.
                    </p>
                </section>

            </div>
        </div>
    )
}

export default Dashboard