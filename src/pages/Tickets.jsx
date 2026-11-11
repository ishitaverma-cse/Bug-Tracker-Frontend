import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft,
    ArrowRight,
    Plus,
    Ticket,
    Search,
    CalendarDays,
    Clock3,
    CircleAlert,
    CheckCircle2,
    Loader2,
    X,
    Bug,
    Layers3,
    UserRound,
    Pencil,
    Trash2,
} from 'lucide-react'

const API_URL = 'http://localhost:5000/api/tickets'
const PROJECT_API_URL = 'http://localhost:5000/api/projects'

function Tickets() {
    const { projectId } = useParams()
    const navigate = useNavigate()

    const [project, setProject] = useState(null)
    const [tickets, setTickets] = useState([])
    const [assignees, setAssignees] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const ticketsPerPage = 6

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // Edit Ticket State
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingTicket, setEditingTicket] = useState(null)
    const [updating, setUpdating] = useState(false)
    const [editError, setEditError] = useState('')

    // Delete Ticket State
    const [ticketToDelete, setTicketToDelete] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        assignee: '',
    })

    // Fetch Project and Tickets
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError('')

                const token = localStorage.getItem('resolveon-token')

                const headers = {
                    Authorization: `Bearer ${token}`,
                }

                const [projectResponse, ticketResponse] = await Promise.all([
                    fetch(PROJECT_API_URL, { headers }),
                    fetch(`${API_URL}/project/${projectId}`, { headers }),
                ])

                const projectData = await projectResponse.json()
                const ticketData = await ticketResponse.json()

                if (!projectResponse.ok) {
                    throw new Error(
                        projectData.message || 'Failed to fetch projects'
                    )
                }

                if (!ticketResponse.ok) {
                    throw new Error(
                        ticketData.message || 'Failed to fetch tickets'
                    )
                }

                const currentProject = (projectData.projects || []).find(
                    (item) => item._id === projectId
                )

                if (!currentProject) {
                    throw new Error('Project not found')
                }

                setProject(currentProject)
                setTickets(ticketData.tickets || [])

                // Project owner + team members
                const members = [
                    currentProject.owner,
                    ...(currentProject.teamMembers || []),
                ].filter(Boolean)

                // Remove duplicate users
                const uniqueMembers = members.filter(
                    (member, index, array) =>
                        array.findIndex(
                            (item) => item._id === member._id
                        ) === index
                )

                setAssignees(uniqueMembers)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [projectId])

    // Format Date
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

    // Format Relative Date
    const formatRelativeDate = (date) => {
        if (!date) return 'Date unavailable'

        const parsedDate = new Date(date)

        if (Number.isNaN(parsedDate.getTime())) {
            return 'Date unavailable'
        }

        const today = new Date()

        // Normalize dates to local calendar days
        const todayDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        )

        const createdDate = new Date(
            parsedDate.getFullYear(),
            parsedDate.getMonth(),
            parsedDate.getDate()
        )

        const diffInDays = Math.round(
            (todayDate - createdDate) / (1000 * 60 * 60 * 24)
        )

        if (diffInDays === 0) return 'Today'
        if (diffInDays === 1) return 'Yesterday'
        if (diffInDays === 2) return '2 days ago'

        if (diffInDays > 2 && diffInDays < 7) {
            return `${diffInDays} days ago`
        }

        return formatDate(date)
    }

    // Priority Styles
    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'High':
                return 'border-rose-500/20 bg-rose-500/10 text-rose-300'

            case 'Medium':
                return 'border-amber-500/20 bg-amber-500/10 text-amber-300'

            case 'Low':
                return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'

            default:
                return 'border-slate-700 bg-slate-800 text-slate-300'
        }
    }

    // Status Styles
    const getStatusStyles = (status) => {
        switch (status) {
            case 'Open':
                return 'border-sky-500/20 bg-sky-500/10 text-sky-300'

            case 'In Progress':
                return 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300'

            case 'Resolved':
                return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'

            case 'Closed':
                return 'border-slate-700 bg-slate-800 text-slate-400'

            default:
                return 'border-slate-700 bg-slate-800 text-slate-300'
        }
    }

    // Open Create Modal
    const openCreateModal = () => {
        setFormData({
            title: '',
            description: '',
            priority: 'Medium',
            assignee: '',
        })

        setCreateError('')
        setShowCreateModal(true)
    }

    // Handle Input Changes
    const handleInputChange = (e) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // Create Ticket
    const handleCreateTicket = async (e) => {
        e.preventDefault()

        setCreateError('')
        setSuccessMessage('')

        const title = formData.title.trim()
        const description = formData.description.trim()

        if (!title || !description) {
            setCreateError('Please fill in all required fields.')
            return
        }

        try {
            setCreating(true)

            const token = localStorage.getItem('resolveon-token')

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    priority: formData.priority,
                    assignee: formData.assignee || null,
                    projectId,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create ticket')
            }

            setTickets((prev) => [data.ticket, ...prev])
            setCurrentPage(1)

            setShowCreateModal(false)

            setFormData({
                title: '',
                description: '',
                priority: 'Medium',
                assignee: '',
            })

            setSuccessMessage('Ticket created successfully!')
        } catch (err) {
            setCreateError(err.message)
        } finally {
            setCreating(false)
        }
    }

    // Open Edit Ticket Modal
    const openEditModal = (ticket) => {
        setEditingTicket(ticket)

        setFormData({
            title: ticket.title || '',
            description: ticket.description || '',
            priority: ticket.priority || 'Medium',
            status: ticket.status || 'Open',
            assignee: ticket.assignee?._id || '',
        })

        setEditError('')
        setShowEditModal(true)
    }

    // Update Ticket
    const handleUpdateTicket = async (e) => {
        e.preventDefault()

        setEditError('')
        setSuccessMessage('')

        const title = formData.title.trim()
        const description = formData.description.trim()

        if (!title || !description) {
            setEditError('Please fill in all required fields.')
            return
        }

        try {
            setUpdating(true)

            const token = localStorage.getItem('resolveon-token')

            const response = await fetch(
                `${API_URL}/${editingTicket._id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        priority: formData.priority,
                        status: formData.status,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update ticket')
            }

            const updatedTicket = data.ticket

            setTickets((prev) =>
                prev.map((ticket) =>
                    ticket._id === updatedTicket._id
                        ? updatedTicket
                        : ticket
                )
            )

            setShowEditModal(false)
            setEditingTicket(null)

            setSuccessMessage('Ticket updated successfully!')
        } catch (err) {
            setEditError(err.message)
        } finally {
            setUpdating(false)
        }
    }

    // Open Delete Confirmation Modal
    const openDeleteModal = (ticket) => {
        setTicketToDelete(ticket)
        setDeleteError('')
    }

    // Delete Ticket
    const handleDeleteTicket = async () => {
        if (!ticketToDelete) return

        setDeleteError('')
        setSuccessMessage('')

        try {
            setDeleting(true)

            const token = localStorage.getItem('resolveon-token')

            const response = await fetch(
                `${API_URL}/${ticketToDelete._id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete ticket')
            }

            setTickets((prev) =>
                prev.filter(
                    (ticket) => ticket._id !== ticketToDelete._id
                )
            )

            setTicketToDelete(null)

            setSuccessMessage('Ticket deleted successfully!')
        } catch (err) {
            setDeleteError(err.message)
        } finally {
            setDeleting(false)
        }
    }

    // Search Tickets
    const filteredTickets = tickets.filter((ticket) => {
        const searchTerm = search.trim().toLowerCase()

        return (
            ticket.title.toLowerCase().includes(searchTerm) ||
            ticket.description.toLowerCase().includes(searchTerm)
        )
    })

    // Pagination Calculations
    const totalPages = Math.ceil(
        filteredTickets.length / ticketsPerPage
    )

    const startIndex = (currentPage - 1) * ticketsPerPage

    const currentTickets = filteredTickets.slice(
        startIndex,
        startIndex + ticketsPerPage
    )

    const startTicket = filteredTickets.length === 0
        ? 0
        : startIndex + 1

    const endTicket = Math.min(
        startIndex + ticketsPerPage,
        filteredTickets.length
    )


    // Overview Metrics
    const totalTickets = tickets.length

    const openTickets = tickets.filter(
        (ticket) => ticket.status === 'Open'
    ).length

    const inProgressTickets = tickets.filter(
        (ticket) => ticket.status === 'In Progress'
    ).length

    const resolvedTickets = tickets.filter(
        (ticket) =>
            ticket.status === 'Resolved' || ticket.status === 'Closed'
    ).length

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/projects')}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
                >
                    <ArrowLeft size={17} />
                    Back to Projects
                </button>

                {/* Page Header */}
                <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                            <Ticket size={14} />
                            Ticket Management
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            {project?.title || 'Project Tickets'}
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                            Track issues, manage priorities, and keep your
                            project moving forward.
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

                {/* Error Feedback */}
                {error && (
                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                        <CircleAlert size={18} />
                        {error}
                    </div>
                )}

                {/* Overview Metrics */}
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {/* Total Tickets */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-400">
                                Total Tickets
                            </p>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                                <Ticket size={19} />
                            </div>
                        </div>

                        <h2 className="mt-4 text-3xl font-bold">
                            {totalTickets}
                        </h2>

                        <p className="mt-2 text-xs text-slate-500">
                            All project tickets
                        </p>
                    </div>

                    {/* Open Tickets */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-400">
                                Open Tickets
                            </p>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                                <CircleAlert size={19} />
                            </div>
                        </div>

                        <h2 className="mt-4 text-3xl font-bold">
                            {openTickets}
                        </h2>

                        <p className="mt-2 text-xs text-slate-500">
                            Waiting to be started
                        </p>
                    </div>

                    {/* In Progress */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-400">
                                In Progress
                            </p>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                                <Clock3 size={19} />
                            </div>
                        </div>

                        <h2 className="mt-4 text-3xl font-bold">
                            {inProgressTickets}
                        </h2>

                        <p className="mt-2 text-xs text-slate-500">
                            Currently being worked on
                        </p>
                    </div>

                    {/* Resolved */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-400">
                                Resolved
                            </p>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                                <CheckCircle2 size={19} />
                            </div>
                        </div>

                        <h2 className="mt-4 text-3xl font-bold">
                            {resolvedTickets}
                        </h2>

                        <p className="mt-2 text-xs text-slate-500">
                            Resolved or closed tickets
                        </p>
                    </div>
                </div>

                {/* Ticket List Section */}
                <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">

                    {/* Section Header */}
                    <div className="flex flex-col gap-5 border-b border-slate-800/80 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                                    <Ticket size={20} />
                                </div>

                                <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                                    Project Tickets
                                </h2>

                                {/* Ticket Count */}
                                <div className="inline-flex items-center rounded-full border border-slate-700/70 bg-slate-800/50 px-3 py-1 text-xs font-medium text-slate-300">
                                    {filteredTickets.length}{' '}
                                    {filteredTickets.length === 1
                                        ? 'ticket'
                                        : 'tickets'}{' '}
                                    found
                                </div>
                            </div>

                            <p className="mt-3 pl-1 text-sm leading-6 text-slate-400">
                                Manage and track issues across your project
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:max-w-xs">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setCurrentPage(1)
                                }}
                                placeholder="Search tickets..."
                                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
                            />
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2
                                size={30}
                                className="animate-spin text-indigo-400"
                            />

                            <p className="mt-4 text-sm text-slate-400">
                                Loading tickets...
                            </p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && filteredTickets.length === 0 && (
                        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                                <Bug size={28} />
                            </div>

                            <h3 className="mt-5 text-lg font-semibold">
                                {search
                                    ? 'No matching tickets'
                                    : 'No tickets yet'}
                            </h3>

                            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                                {search
                                    ? 'Try searching with a different keyword.'
                                    : 'Create your first ticket to start tracking issues in this project.'}
                            </p>

                            {!search && (
                                <button
                                    onClick={openCreateModal}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
                                >
                                    <Plus size={16} />
                                    Create First Ticket
                                </button>
                            )}
                        </div>
                    )}

                    {/* Ticket Cards */}
                    {!loading && filteredTickets.length > 0 && (
                        <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-2">
                            {currentTickets.map((ticket) => (
                                <div
                                    key={ticket._id}
                                    className={`group rounded-2xl border border-slate-800/80
                                                bg-slate-900/70 p-5 transition-all duration-200
                                                hover:border-indigo-500/30 hover:bg-slate-900
                                                sm:p-6 ${ticket.priority === 'High'
                                            ? 'border-l-[3px] border-l-rose-500'
                                            : ticket.priority === 'Medium'
                                                ? 'border-l-[3px] border-l-amber-500'
                                                : 'border-l-[3px] border-l-emerald-500'
                                        }`}
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                                        {/* Ticket Details */}
                                        <div className="min-w-0 flex-1">

                                            {/* Ticket Priority and Status */}
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                {/* Priority Badge */}
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityStyles(ticket.priority)}`}
                                                >
                                                    {ticket.priority} Priority
                                                </span>

                                                {/* Status Badge */}
                                                <span
                                                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(ticket.status)}`}
                                                >
                                                    {ticket.status}
                                                </span>
                                            </div>


                                            <h3 className="mt-3 text-base font-semibold text-white">
                                                {ticket.title}
                                            </h3>

                                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                                                {ticket.description}
                                            </p>

                                            {/* Ticket Metadata */}
                                            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-500">

                                                {/* Assignee */}
                                                <div className="inline-flex items-center gap-2">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                                                        {ticket.assignee?.name
                                                            ? ticket.assignee.name
                                                                .charAt(0)
                                                                .toUpperCase()
                                                            : <UserRound size={14} />
                                                        }
                                                    </div>

                                                    <span>
                                                        {ticket.assignee?.name ||
                                                            'Unassigned'}
                                                    </span>
                                                </div>

                                                {/* Created Date */}
                                                <div className="inline-flex items-center gap-1.5">
                                                    <CalendarDays size={14} />

                                                    <span>
                                                        Created {formatDate(ticket.createdAt)}
                                                    </span>
                                                </div>

                                                {/* Relative Date */}
                                                <div className="inline-flex items-center gap-1.5">
                                                    <Clock3 size={14} />

                                                    <span>
                                                        {formatRelativeDate(ticket.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ticket Actions */}
                                        <div className="flex shrink-0 items-center gap-2 lg:justify-end">
                                            {/* Edit Button */}
                                            <button
                                                onClick={() => openEditModal(ticket)}
                                                title="Edit Ticket"
                                                aria-label={`Edit ${ticket.title}`}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/20 hover:text-indigo-200"
                                            >
                                                <Pencil size={17} />
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => openDeleteModal(ticket)}
                                                title="Delete Ticket"
                                                aria-label={`Delete ${ticket.title}`}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 transition hover:border-rose-500/40 hover:bg-rose-500/20 hover:text-rose-200"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && !error && filteredTickets.length > 0 && totalPages > 1 && (
                        <div className="flex flex-col items-center gap-4 border-t border-slate-800/80 px-5 py-5">

                            {/* Results Info */}
                            <p className="text-sm text-slate-400">
                                Showing{" "}
                                <span className="font-semibold text-white">
                                    {startTicket}-{endTicket}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-white">
                                    {filteredTickets.length}
                                </span>{" "}
                                tickets
                            </p>

                            {/* Pagination Controls */}
                            <div className="flex flex-wrap items-center justify-center gap-2">

                                {/* Previous Arrow */}
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                                    }
                                    disabled={currentPage === 1}
                                    aria-label="Previous page"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-300 transition hover:border-indigo-500/40 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ArrowLeft size={18} />
                                </button>

                                {/* Page Numbers */}
                                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                                    (page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition ${currentPage === page
                                                ? "border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                                : "border-slate-800 bg-slate-950 text-slate-400 hover:border-indigo-500/40 hover:bg-slate-800 hover:text-white"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}

                                {/* Next Arrow */}
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, totalPages)
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    aria-label="Next page"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-300 transition hover:border-indigo-500/40 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ArrowRight size={18} />
                                </button>
                            </div>

                        </div>
                    )}

                </section>
            </div>

            {/* Create Ticket Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md">
                    <div className="my-auto w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

                        {/* Modal Header */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                                    <Ticket size={21} />
                                </div>

                                <h2 className="text-xl font-bold">
                                    Create New Ticket
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    Add an issue to {project?.title || 'this project'}.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowCreateModal(false)}
                                disabled={creating}
                                className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-400 transition hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Create Form */}
                        <form
                            onSubmit={handleCreateTicket}
                            className="mt-6 space-y-5"
                        >

                            {/* Title */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Ticket Title <span className="text-rose-400">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Fix login validation bug"
                                    maxLength={100}
                                    required
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Description <span className="text-rose-400">*</span>
                                </label>

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe the issue or task..."
                                    rows={4}
                                    maxLength={2000}
                                    required
                                    className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50"
                                />
                            </div>

                            {/* Priority + Assignee */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                {/* Priority */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Priority
                                    </label>

                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>

                                {/* Assignee */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Assignee
                                    </label>

                                    <select
                                        name="assignee"
                                        value={formData.assignee}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50"
                                    >
                                        <option value="">
                                            Unassigned
                                        </option>

                                        {assignees.map((member) => (
                                            <option
                                                key={member._id}
                                                value={member._id}
                                            >
                                                {member.name} ({member.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Project Info */}
                            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                                <Layers3
                                    size={17}
                                    className="text-indigo-300"
                                />

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Project
                                    </p>

                                    <p className="mt-0.5 text-sm font-medium text-slate-300">
                                        {project?.title || 'Loading project...'}
                                    </p>
                                </div>
                            </div>

                            {/* Form Error */}
                            {createError && (
                                <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                                    <CircleAlert size={17} />
                                    {createError}
                                </div>
                            )}

                            {/* Modal Actions */}
                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={creating}
                                    className="rounded-xl border border-slate-800 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {creating && (
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                    )}

                                    {creating
                                        ? 'Creating Ticket...'
                                        : 'Create Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Ticket Modal */}
            {showEditModal && editingTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md">
                    <div className="my-auto w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

                        {/* Modal Header */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                                    <Pencil size={21} />
                                </div>

                                <h2 className="text-xl font-bold">
                                    Edit Ticket
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    Update the details of this ticket.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowEditModal(false)
                                    setEditingTicket(null)
                                }}
                                disabled={updating}
                                className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-400 transition hover:text-white disabled:opacity-50"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Edit Form */}
                        <form
                            onSubmit={handleUpdateTicket}
                            className="mt-6 space-y-5"
                        >
                            {/* Title */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Ticket Title <span className="text-rose-400">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    maxLength={100}
                                    required
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Description <span className="text-rose-400">*</span>
                                </label>

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    maxLength={2000}
                                    required
                                    className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-indigo-500/50"
                                />
                            </div>

                            {/* Priority + Status */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                {/* Priority */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Priority
                                    </label>

                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={formData.status || 'Open'}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50"
                                    >
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Edit Error */}
                            {editError && (
                                <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                                    <CircleAlert size={17} />
                                    {editError}
                                </div>
                            )}

                            {/* Modal Actions */}
                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false)
                                        setEditingTicket(null)
                                    }}
                                    disabled={updating}
                                    className="rounded-xl border border-slate-800 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {updating && (
                                        <Loader2 size={17} className="animate-spin" />
                                    )}

                                    {updating ? 'Saving Changes...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Ticket Confirmation Modal */}
            {ticketToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
                    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

                        {/* Modal Icon */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300">
                            <Trash2 size={22} />
                        </div>

                        {/* Modal Content */}
                        <h2 className="mt-5 text-xl font-bold text-white">
                            Delete Ticket?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-white">
                                "{ticketToDelete.title}"
                            </span>
                            ? This action cannot be undone.
                        </p>

                        {/* Delete Error */}
                        {deleteError && (
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                                <CircleAlert size={17} />
                                {deleteError}
                            </div>
                        )}

                        {/* Modal Actions */}
                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setTicketToDelete(null)}
                                disabled={deleting}
                                className="rounded-xl border border-slate-800 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteTicket}
                                disabled={deleting}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleting && (
                                    <Loader2 size={17} className="animate-spin" />
                                )}

                                {deleting ? 'Deleting Ticket...' : 'Delete Ticket'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Tickets
