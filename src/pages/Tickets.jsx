import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
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
    LayoutGrid,
    List,
    GripVertical,
    ChevronLeft,
    ChevronRight,
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
    const [viewMode, setViewMode] = useState('board')

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
        status: 'Open',
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
    const openCreateModal = (status = 'Open') => {
        setFormData({
            title: '',
            description: '',
            priority: 'Medium',
            status: status,
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
                    priority: formData.priority || 'Medium',
                    status: formData.status || 'Open',
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

    // Kanban Drag-and-Drop: persist status changes through the existing API
    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result

        if (!destination) return

        if (destination.droppableId === source.droppableId) return

        const nextStatus = destination.droppableId

        const validStatuses = [
            'Open',
            'In Progress',
            'Resolved',
        ]

        if (!validStatuses.includes(nextStatus)) return

        const ticket = tickets.find(
            (item) => item._id === draggableId
        )

        if (!ticket || ticket.status === nextStatus) return

        const previousStatus = ticket.status

        // Optimistic UI update
        setTickets((prev) =>
            prev.map((item) =>
                item._id === draggableId
                    ? { ...item, status: nextStatus }
                    : item
            )
        )

        setSuccessMessage('')
        setError('')

        try {
            const token = localStorage.getItem('resolveon-token')

            const response = await fetch(`${API_URL}/${draggableId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: ticket.title,
                    description: ticket.description,
                    priority: ticket.priority,
                    status: nextStatus,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to update ticket status'
                )
            }

            if (data.ticket) {
                setTickets((prev) =>
                    prev.map((item) =>
                        item._id === draggableId
                            ? data.ticket
                            : item
                    )
                )
            }

            setSuccessMessage(`Ticket moved to ${nextStatus}.`)
        } catch (err) {
            setTickets((prev) =>
                prev.map((item) =>
                    item._id === draggableId
                        ? { ...item, status: previousStatus }
                        : item
                )
            )

            setError(
                err.message ||
                'Could not update ticket status. Please try again.'
            )
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

    // Kanban Columns
    const kanbanColumns = [
        {
            id: 'Open',
            title: 'Open',
            status: 'Open',
            accent: 'sky',
            tickets: filteredTickets.filter(
                (ticket) => ticket.status === 'Open'
            ),
        },
        {
            id: 'In Progress',
            title: 'In Progress',
            status: 'In Progress',
            accent: 'indigo',
            tickets: filteredTickets.filter(
                (ticket) => ticket.status === 'In Progress'
            ),
        },
        {
            id: 'Resolved',
            title: 'Resolved',
            status: 'Resolved',
            accent: 'emerald',
            tickets: filteredTickets.filter(
                (ticket) =>
                    ticket.status === 'Resolved' ||
                    ticket.status === 'Closed'
            ),
        },
    ]

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
                        <span className="whitespace-nowrap">Create Ticket</span>
                    </button>
                </header>

                {/* Success Feedback */}
                {successMessage && (
                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                        <CheckCircle2 size={18} />

                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Error Feedback */}
                {error && (
                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                        <CircleAlert size={18} />
                        <span>{error}</span>
                        <button
                            onClick={() => setError('')}
                            className="ml-auto text-rose-300 transition hover:text-white"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                {/* Overview Metrics */}
                <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-400">Total Tickets</p>
                            <Ticket size={18} className="text-indigo-400" />
                        </div>
                        <h3 className="mt-3 text-3xl font-bold">{totalTickets}</h3>
                        <p className="mt-1 text-xs text-slate-500">All project issues</p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-400">Open</p>
                            <CircleAlert size={18} className="text-sky-400" />
                        </div>
                        <h3 className="mt-3 text-3xl font-bold">{openTickets}</h3>
                        <p className="mt-1 text-xs text-slate-500">Awaiting action</p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-400">In Progress</p>
                            <Clock3 size={18} className="text-indigo-400" />
                        </div>
                        <h3 className="mt-3 text-3xl font-bold">{inProgressTickets}</h3>
                        <p className="mt-1 text-xs text-slate-500">Currently being worked on</p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-400">Completed</p>
                            <CheckCircle2 size={18} className="text-emerald-400" />
                        </div>
                        <h3 className="mt-3 text-3xl font-bold">{resolvedTickets}</h3>
                        <p className="mt-1 text-xs text-slate-500">Resolved or closed</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-md">
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
                            placeholder="Search tickets by title or description..."
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('board')}
                            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${viewMode === 'board'
                                ? 'bg-indigo-500 text-white'
                                : 'border border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                                }`}
                        >
                            <LayoutGrid size={16} />
                            Board
                        </button>

                        <button
                            onClick={() => setViewMode('list')}
                            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${viewMode === 'list'
                                ? 'bg-indigo-500 text-white'
                                : 'border border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                                }`}
                        >
                            <List size={16} />
                            List
                        </button>
                    </div>
                </div>

                {/* Kanban Board */}
                {viewMode === 'board' && (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className="mt-6 grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {kanbanColumns.map((column) => (
                                <div
                                    key={column.id}
                                    className="min-w-0 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3"
                                >
                                    <div className="mb-3 flex items-center justify-between px-1">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`h-2.5 w-2.5 rounded-full ${column.accent === 'sky'
                                                    ? 'bg-sky-400'
                                                    : column.accent === 'indigo'
                                                        ? 'bg-indigo-400'
                                                        : column.accent === 'slate'
                                                            ? 'bg-slate-400'
                                                            : 'bg-emerald-400'
                                                    }`}
                                            />

                                            <h3 className="font-semibold text-white">
                                                {column.title}
                                            </h3>

                                            <span className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
                                                {column.tickets.length}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => openCreateModal(column.status)}
                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                                            title={`Create ${column.status} ticket`}
                                        >
                                            <Plus size={17} />
                                        </button>
                                    </div>

                                    <Droppable droppableId={column.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`space-y-3 rounded-xl transition ${snapshot.isDraggingOver
                                                    ? 'bg-indigo-500/5'
                                                    : ''
                                                    }`}
                                            >
                                                {column.tickets.map((ticket, index) => (
                                                    <Draggable
                                                        key={ticket._id}
                                                        draggableId={ticket._id}
                                                        index={index}
                                                    >
                                                        {(dragProvided, dragSnapshot) => (
                                                            <div
                                                                ref={dragProvided.innerRef}
                                                                {...dragProvided.draggableProps}
                                                                className={`rounded-xl border border-slate-800 bg-slate-950 p-4 transition ${dragSnapshot.isDragging
                                                                    ? 'rotate-1 border-indigo-500 shadow-xl shadow-indigo-500/10'
                                                                    : 'hover:border-slate-700'
                                                                    }`}
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <div className="mb-2 flex items-center gap-2">
                                                                            <Bug
                                                                                size={14}
                                                                                className="shrink-0 text-indigo-400"
                                                                            />
                                                                            <span className="truncate text-[11px] font-medium text-slate-500">
                                                                                #{ticket._id.slice(-6).toUpperCase()}
                                                                            </span>
                                                                        </div>

                                                                        <h4 className="break-words text-sm font-semibold leading-5 text-white">
                                                                            {ticket.title}
                                                                        </h4>
                                                                    </div>

                                                                    <button
                                                                        {...dragProvided.dragHandleProps}
                                                                        className="shrink-0 cursor-grab rounded-md p-1 text-slate-600 transition hover:text-slate-300 active:cursor-grabbing"
                                                                        title="Drag ticket"
                                                                    >
                                                                        <GripVertical size={17} />
                                                                    </button>
                                                                </div>

                                                                <p
                                                                    title={ticket.description || 'No description provided'}
                                                                    className="mt-2 line-clamp-2 min-h-[40px] text-xs leading-5 text-slate-400"
                                                                >
                                                                    {ticket.description || 'No description provided'}
                                                                </p>

                                                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                                                    <span
                                                                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium ${getPriorityStyles(ticket.priority)}`}
                                                                    >
                                                                        {ticket.priority} Priority
                                                                    </span>

                                                                    <span
                                                                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium ${getStatusStyles(ticket.status)}`}
                                                                    >
                                                                        {ticket.status}
                                                                    </span>
                                                                </div>

                                                                <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                                                                    <div className="flex min-w-0 items-center gap-2">
                                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-300">
                                                                            <UserRound size={14} />
                                                                        </div>

                                                                        <span className="truncate text-xs text-slate-400">
                                                                            {ticket.assignee?.name || 'Unassigned'}
                                                                        </span>
                                                                    </div>

                                                                    <span className="flex shrink-0 items-center gap-1 text-[11px] text-slate-500">
                                                                        <CalendarDays size={12} />
                                                                        {formatRelativeDate(ticket.createdAt)}
                                                                    </span>
                                                                </div>

                                                                {/* Ticket Actions */}
                                                                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3">
                                                                    <button
                                                                        onClick={() => openEditModal(ticket)}
                                                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-2.5 text-xs font-semibold text-indigo-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/20"
                                                                    >
                                                                        <Pencil size={14} />
                                                                        Edit
                                                                    </button>

                                                                    <button
                                                                        onClick={() => openDeleteModal(ticket)}
                                                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs font-semibold text-rose-300 transition hover:border-rose-500/40 hover:bg-rose-500/20"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}

                                                {provided.placeholder}

                                                {column.tickets.length === 0 && (
                                                    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 px-4 text-center">
                                                        <Layers3
                                                            size={24}
                                                            className="mb-3 text-slate-700"
                                                        />
                                                        <p className="text-xs font-medium text-slate-500">
                                                            No tickets here
                                                        </p>
                                                        <p className="mt-1 text-[11px] text-slate-600">
                                                            Drag tickets into this column
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}
                        </div>
                    </DragDropContext>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-slate-900">
                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Ticket
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Priority
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Assignee
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Created
                                        </th>
                                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentTickets.map((ticket) => (
                                        <tr
                                            key={ticket._id}
                                            className="border-b border-slate-800/70 transition hover:bg-slate-900"
                                        >
                                            <td className="max-w-md px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                                                        <Bug size={16} />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="break-words text-sm font-semibold text-white">
                                                            {ticket.title}
                                                        </p>
                                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                                            {ticket.description}
                                                        </p>
                                                        <p className="mt-2 text-[11px] text-slate-600">
                                                            #{ticket._id.slice(-6).toUpperCase()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium ${getPriorityStyles(ticket.priority)}`}
                                                >
                                                    {ticket.priority}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium ${getStatusStyles(ticket.status)}`}
                                                >
                                                    {ticket.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-300">
                                                        <UserRound size={14} />
                                                    </div>
                                                    <span className="text-sm text-slate-400">
                                                        {ticket.assignee?.name || 'Unassigned'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="text-xs text-slate-400">
                                                    {formatRelativeDate(ticket.createdAt)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEditModal(ticket)}
                                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-500/10 hover:text-indigo-300"
                                                        title="Edit ticket"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>

                                                    <button
                                                        onClick={() => openDeleteModal(ticket)}
                                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300"
                                                        title="Delete ticket"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {filteredTickets.length === 0 && (
                            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                                    <Ticket size={28} className="text-slate-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-white">
                                    No tickets found
                                </h3>
                                <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                                    Try adjusting your search or create a new ticket to get started.
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {filteredTickets.length > ticketsPerPage && (
                            <div className="flex flex-col items-center gap-3 border-t border-slate-800 px-5 py-4">

                                {/* Ticket Count */}
                                <p className="text-xs text-slate-500">
                                    Showing{' '}
                                    <span className="font-medium text-slate-300">
                                        {startTicket}-{endTicket}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-slate-300">
                                        {filteredTickets.length}
                                    </span>{' '}
                                    tickets
                                </p>

                                {/* Pagination Controls */}
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                                        }
                                        disabled={currentPage === 1}
                                        className="inline-flex items-center justify-center rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-400 transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-40"
                                        title="Previous page"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    <span className="rounded-lg bg-indigo-500/10 px-3.5 py-2.5 text-xs font-semibold text-indigo-300">
                                        {currentPage} / {totalPages}
                                    </span>

                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.min(prev + 1, totalPages)
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                        className="inline-flex items-center justify-center rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-400 transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-40"
                                        title="Next page"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Create Ticket Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
                        <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                                <div>
                                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                                        <Plus size={14} />
                                        New Ticket
                                    </div>
                                    <h2 className="text-xl font-bold text-white">
                                        Create Ticket
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Add a new issue to this project.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTicket} className="space-y-5 px-6 py-6">
                                {createError && (
                                    <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
                                        <CircleAlert size={16} />
                                        {createError}
                                    </div>
                                )}

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
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Description <span className="text-rose-400">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe the issue in detail..."
                                        rows={4}
                                        required
                                        maxLength={1000}
                                        className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            Priority
                                        </label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            Status
                                        </label>

                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            Assignee
                                        </label>
                                        <select
                                            name="assignee"
                                            value={formData.assignee}
                                            onChange={handleInputChange}
                                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                                        >
                                            <option value="">Unassigned</option>
                                            {assignees.map((member) => (
                                                <option key={member._id} value={member._id}>
                                                    {member.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="rounded-xl border border-slate-800 bg-slate-950 px-5 py-3 text-sm font-medium text-slate-400 transition hover:text-white"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {creating ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={16} />
                                                Create Ticket
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Ticket Modal */}
                {showEditModal && editingTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
                        <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                                <div>
                                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                                        <Pencil size={14} />
                                        Edit Ticket
                                    </div>

                                    <h2 className="text-xl font-bold text-white">
                                        Update Ticket
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Modify the issue details and status.
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowEditModal(false)
                                        setEditingTicket(null)
                                    }}
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateTicket} className="space-y-5 px-6 py-6">
                                {editError && (
                                    <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
                                        <CircleAlert size={16} />
                                        {editError}
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Ticket Title <span className="text-rose-400">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter ticket title"
                                        maxLength={100}
                                        required
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Description <span className="text-rose-400">*</span>
                                    </label>

                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe the issue..."
                                        rows={4}
                                        maxLength={1000}
                                        required
                                        className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            Priority
                                        </label>

                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            Status
                                        </label>

                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false)
                                            setEditingTicket(null)
                                        }}
                                        className="rounded-xl border border-slate-800 bg-slate-950 px-5 py-3 text-sm font-medium text-slate-400 transition hover:text-white"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {updating ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={16} />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Ticket Confirmation Modal */}
                {ticketToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
                        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
                            <div className="p-6">
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
                                    <Trash2 size={25} />
                                </div>

                                <h2 className="text-xl font-bold text-white">
                                    Delete Ticket?
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-slate-400">
                                    Are you sure you want to delete{' '}
                                    <span className="font-semibold text-white">
                                        "{ticketToDelete.title}"
                                    </span>
                                    ? This action cannot be undone.
                                </p>

                                {deleteError && (
                                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
                                        <CircleAlert size={16} />
                                        {deleteError}
                                    </div>
                                )}

                                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setTicketToDelete(null)}
                                        disabled={deleting}
                                        className="rounded-xl border border-slate-800 bg-slate-950 px-5 py-3 text-sm font-medium text-slate-400 transition hover:text-white disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDeleteTicket}
                                        disabled={deleting}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {deleting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 size={16} />
                                                Delete Ticket
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Tickets
