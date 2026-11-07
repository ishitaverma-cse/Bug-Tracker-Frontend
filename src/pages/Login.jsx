import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

const validateField = (name, value) => {
    switch (name) {
        case 'email': {
            const trimmedEmail = value.trim()

            if (!trimmedEmail) {
                return 'Email address is required'
            }

            if (trimmedEmail.length > 254) {
                return 'Email address is too long'
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
                return 'Enter a valid email address'
            }

            return ''
        }

        case 'password': {
            if (!value) {
                return 'Password is required'
            }

            return ''
        }

        default:
            return ''
    }
}

const Login = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const [errors, setErrors] = useState({})
    const [apiError, setApiError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const registrationSuccess = location.state?.success

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        setApiError('')

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: validateField(name, value),
            }))
        }
    }

    const handleBlur = (e) => {
        const { name, value } = e.target

        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, value),
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setApiError('')

        const newErrors = {}

        Object.keys(formData).forEach((field) => {
            newErrors[field] = validateField(
                field,
                formData[field]
            )
        })

        setErrors(newErrors)

        if (Object.values(newErrors).some((error) => error)) {
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setApiError(
                    data.message || 'Invalid email address or password'
                )
                return
            }

            // Store authentication details
            localStorage.setItem('resolveon-token', data.token)
            localStorage.setItem(
                'resolveon-user',
                JSON.stringify(data.user)
            )

            // Navigate to dashboard after successful login
            navigate('/dashboard', {
                replace: true,
            })
        } catch (error) {
            console.error('Login error:', error)

            setApiError(
                'Unable to connect to the server. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    const inputClass =
        'w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'

    const errorClass = 'mt-1 text-sm text-red-400'

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

                {/* Brand */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-indigo-400">
                        Resolveon
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Your workspace for smarter bug tracking
                    </p>
                </div>

                {/* Heading */}
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-white">
                        Welcome back
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Sign in to continue to Resolveon.
                    </p>
                </div>

                {/* Registration Success */}
                {registrationSuccess && (
                    <p className="mb-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                        {registrationSuccess}
                    </p>
                )}

                {/* Login Form */}
                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-5"
                >

                    {/* Email */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Email Address
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="you@example.com"
                            autoComplete="email"
                            maxLength={254}
                            className={inputClass}
                        />

                        {errors.email && (
                            <p className={errorClass}>
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                className={`${inputClass} pr-12`}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword((prev) => !prev)
                                }
                                className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-white"
                                aria-label={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>

                        {errors.password && (
                            <p className={errorClass}>
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* API Error */}
                    {apiError && (
                        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                            {apiError}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                {/* Register Link */}
                <p className="mt-6 text-center text-sm text-slate-400">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="font-medium text-indigo-400 transition hover:text-indigo-300"
                    >
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Login