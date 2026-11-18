
# Resolveon — Frontend

A modern, responsive bug tracking and project management platform built with React. Resolveon provides a centralized workspace for managing projects, tracking tickets, collaborating with team members, and monitoring issue progress through an interactive dashboard and Kanban workflow.

🔗 **Live Application:** https://resolveon-bug-trackerr.vercel.app/

---

## 1. Introduction — Frontend

Resolveon is a web-based bug tracking and project management application designed to simplify the way development teams organize projects, manage issues, and monitor progress.

The frontend provides an interactive interface for authentication, project management, ticket tracking, team collaboration, and user account management. It communicates with the backend REST API to retrieve and update application data, while React manages the user interface and state.

The application is designed around a clean dashboard experience, organized navigation, reusable UI patterns, and responsive layouts to make project and ticket management easier.

---

## 2. Research & Problem Understanding

During the development of Resolveon, the focus was on understanding how project teams manage bugs and track development progress across multiple projects.

A useful bug tracking interface should make it easy to:

- Understand the overall project and ticket status at a glance
- Organize issues within individual projects
- Identify high-priority and unresolved tickets
- Assign issues to responsible team members
- Update ticket progress without unnecessary navigation
- Search and filter tickets efficiently
- Collaborate through ticket-related discussions
- Maintain a clear and consistent workflow

Resolveon addresses these needs through a dashboard, project workspace, ticket board, list view, filtering controls, drag-and-drop status updates, and integrated comments.

The interface is structured to keep the most important project information accessible while providing dedicated views for detailed ticket management.

---

## 3. Tech Stack & Why

| Technology | Why it is used |
|---|---|
| **React 19** | Component-based UI development, reusable components, state management, and interactive interfaces. |
| **Vite** | Fast development server, efficient build tooling, and optimized production builds. |
| **Tailwind CSS 4** | Utility-first styling for consistent UI design, responsive layouts, and rapid styling without maintaining large CSS files. |
| **React Router 7** | Client-side routing between authentication, dashboard, projects, tickets, and profile pages. |
| **JavaScript (ES Modules)** | Application logic, API communication, event handling, and UI state management. |

---

## 4. Libraries & Their Roles

| Library | Purpose in Resolveon |
|---|---|
| `react` | Builds interactive UI components and manages component state. |
| `react-dom` | Renders React components into the browser DOM. |
| `react-router-dom` | Handles application routing, navigation, route parameters, redirects, and nested layouts. |
| `@hello-pangea/dnd` | Implements drag-and-drop ticket movement across Kanban status columns. |
| `lucide-react` | Provides consistent, lightweight icons throughout the application. |
| `tailwindcss` | Utility-first CSS framework used for UI styling and responsive layouts. |
| `@tailwindcss/vite` | Integrates Tailwind CSS with the Vite build system. |
| `vite` | Development server and production build tool. |

---

## 5. Functionality — Screenshots

### 5.1 Authentication

Resolveon provides dedicated login and registration pages with input validation, password visibility controls, and API integration for authentication.

Registration includes:

- Full name validation
- Email format validation
- Password strength requirements
- Confirm password validation
- Password visibility toggles
- API error handling

Login includes:

- Email and password validation
- Password visibility toggle
- Authentication error handling
- Redirect to the dashboard after successful login

#### Login

![Resolveon Login](docs/day-12/Day-12-Login-Sign-In.png)

#### Registration

![Resolveon Registration](docs/day-12/Day-12-Register-Sign-Up.png)

---

### 5.2 Dashboard

The dashboard provides an overview of the user's workspace and project activity.

It displays project and ticket information fetched from the backend, helping users monitor their projects and ticket progress from a centralized location.

![Resolveon Dashboard](docs/day-6/Day-06-Dashboard.png)

---

### 5.3 Project Management

Projects provide a structured workspace for organizing tickets and collaborating with team members.

Users can:

- View their projects
- Search projects
- Create projects
- Edit project details
- Delete projects
- Manage team members
- Navigate into a project's ticket workspace

#### Projects List

![Resolveon Projects](docs/day-3/Day-03-Projects-List.png)

#### Project Dashboard

![Resolveon Project Dashboard](docs/day-3/Day-03-Project-Dashboard.png)

#### Create Project

![Create Project Modal](docs/day-3/Day-03-create-Project-Modal.png)

#### My Projects

![My Projects Page](docs/day-6/Day-06-My-Projects-Page.png)

---

### 5.4 Ticket Management

Tickets are used to track bugs, tasks, and development issues within a project.

Users can:

- Create tickets
- Edit ticket details
- Delete tickets
- Set ticket priority
- Update ticket status
- Assign tickets to team members
- Search tickets by keyword
- Filter tickets by status, priority, and assignee
- View tickets using Kanban or list layout
- Navigate through paginated ticket lists

#### Ticket Management Interface

![Ticket Management](docs/day-5/Day-05-Ticket-Management-UI.png)

#### Ticket List View

