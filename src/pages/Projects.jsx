import { useEffect, useMemo, useState } from 'react'
import {
    FolderKanban,
    Plus,
    Search,
    Users,
    CalendarDays,
    ArrowUpRight,
    Pencil,
    Trash2,
    X,
    Loader2,
    CircleAlert,
    CheckCircle2,
    Activity,
    Clock3,
    Layers3,
    Sparkles,
} from 'lucide-react'

const API_URL = 'http://localhost:5000/api/projects'

const Projects = () => {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedProject, setSelectedProject] = useState(null)
    const [showDescriptionModal, setShowDescriptionModal] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
    })

    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // Fetch Projects
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
                    throw new Error(data.message || 'Failed to fetch projects')
                }

                setProjects(data.projects || [])
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [])

    // Date Formatting
    const formatDate = (date) => {
        if (!date) return 'N/A'

        const parsedDate = new Date(date)

        if (Number.isNaN(parsedDate.getTime())) return 'N/A'

        return parsedDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    const formatRelativeDate = (date) => {
        if (!date) return 'Date unavailable'

        const parsedDate = new Date(date)

        if (Number.isNaN(parsedDate.getTime())) return 'Date unavailable'

        const now = new Date()
        const diff = Math.floor((now - parsedDate) / (1000 * 60 * 60 * 24))

        if (diff === 0) return 'Today'
        if (diff === 1) return 'Yesterday'
        if (diff < 7) return `${diff} days ago`

        return formatDate(date)
    }

    // Open Create Modal
    const openCreateModal = () => {
        setSelectedProject(null)
        setFormData({ title: '', description: '' })
        setCreateError('')
        setShowCreateModal(true)
    }

    // Open Edit Modal
    const openEditModal = (project) => {
        setSelectedProject(project)

        setFormData({
            title: project.title || '',
            description: project.description || '',
        })

        setCreateError('')
        setShowCreateModal(true)
    }

    // Handle Form Input
    const handleInputChange = (e) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // Create / Update Project
    const handleCreateProject = async (e) => {
        e.preventDefault()

        setCreateError('')
        setSuccessMessage('')

        const title = formData.title.trim()
        const description = formData.description.trim()

        if (!title || !description) {
            setCreateError('Please fill in all fields.')
            return
        }

        try {
            setCreating(true)

            const token = localStorage.getItem('resolveon-token')
            const isEditing = Boolean(selectedProject)

            const url = isEditing
                ? `${API_URL}/${selectedProject._id}`
                : API_URL

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, description }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    `Failed to ${isEditing ? 'update' : 'create'} project`
                )
            }

            const updatedProject = data.project || data

            if (isEditing) {
                setProjects((prev) =>
                    prev.map((project) =>
                        project._id === selectedProject._id
                            ? updatedProject
                            : project
                    )
                )

                setSuccessMessage('Project updated successfully!')
            } else {
                setProjects((prev) => [updatedProject, ...prev])
                setSuccessMessage('Project created successfully!')
            }

            setFormData({ title: '', description: '' })
            setSelectedProject(null)
            setShowCreateModal(false)
        } catch (err) {
            setCreateError(err.message)
        } finally {
            setCreating(false)
        }
    }

    // Open Delete Modal
    const openDeleteModal = (project) => {
        setSelectedProject(project)
        setCreateError('')
        setShowDeleteModal(true)
    }

    // Delete Project
    const handleDeleteProject = async () => {
        if (!selectedProject) return

        try {
            setCreating(true)
            setCreateError('')
            setSuccessMessage('')

            const token = localStorage.getItem('resolveon-token')

            const response = await fetch(
                `${API_URL}/${selectedProject._id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete project')
            }

            setProjects((prev) =>
                prev.filter((project) => project._id !== selectedProject._id)
            )

            setShowDeleteModal(false)
            setSelectedProject(null)
            setSuccessMessage('Project deleted successfully!')
        } catch (err) {
            setCreateError(err.message)
        } finally {
            setCreating(false)
        }
    }

    // Search Projects — frontend filtering only
    const filteredProjects = useMemo(() => {
        const searchTerm = search.trim().toLowerCase()

        if (!searchTerm) {
            return projects
        }

        return projects.filter((project) => {
            const title = (project.title || '').toLowerCase()
            const description = (project.description || '').toLowerCase()

            return (
                title.includes(searchTerm) ||
                description.includes(searchTerm)
            )
        })
    }, [projects, search])

    // Overview Metrics
    const totalTeamMembers = projects.reduce(
        (total, project) => total + (project.teamMembers?.length || 0),
        0
    )

    const latestProject = useMemo(() => {
        if (!projects.length) return null

        return [...projects].sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt || 0)
            const dateB = new Date(b.updatedAt || b.createdAt || 0)

            return dateB - dateA
        })[0]
    }, [projects])

    // Recent Activity
    const recentActivity = useMemo(() => {
        return [...projects]
            .sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.createdAt || 0)
                const dateB = new Date(b.updatedAt || b.createdAt || 0)

                return dateB - dateA
            })
            .slice(0, 3)
    }, [projects])

    const isProjectUpdated = (project) => {
        if (!project.updatedAt || !project.createdAt) return false

        return (
            new Date(project.updatedAt).getTime() >
            new Date(project.createdAt).getTime() + 1000
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">

                {/* Page Header */}
                <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                            <Sparkles size={14} />
                            Workspace Overview
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            My Projects
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                            Bring your team together, organize your work, and
                            keep every project moving forward.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition duration-200 hover:bg-indigo-400 active:scale-[0.98] sm:w-auto sm:px-5 sm:py-3"
                    >
                        <Plus size={18} className="shrink-0" />
                        <span className="whitespace-nowrap">Create Project</span>
                    </button>
                </header>

                {/* Success Feedback */}
                {successMessage && (
                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                        <CheckCircle2 size={18} />

                        <span>{successMessage}</span>

                        <button
                            onClick={() => setSuccessMessage('')}
                            className="ml-auto rounded-lg p-1 transition hover:bg-emerald-500/10"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Overview Cards */}
                <section className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

                    {/* Total Projects */}
                    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/70 p-6 transition hover:border-indigo-500/30">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl transition group-hover:bg-indigo-500/10" />

                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">
                                    Total Projects
                                </p>

                                <h2 className="mt-4 text-4xl font-bold tracking-tight">
                                    {projects.length.toString().padStart(2, '0')}
                                </h2>

                                <p className="mt-2 text-xs text-slate-500">
                                    Projects in your workspace
                                </p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                                <FolderKanban size={22} className="text-indigo-400" />
                            </div>
                        </div>

                        <div className="mt-5 flex items-center gap-2 text-xs font-medium text-indigo-300">
                            <Layers3 size={14} />
                            Workspace portfolio
                        </div>
                    </div>

                    {/* Team Memberships */}
                    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/70 p-6 transition hover:border-emerald-500/30">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl transition group-hover:bg-emerald-500/10" />

                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">
                                    Team Memberships
                                </p>

                                <h2 className="mt-4 text-4xl font-bold tracking-tight">
                                    {totalTeamMembers.toString().padStart(2, '0')}
                                </h2>

                                <p className="mt-2 text-xs text-slate-500">
                                    Members across all projects
                                </p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                                <Users size={22} className="text-emerald-400" />
                            </div>
                        </div>

                        <div className="mt-5 flex items-center gap-2 text-xs font-medium text-emerald-300">
                            <Activity size={14} />
                            Team collaboration
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/70 p-6 transition hover:border-amber-500/30 sm:col-span-2 xl:col-span-1">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl transition group-hover:bg-amber-500/10" />

                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">
                                    Recent Activity
                                </p>

                                <h2 className="mt-4 text-2xl font-bold tracking-tight">
                                    {latestProject
                                        ? formatRelativeDate(
                                            latestProject.updatedAt ||
                                            latestProject.createdAt
                                        )
                                        : 'No activity'}
                                </h2>

                                <p className="mt-2 text-xs text-slate-500">
                                    {latestProject
                                        ? latestProject.title
                                        : 'Create a project to get started'}
                                </p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
                                <Clock3 size={22} className="text-amber-400" />
                            </div>
                        </div>

                        <div className="mt-5 flex items-center gap-2 text-xs font-medium text-amber-300">
                            <Activity size={14} />
                            Latest project activity
                        </div>
                    </div>
                </section>

                {/* Recent Activity Panel */}
                <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                                    <Activity size={18} className="text-amber-400" />
                                </div>

                                <h2 className="text-lg font-semibold">
                                    Recent Activity
                                </h2>
                            </div>

                            <p className="mt-2 text-sm text-slate-500">
                                A quick look at the latest changes in your workspace.
                            </p>
                        </div>

                        <span className="w-fit rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-400">
                            Latest {recentActivity.length} projects
                        </span>
                    </div>

                    {recentActivity.length === 0 ? (
                        <div className="mt-6 rounded-xl border border-dashed border-slate-800 py-8 text-center">
                            <Activity
                                size={28}
                                className="mx-auto text-slate-600"
                            />

                            <p className="mt-3 text-sm font-medium text-slate-300">
                                Nothing to show yet
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Your project activity will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6 space-y-4">
                            {recentActivity.map((project, index) => {
                                const updated = isProjectUpdated(project)

                                return (
                                    <div
                                        key={project._id}
                                        className="flex items-start gap-4"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${updated
                                                    ? 'bg-indigo-500/10 text-indigo-400'
                                                    : 'bg-emerald-500/10 text-emerald-400'
                                                    }`}
                                            >
                                                {updated ? (
                                                    <Pencil size={16} />
                                                ) : (
                                                    <Plus size={18} />
                                                )}
                                            </div>

                                            {index !== recentActivity.length - 1 && (
                                                <div className="mt-2 h-6 w-px bg-slate-800" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1 pb-2">
                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                <p className="text-sm font-medium text-slate-200">
                                                    {updated
                                                        ? 'Project updated'
                                                        : 'Project created'}
                                                </p>

                                                <span className="text-xs text-slate-500">
                                                    {formatRelativeDate(
                                                        project.updatedAt ||
                                                        project.createdAt
                                                    )}
                                                </span>
                                            </div>

                                            <p className="mt-1 truncate text-sm text-slate-400">
                                                <span className="font-medium text-indigo-300">
                                                    {project.title}
                                                </span>
                                                {' — '}
                                                {updated
                                                    ? 'Project details were modified.'
                                                    : 'A new project was added to your workspace.'}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </section>

                {/* All Projects */}
                <section className="mt-10">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold tracking-tight">
                                    All Projects
                                </h2>

                                <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
                                    {filteredProjects.length}
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-slate-400">
                                Browse and manage all your workspace projects.
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:max-w-sm">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <input
                                type="text"
                                placeholder="Search by project name or description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10"
                            />
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="mt-6 flex min-h-72 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
                            <div className="text-center">
                                <Loader2
                                    size={34}
                                    className="mx-auto animate-spin text-indigo-400"
                                />

                                <p className="mt-4 text-sm text-slate-400">
                                    Loading your projects...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Fetch Error */}
                    {!loading && error && (
                        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
                            <CircleAlert
                                size={32}
                                className="mx-auto text-red-400"
                            />

                            <p className="mt-4 font-medium text-red-300">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && filteredProjects.length === 0 && (
                        <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
                                <Search size={24} className="text-indigo-400" />
                            </div>

                            <h3 className="mt-5 text-lg font-semibold text-white">
                                {search.trim()
                                    ? 'No matching projects'
                                    : 'Your workspace is waiting'}
                            </h3>

                            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                                {search.trim()
                                    ? `We couldn't find any project matching "${search.trim()}". Try another search term.`
                                    : 'Create your first project and start organizing your team’s work.'}
                            </p>

                            {search.trim() ? (
                                <button
                                    onClick={() => setSearch('')}
                                    className="mt-5 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-indigo-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/10"
                                >
                                    Clear Search
                                </button>
                            ) : (
                                <button
                                    onClick={openCreateModal}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
                                >
                                    <Plus size={18} />
                                    Create Your First Project
                                    <ArrowUpRight size={16} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Project Cards */}
                    {!loading && !error && filteredProjects.length > 0 && (
                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {filteredProjects.map((project, index) => (
                                <article
                                    key={project._id}
                                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 transition duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-950/20"
                                >
                                    {/* Accent */}
                                    <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 opacity-70 transition group-hover:opacity-100" />

                                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                                                <FolderKanban
                                                    size={22}
                                                    className="text-indigo-400"
                                                />
                                            </div>

                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                Active
                                            </span>
                                        </div>

                                        {/* Project Info */}
                                        <div className="mt-5">
                                            <h3 className="h-14 overflow-hidden break-words text-lg font-semibold leading-7 text-white transition group-hover:text-indigo-300 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                                                {project.title}
                                            </h3>

                                            <p className="mt-2 h-[72px] overflow-hidden break-words text-sm leading-6 text-slate-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                                                {project.description || 'No description provided.'}
                                            </p>

                                            {project.description?.trim() && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedProject(project)
                                                        setShowDescriptionModal(true)
                                                    }}
                                                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 transition hover:text-indigo-300"
                                                >
                                                    Read full description
                                                    <ArrowUpRight size={13} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Metadata */}
                                        <div className="mt-auto pt-5 grid grid-cols-2 gap-3">                                            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Users size={14} />
                                                Team
                                            </div>

                                            <p className="mt-2 text-sm font-semibold text-slate-200">
                                                {project.teamMembers?.length || 0}{' '}
                                                <span className="font-normal text-slate-500">
                                                    members
                                                </span>
                                            </p>
                                        </div>

                                            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <CalendarDays size={14} />
                                                    Created
                                                </div>

                                                <p className="mt-2 text-sm font-semibold text-slate-200">
                                                    {formatDate(project.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-5 flex gap-3 border-t border-slate-800 pt-4">
                                            <button
                                                onClick={() => openEditModal(project)}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300"
                                            >
                                                <Pencil size={15} />
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => openDeleteModal(project)}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                                            >
                                                <Trash2 size={15} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Create / Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/40 sm:p-8">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                                    <FolderKanban
                                        size={20}
                                        className="text-indigo-400"
                                    />
                                </div>

                                <h2 className="text-xl font-bold">
                                    {selectedProject
                                        ? 'Edit Project'
                                        : 'Create New Project'}
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    {selectedProject
                                        ? 'Update your project details.'
                                        : 'Add a new project to your workspace.'}
                                </p>
                            </div>

                            <button
                                onClick={() => setShowCreateModal(false)}
                                disabled={creating}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleCreateProject}
                            className="mt-6 space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="title"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Project Title
                                </label>

                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    placeholder="e.g. Bug Tracking & Issue Management"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    maxLength={100}
                                    required
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="description"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Project Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe what this project is about..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    maxLength={1000}
                                    required
                                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                />
                            </div>

                            {createError && (
                                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                    <CircleAlert size={18} />
                                    {createError}
                                </div>
                            )}

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={creating}
                                    className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {creating && (
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                    )}

                                    {creating
                                        ? 'Please wait...'
                                        : selectedProject
                                            ? 'Save Changes'
                                            : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
                    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/40 sm:p-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                            <Trash2 size={22} className="text-red-400" />
                        </div>

                        <h2 className="mt-5 text-xl font-bold">
                            Delete Project?
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-white">
                                {selectedProject.title}
                            </span>
                            ? This action cannot be undone.
                        </p>

                        {createError && (
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                <CircleAlert size={16} />
                                {createError}
                            </div>
                        )}

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setSelectedProject(null)
                                    setCreateError('')
                                }}
                                disabled={creating}
                                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDeleteProject}
                                disabled={creating}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {creating && (
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                )}

                                {creating ? 'Deleting...' : 'Delete Project'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Description Modal */}
            {showDescriptionModal && selectedProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                                    <FolderKanban
                                        size={20}
                                        className="text-indigo-400"
                                    />
                                </div>

                                <h2 className="text-xl font-bold text-white">
                                    {selectedProject.title}
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    Full project description
                                </p>
                            </div>

                            <button
                                onClick={() => setShowDescriptionModal(false)}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-6 max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                                {selectedProject.description || 'No description provided.'}
                            </p>
                        </div>

                        <button
                            onClick={() => setShowDescriptionModal(false)}
                            className="mt-5 w-full rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Projects