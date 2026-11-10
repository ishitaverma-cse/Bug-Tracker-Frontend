import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Tickets from './pages/Tickets'

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

                {/* Dashboard Route */}
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                {/* Projects Route */}
                <Route
                    path="/projects"
                    element={<Projects />}
                />

                {/* Project Tickets Route */}
                <Route
                    path="/projects/:projectId/tickets"
                    element={<Tickets />}
                />

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
