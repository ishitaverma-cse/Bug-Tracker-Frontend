import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    FolderKanban,
    Bug,
    CircleDot,
    CheckCircle2,
    ArrowUpRight,
    Clock3,
    Users,
    RefreshCw,
    AlertCircle,
    Layers3,
    Activity,
    Plus,
    TrendingUp,
} from 'lucide-react'

const PROJECTS_API = 'http://localhost:5000/api/projects'
const TICKETS_API = 'http://localhost:5000/api/tickets'

const statusConfig = {
    Open: {
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        bar: 'bg-blue-500',
    },
    'In Progress': {
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        bar: 'bg-amber-500',
    },
    Resolved: {
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        bar: 'bg-emerald-500',
    },
    Closed: {
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        bar: 'bg-slate-500',
    },
}

const priorityConfig = {
    High: {
        color: 'text-rose-400',
        bar: 'bg-rose-500',
    },
    Medium: {
        color: 'text-amber-400',
        bar: 'bg-amber-500',
    },
    Low: {
        color: 'text-emerald-400',
        bar: 'bg-emerald-500',
    },
}

const formatDate = (date) => {
    if (!date) return '—'

    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

const Dashboard = () => {
    const navigate = useNavigate()

    const user = JSON.parse(
        localStorage.getItem('resolveon-user') || '{}'
    )

    const [projects, setProjects] = useState([])
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchDashboardData = async () => {
        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('resolveon-token')

            const headers = {
                Authorization: `Bearer ${token}`,
            }

            const projectResponse = await fetch(PROJECTS_API, {
                headers,
            })

            const projectData = await projectResponse.json()

            if (!projectResponse.ok) {
                throw new Error(
                    projectData.message || 'Failed to fetch projects'
                )
            }

            const fetchedProjects = projectData.projects || []
            setProjects(fetchedProjects)

            const ticketResponses = await Promise.all(
                fetchedProjects.map(async (project) => {
                    const response = await fetch(
                        `${TICKETS_API}/project/${project._id}`,
                        { headers }
                    )

                    const data = await response.json()

                    if (!response.ok) {
                        throw new Error(
                            data.message || 'Failed to fetch tickets'
                        )
                    }

                    return data.tickets || []
                })
            )

            const allTickets = ticketResponses.flat()

            setTickets(allTickets)
        } catch (err) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const totalProjects = projects.length
    const totalTickets = tickets.length

    const openTickets = tickets.filter(
        (ticket) => ticket.status === 'Open'
    ).length

    const resolvedTickets = tickets.filter(
        (ticket) => ticket.status === 'Resolved'
    ).length

    const statusCounts = {
        Open: openTickets,
        'In Progress': tickets.filter(
            (ticket) => ticket.status === 'In Progress'
        ).length,
        Resolved: resolvedTickets,
        Closed: tickets.filter(
            (ticket) => ticket.status === 'Closed'
        ).length,
    }

    const priorityCounts = {
        High: tickets.filter(
            (ticket) => ticket.priority === 'High'
        ).length,
        Medium: tickets.filter(
            (ticket) => ticket.priority === 'Medium'
        ).length,
        Low: tickets.filter(
            (ticket) => ticket.priority === 'Low'
        ).length,
    }

    const recentTickets = [...tickets]
        .sort(
            (a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
        )
        .slice(0, 5)

    const stats = [
        {
            title: 'Total Projects',
            value: totalProjects,
            description: 'Projects in your workspace',
            icon: FolderKanban,
            iconColor: 'text-indigo-400',
            iconBg: 'bg-indigo-500/10',
            accent: 'border-indigo-500/20',
        },
        {
            title: 'Total Tickets',
            value: totalTickets,
            description: 'Issues across all projects',
            icon: Bug,
            iconColor: 'text-violet-400',
            iconBg: 'bg-violet-500/10',
            accent: 'border-violet-500/20',
        },
        {
            title: 'Open Tickets',
            value: openTickets,
            description: 'Issues awaiting action',
            icon: CircleDot,
            iconColor: 'text-blue-400',
            iconBg: 'bg-blue-500/10',
            accent: 'border-blue-500/20',
        },
        {
            title: 'Resolved Tickets',
            value: resolvedTickets,
            description: 'Successfully resolved issues',
            icon: CheckCircle2,
            iconColor: 'text-emerald-400',
            iconBg: 'bg-emerald-500/10',
            accent: 'border-emerald-500/20',
        },
    ]

    const getMemberCount = (project) => {
        const members = project.teamMembers || []
        return members.length + 1
    }

    const getProjectName = (ticket) => {
        if (ticket.projectId && ticket.projectId.title) {
            return ticket.projectId.title
        }

        const project = projects.find(
            (item) => item._id === ticket.projectId
        )

        return project?.title || 'Unknown Project'
    }

    const getAssigneeName = (ticket) => {
        if (!ticket.assignee) return 'Unassigned'

        if (typeof ticket.assignee === 'object') {
            return ticket.assignee.name || 'Assigned'
        }

        return 'Assigned'
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-400" />
                <p className="text-sm font-medium text-slate-400">
                    Loading your workspace...
                </p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-rose-400" />

                <h2 className="mt-4 text-lg font-semibold text-white">
                    Unable to load dashboard
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                    {error}
                </p>

                <button
                    onClick={fetchDashboardData}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
                >
                    <RefreshCw size={16} />
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-8">

            {/* Page Heading */}
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-indigo-400">
                        Workspace Overview
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
                        Dashboard
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Welcome back, {user.name || 'User'}! Here's what's
                        happening with your projects today.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={fetchDashboardData}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/40 hover:text-white"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                    <button
                        onClick={() => navigate('/projects')}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-600"
                    >
                        <Plus size={16} />
                        Projects
                    </button>
                </div>
            </section>

            {/* Welcome Banner */}
            <section className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 via-slate-900 to-slate-900 p-6 sm:p-8">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                        <Activity size={13} />
                        YOUR WORKSPACE
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                        Let's make progress today. 🚀
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                        Stay organized, collaborate with your team, and
                        keep every issue moving toward resolution.
                        Your workspace is ready.
                    </p>

                    <button
                        onClick={() => navigate('/projects')}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 transition hover:text-indigo-300"
                    >
                        Explore your projects
                        <ArrowUpRight size={16} />
                    </button>
                </div>

                <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
            </section>

            {/* Statistics Cards */}
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">
                        Workspace Statistics
                    </h2>

                    <span className="text-xs text-slate-500">
                        Live data
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon

                        return (
                            <div
                                key={stat.title}
                                className={`rounded-2xl border ${stat.accent} bg-slate-900/70 p-5 transition duration-200 hover:-translate-y-1 hover:bg-slate-800/70`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-400">
                                            {stat.title}
                                        </p>

                                        <h3 className="mt-3 text-3xl font-bold tracking-tight text-white">
                                            {stat.value}
                                        </h3>
                                    </div>

                                    <div className={`rounded-xl p-3 ${stat.iconBg}`}>
                                        <Icon
                                            size={21}
                                            className={stat.iconColor}
                                        />
                                    </div>
                                </div>

                                <p className="mt-4 text-xs text-slate-500">
                                    {stat.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Analytics */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                {/* Ticket Status */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Ticket Status
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Distribution of all tracked issues
                            </p>
                        </div>

                        <div className="rounded-xl bg-indigo-500/10 p-3">
                            <Layers3 className="text-indigo-400" size={20} />
                        </div>
                    </div>

                    <div className="mt-6 space-y-5">
                        {Object.entries(statusCounts).map(
                            ([status, count]) => {
                                const config = statusConfig[status]
                                const percentage =
                                    totalTickets > 0
                                        ? (count / totalTickets) * 100
                                        : 0

                                return (
                                    <div key={status}>
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`h-2.5 w-2.5 rounded-full ${config.bar}`}
                                                />

                                                <span className="text-sm font-medium text-slate-300">
                                                    {status}
                                                </span>
                                            </div>

                                            <span className="text-sm font-semibold text-white">
                                                {count}
                                                <span className="ml-2 text-xs font-normal text-slate-500">
                                                    {percentage.toFixed(0)}%
                                                </span>
                                            </span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${config.bar}`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            }
                        )}
                    </div>
                </div>

                {/* Priority Analytics */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Priority Breakdown
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Issues categorized by priority level
                            </p>
                        </div>

                        <div className="rounded-xl bg-rose-500/10 p-3">
                            <TrendingUp className="text-rose-400" size={20} />
                        </div>
                    </div>

                    <div className="mt-6 space-y-5">
                        {Object.entries(priorityCounts).map(
                            ([priority, count]) => {
                                const config = priorityConfig[priority]
                                const percentage =
                                    totalTickets > 0
                                        ? (count / totalTickets) * 100
                                        : 0

                                return (
                                    <div key={priority}>
                                        <div className="mb-2 flex items-center justify-between">
                                            <span
                                                className={`text-sm font-medium ${config.color}`}
                                            >
                                                {priority} Priority
                                            </span>

                                            <span className="text-sm font-semibold text-white">
                                                {count}
                                            </span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${config.bar}`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            }
                        )}
                    </div>

                    <div className="mt-6 rounded-xl border border-rose-500/10 bg-rose-500/5 p-4">
                        <p className="text-sm text-slate-400">
                            <span className="font-semibold text-rose-400">
                                {priorityCounts.High} high-priority issues
                            </span>{' '}
                            require attention across your workspace.
                        </p>
                    </div>
                </div>
            </section>

            {/* Projects Overview */}
            <section>
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Projects Overview
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Your latest workspace projects
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/projects')}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
                    >
                        View all
                        <ArrowUpRight size={16} />
                    </button>
                </div>

                {projects.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
                        <FolderKanban
                            size={32}
                            className="mx-auto text-slate-500"
                        />

                        <h3 className="mt-3 font-semibold text-white">
                            No projects yet
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                            Create your first project to get started.
                        </p>

                        <button
                            onClick={() => navigate('/projects')}
                            className="mt-4 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
                        >
                            Go to Projects
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {projects.slice(0, 4).map((project, index) => {
                            const projectTickets = tickets.filter(
                                (ticket) =>
                                    ticket.projectId?._id === project._id ||
                                    ticket.projectId === project._id
                            )

                            const completed = projectTickets.filter(
                                (ticket) =>
                                    ticket.status === 'Resolved' ||
                                    ticket.status === 'Closed'
                            ).length

                            const completion =
                                projectTickets.length > 0
                                    ? (completed / projectTickets.length) * 100
                                    : 0

                            return (
                                <button
                                    key={project._id}
                                    onClick={() =>
                                        navigate(
                                            `/projects/${project._id}/tickets`
                                        )
                                    }
                                    className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-left transition hover:border-indigo-500/30 hover:bg-slate-800/70"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                                                <FolderKanban size={21} />
                                            </div>

                                            <div>
                                                <h3 className="font-semibold text-white transition group-hover:text-indigo-300">
                                                    {project.title}
                                                </h3>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    Created{' '}
                                                    {formatDate(project.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <ArrowUpRight
                                            size={18}
                                            className="text-slate-500 transition group-hover:text-indigo-400"
                                        />
                                    </div>

                                    <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">
                                        {project.description ||
                                            'No project description available.'}
                                    </p>

                                    <div className="mt-5 flex items-center justify-between text-xs">
                                        <span className="inline-flex items-center gap-1.5 text-slate-400">
                                            <Bug size={14} />
                                            {projectTickets.length} tickets
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 text-slate-400">
                                            <Users size={14} />
                                            {getMemberCount(project)} members
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-xs text-slate-500">
                                                Resolution progress
                                            </span>

                                            <span className="text-xs font-semibold text-indigo-400">
                                                {completion.toFixed(0)}%
                                            </span>
                                        </div>

                                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                                            <div
                                                className="h-full rounded-full bg-indigo-500 transition-all"
                                                style={{
                                                    width: `${completion}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </section>

            {/* Recent Tickets */}
            <section>
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Recent Tickets
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Latest issues created across your projects
                        </p>
                    </div>

                    <span className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
                        Latest 5
                    </span>
                </div>

                {recentTickets.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
                        <Bug
                            size={32}
                            className="mx-auto text-slate-500"
                        />

                        <h3 className="mt-3 font-semibold text-white">
                            No tickets available
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                            Tickets created in your projects will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-left">
                                <thead className="border-b border-slate-800 bg-slate-800/40">
                                    <tr>
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Ticket
                                        </th>

                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Project
                                        </th>

                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Assignee
                                        </th>

                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Priority
                                        </th>

                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Created
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-800/70">
                                    {recentTickets.map((ticket) => {
                                        const status =
                                            statusConfig[ticket.status] ||
                                            statusConfig.Open

                                        const priority =
                                            priorityConfig[ticket.priority] ||
                                            priorityConfig.Medium

                                        return (
                                            <tr
                                                key={ticket._id}
                                                onClick={() =>
                                                    navigate(
                                                        `/projects/${ticket.projectId?._id || ticket.projectId}/tickets`
                                                    )
                                                }
                                                className="cursor-pointer transition hover:bg-slate-800/40"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="max-w-[220px]">
                                                        <p className="truncate text-sm font-medium text-white">
                                                            {ticket.title}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            #{ticket._id.slice(-6)}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="text-sm text-slate-300">
                                                        {getProjectName(ticket)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="text-sm text-slate-400">
                                                        {getAssigneeName(ticket)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`text-xs font-semibold ${priority.color}`}
                                                    >
                                                        {ticket.priority}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${status.color} ${status.bg}`}
                                                    >
                                                        {ticket.status}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-500">
                                                        <Clock3 size={13} />
                                                        {formatDate(ticket.createdAt)}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

        </div>
    )
}

export default Dashboard
