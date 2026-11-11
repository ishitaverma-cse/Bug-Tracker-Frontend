import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Tickets from './pages/Tickets'
import Profile from './pages/Profile'

import DashboardLayout from './layouts/DashboardLayout'

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Default Route */}
                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                {/* Authentication Routes */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Dashboard Layout */}
                <Route element={<DashboardLayout />}>

                    {/* Dashboard */}
                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    {/* Projects */}
                    <Route
                        path="/projects"
                        element={<Projects />}
                    />

                    {/* Project Tickets */}
                    <Route
                        path="/projects/:projectId/tickets"
                        element={<Tickets />}
                    />

                    {/* User Profile */}
                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                </Route>

                {/* Fallback Route */}
                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />

            </Routes>
        </BrowserRouter>
    )
}

export default App