![Ticket List](docs/day-5/Day-05-Ticket-List-UI.png)

#### Create Ticket

![Create Ticket](docs/day-5/Day-05-Create-Ticket-Modal.png)

#### Edit Ticket

![Edit Ticket](docs/day-11/Day-11-Edit-Ticket-Modal.png)

#### Delete Ticket Confirmation

![Delete Ticket](docs/day-11/Day-11-Delete-Ticket-Confirmation.png)

---

### 5.5 Kanban Board

Resolveon includes an interactive Kanban board that organizes tickets according to their current status.

Tickets can be dragged and dropped between columns to update their workflow status, providing a visual way to track issue progress.

The board includes:

- Status-based columns
- Drag-and-drop ticket movement
- Ticket creation directly from the board
- Priority indicators
- Assignee information
- Comment counts
- Ticket descriptions
- Status updates synchronized with the backend

#### Kanban Board

![Resolveon Kanban Board](docs/day-8/Day-08-Kanban-%20Board.png)

#### Drag-and-Drop Status Update

![Kanban Drag and Drop](docs/day-8/Day-08-Drag-and-Drop-Status-Update.png)

#### Create Ticket from Kanban Board

![Create Ticket from Kanban](docs/day-8/Day-08-Create-Ticket-Modal-from-Kanban.png)

---

### 5.6 Ticket Filtering & Search

Ticket filtering and search help users quickly locate specific issues without manually browsing through all tickets.

Available filters include:

- Status
- Priority
- Assignee

Keyword search is supported for locating tickets by relevant text.

#### Ticket Filters

![Ticket Board Filters](docs/day-10/Day-10-Ticket-Board-Filters.png)

#### Filtered Tickets

![Filtered Tickets](docs/day-10/Day-10-Filtered-Tickets.png)

#### Tickets List View

![Tickets List View](docs/day-10/Day-10-Tickets-List-View.png)

---

### 5.7 Ticket Comments

Tickets include an integrated comment section to support discussions, updates, and collaboration.

Users can:

- Expand ticket comments
- View existing comments
- Add comments
- See comment counts associated with tickets

#### Kanban Board Comment Counts

![Ticket Comment Counts](docs/day-9/Day-09-Kanban-Board-Comment-Counts.png)

---

### 5.8 User Profile

The profile page displays the authenticated user's account information, including name and email, and provides account session management through logout.

![Resolveon Profile](docs/day-6/Day-06-Profile.png)

---

## 6. Application Routes

| Route | Page | Description |
|---|---|---|
| `/` | Redirect | Redirects to login |
| `/login` | Login | User authentication |
| `/register` | Register | New user registration |
| `/dashboard` | Dashboard | Project and ticket overview |
| `/projects` | Projects | Project management |
| `/projects/:projectId/tickets` | Tickets | Project ticket management |
| `/profile` | Profile | User account details and logout |

---

## 7. Local Setup

### Prerequisites

- Node.js
- npm
- Resolveon backend running locally or accessible through its deployed API

### Installation

Clone the repository:

```bash
git clone <FRONTEND_REPOSITORY_URL>
cd Bug-Tracker-Frontend
npm install
```

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The application will be available at the local URL provided by Vite, usually:

```text
http://localhost:5173
```

### Production Build

Build the application:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 8. Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the Resolveon backend API. |

Example production configuration:

```env
VITE_API_URL=https://resolveon-bug-tracker-backend.onrender.com
```

---

## 9. Project Structure

```text
Bug-Tracker-Frontend/
├── docs/
│   ├── day-2/
│   ├── day-3/
│   ├── day-5/
│   ├── day-6/
│   ├── day-8/
│   ├── day-9/
│   ├── day-10/
│   ├── day-11/
│   └── day-12/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   │   └── DashboardLayout.jsx
│   ├── pages/
│   │   ├── AuthLayout.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   ├── Projects.jsx
│   │   ├── Register.jsx
│   │   └── Tickets.jsx
│   ├── App.jsx
│   ├── App.css
│   └── index.css
├── package.json
├── vite.config.js
└── vercel.json
```

---

## 10. Deployment

The frontend is deployed using **Vercel**, with the backend hosted separately on Render.

### Production URL

https://resolveon-bug-trackerr.vercel.app/

### Deployment Configuration

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL`

A Vercel rewrite configuration is included to support client-side React Router navigation and direct route refreshes.

---

## 11. Conclusion

Resolveon frontend provides a responsive and interactive interface for managing projects and tracking development issues. Through its dashboard, project management workspace, Kanban board, list view, filters, ticket assignment, and comments, it brings the core bug tracking workflow into a single application.

Built with React, Vite, Tailwind CSS, and React Router, the frontend is structured to provide a maintainable application architecture while delivering a smooth user experience.

The frontend works alongside the Resolveon backend API to provide a complete full-stack project management and bug tracking platform.

---

**Backend Repository:** `<BACKEND_REPOSITORY_URL>`

**Live Application:** https://resolveon-bug-trackerr.vercel.app/
