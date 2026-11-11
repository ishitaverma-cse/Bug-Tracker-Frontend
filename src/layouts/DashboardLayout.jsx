import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    FolderKanban,
    Layers3,
    ChevronDown,
    ChevronRight,
    Plus,
    ArrowUpRight,
    Home,
    Menu,
    Sparkles,
    LogOut,
    ShieldAlert,
    X,
} from 'lucide-react'

const API_URL = 'http://localhost:5000/api/projects'

const DashboardLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const user = JSON.parse(
        localStorage.getItem('resolveon-user') || '{}'
    )

    const [projects, setProjects] = useState([])
    const [projectsExpanded, setProjectsExpanded] = useState(
        location.pathname.startsWith('/projects')
    )
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem('resolveon-token')
        localStorage.removeItem('resolveon-user')

        navigate('/login', { replace: true })
    }

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem('resolveon-token')

                const response = await fetch(API_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Failed to fetch projects'
                    )
                }

                setProjects(data.projects || [])
            } catch (error) {
                console.error('Projects sidebar error:', error.message)
            }
        }

        fetchProjects()
    }, [])

    useEffect(() => {
        if (location.pathname.startsWith('/projects')) {
            setProjectsExpanded(true)
        }

        setMobileMenuOpen(false)
    }, [location.pathname])

    const isProjectsActive = location.pathname.startsWith('/projects')

    const breadcrumbItems = (() => {
        const pathname = location.pathname

        if (pathname === '/dashboard') {
            return [{ label: 'Dashboard' }]
        }

        if (pathname === '/projects') {
            return [
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Projects' },
            ]
        }

        if (pathname.startsWith('/projects/')) {
            const projectId = pathname.split('/')[2]

            const project = projects.find(
                (item) => item._id === projectId
            )

            return [
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Projects', to: '/projects' },
                { label: project?.title || 'Project' },
                { label: 'Tickets' },
            ]
        }

        if (pathname === '/profile') {
            return [
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Profile' },
            ]
        }

        return [{ label: 'Dashboard', to: '/dashboard' }]
    })()

    const closeMobileMenu = () => {
        setMobileMenuOpen(false)
    }

    return (
        <div className="min-h-screen bg-[#070B1A] text-white">

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <button
                    aria-label="Close sidebar"
                    onClick={closeMobileMenu}
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#28324D] bg-[#151D33] transition-transform duration-300 ease-in-out ${mobileMenuOpen
                    ? 'translate-x-0'
                    : '-translate-x-full lg:translate-x-0'
                    }`}
            >

                {/* Logo */}
                <div className="flex h-[92px] shrink-0 items-center justify-between border-b border-[#28324D] bg-[#19223B] px-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/15 shadow-lg shadow-indigo-950/20">
                            <Layers3 className="h-6 w-6 text-indigo-400" />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">
                                Resolveon
                            </h1>

                            <p className="mt-0.5 text-xs font-medium text-slate-400">
                                Project workspace
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={closeMobileMenu}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-[#263352] hover:text-white lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-4 py-6">

                    <div className="mb-5 flex items-center justify-between px-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                            Workspace
                        </p>

                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    </div>

                    <nav className="space-y-2">

                        {/* Dashboard */}
                        <NavLink
                            to="/dashboard"
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                `group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${isActive
                                    ? 'border border-indigo-500/20 bg-indigo-500/15 text-indigo-300 shadow-sm shadow-indigo-950/20'
                                    : 'border border-transparent text-slate-300 hover:bg-[#222D49] hover:text-white'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-indigo-400" />
                                    )}

                                    <LayoutDashboard
                                        className={`h-[19px] w-[19px] ${isActive
                                            ? 'text-indigo-400'
                                            : 'text-slate-400 group-hover:text-indigo-300'
                                            }`}
                                    />

                                    <span>Dashboard</span>
                                </>
                            )}
                        </NavLink>

                        {/* Projects Dropdown */}
                        <div>
                            <button
                                onClick={() =>
                                    setProjectsExpanded((prev) => !prev)
                                }
                                className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${isProjectsActive
                                    ? 'border-indigo-500/20 bg-indigo-500/15 text-indigo-300'
                                    : 'border-transparent text-slate-300 hover:bg-[#222D49] hover:text-white'
                                    }`}
                            >
                                <span className="flex items-center gap-3">
                                    <FolderKanban
                                        className={`h-[19px] w-[19px] ${isProjectsActive
                                            ? 'text-indigo-400'
                                            : 'text-slate-400 group-hover:text-indigo-300'
                                            }`}
                                    />

                                    Projects
                                </span>

                                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.03]">
                                    {projectsExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-indigo-300" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-slate-400" />
                                    )}
                                </span>
                            </button>

                            {/* Nested Projects */}
                            {projectsExpanded && (
                                <div className="ml-4 mt-3 space-y-2 border-l border-[#35415F] pl-3">

                                    {/* All Projects */}
                                    <NavLink
                                        to="/projects"
                                        end
                                        onClick={closeMobileMenu}
                                        className={({ isActive }) =>
                                            `group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all ${isActive
                                                ? 'bg-indigo-500/10 text-indigo-300'
                                                : 'text-slate-400 hover:bg-[#222D49] hover:text-slate-200'
                                            }`
                                        }
                                    >
                                        <Layers3 className="h-4 w-4 shrink-0" />

                                        <span>All Projects</span>

                                        <span className="ml-auto rounded-md border border-[#303B57] bg-[#202A45] px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                                            {projects.length}
                                        </span>
                                    </NavLink>

                                    {/* Project List Heading */}
                                    {projects.length > 0 && (
                                        <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                            Your Projects
                                        </p>
                                    )}

                                    {/* Individual Projects */}
                                    <div className="space-y-1">
                                        {projects.map((project) => {
                                            const projectPath =
                                                `/projects/${project._id}/tickets`

                                            const isActive =
                                                location.pathname === projectPath

                                            return (
                                                <NavLink
                                                    key={project._id}
                                                    to={projectPath}
                                                    onClick={closeMobileMenu}
                                                    title={project.title}
                                                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-all duration-200 ${isActive
                                                        ? 'bg-indigo-500/10 font-semibold text-indigo-300'
                                                        : 'font-medium text-slate-400 hover:bg-[#222D49] hover:text-white'
                                                        }`}
                                                >
                                                    {isActive && (
                                                        <span className="absolute -left-[13px] top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-indigo-400" />
                                                    )}

                                                    <span
                                                        className={`h-2 w-2 shrink-0 rounded-full transition-colors ${isActive
                                                            ? 'bg-indigo-400 shadow-sm shadow-indigo-400/40'
                                                            : 'bg-slate-600 group-hover:bg-indigo-300'
                                                            }`}
                                                    />

                                                    <span className="truncate">
                                                        {project.title}
                                                    </span>
                                                </NavLink>
                                            )
                                        })}
                                    </div>

                                    {/* Add Project */}
                                    <button
                                        onClick={() => {
                                            navigate('/projects')
                                            closeMobileMenu()
                                        }}
                                        className="mt-2 flex w-full items-center gap-2.5 rounded-lg border border-dashed border-[#35415F] px-3 py-2.5 text-[13px] font-medium text-slate-400 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:text-indigo-300"
                                    >
                                        <Plus className="h-4 w-4 shrink-0" />

                                        Add Project
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>

                {/* User Profile */}
                <div className="shrink-0 border-t border-[#28324D] bg-[#121A2E] p-4">
                    <button
                        onClick={() => {
                            navigate('/profile')
                            closeMobileMenu()
                        }}
                        className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${location.pathname === '/profile'
                            ? 'border-indigo-500/30 bg-indigo-500/10'
                            : 'border-[#303B57] bg-[#202A45] hover:border-indigo-500/30 hover:bg-[#263352]'
                            }`}
                    >
                        {/* Avatar */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/15 text-sm font-bold text-indigo-300">
                            {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>

                        {/* User Details */}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">
                                {user.name || 'User'}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                                View profile
                            </p>
                        </div>

                        <ArrowUpRight
                            className={`h-4 w-4 shrink-0 transition-all duration-200 ${location.pathname === '/profile'
                                ? 'text-indigo-400'
                                : 'text-slate-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-400'
                                }`}
                        />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="min-w-0 flex-1 ml-0 lg:ml-64">

                {/* Topbar */}
                <header className="sticky top-0 z-30 flex h-[92px] w-full items-center justify-between gap-4 border-b border-[#202A43] bg-[#070B1A]/95 px-5 backdrop-blur-xl md:px-8">

                    {/* Welcome Section */}
                    <div className="flex min-w-0 flex-1 items-center gap-4">

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#303B57] bg-[#151D33] text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-300 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                                Welcome back
                            </p>

                            <h2 className="mt-1 truncate text-xl font-bold tracking-tight text-white md:text-2xl">
                                {user.name || 'User'} 👋
                            </h2>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex shrink-0 items-center justify-end gap-3">

                        {/* Workspace Badge */}
                        <div className="flex items-center gap-3 rounded-xl border border-[#28324D] bg-[#131B30] px-3 py-2.5 md:px-4">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
                                <FolderKanban className="h-[17px] w-[17px] text-indigo-400" />
                            </div>

                            <div className="hidden sm:block">
                                <p className="text-sm font-semibold text-slate-200">
                                    Resolveon Workspace
                                </p>

                                <div className="mt-1 flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                    <span className="text-xs text-slate-500">
                                        Workspace active
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            type="button"
                            onClick={() => setShowLogoutModal(true)}
                            title="Logout"
                            className="flex h-12 shrink-0 items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 text-sm font-semibold text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </button>

                    </div>
                </header>

                {/* Page Content */}
                <div className="p-5 md:p-8">

                    {/* Breadcrumb Navigation */}
                    <nav
                        aria-label="Breadcrumb"
                        className="mb-7 flex min-h-[48px] items-center overflow-x-auto rounded-xl border border-[#26314B] bg-[#11182B] px-3 py-2.5 md:px-4"
                    >
                        <div className="flex shrink-0 items-center gap-2.5">

                            {breadcrumbItems.map((item, index) => {
                                const isLast =
                                    index === breadcrumbItems.length - 1

                                return (
                                    <div
                                        key={`${item.label}-${index}`}
                                        className="flex shrink-0 items-center gap-2.5"
                                    >
                                        {index > 0 && (
                                            <ChevronRight className="h-4 w-4 text-slate-600" />
                                        )}

                                        {item.to && !isLast ? (
                                            <button
                                                onClick={() =>
                                                    navigate(item.to)
                                                }
                                                className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-[#202A45] hover:text-indigo-300"
                                            >
                                                {index === 0 && (
                                                    <Home className="h-4 w-4 text-slate-500 group-hover:text-indigo-300" />
                                                )}

                                                {item.label}
                                            </button>
                                        ) : (
                                            <span className="flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-sm font-semibold text-indigo-300">
                                                {isLast && (
                                                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                                                )}

                                                {item.label}
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </nav>

                    {/* Current Page */}
                    <Outlet />
                </div>
            </main>

            {/* Navbar Logout Confirmation Modal */}
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
                                Confirm Logout
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardLayout