import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
    ArrowRight,
    Eye,
    EyeOff,
    Mail,
    LockKeyhole,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react'
import AuthLayout from './AuthLayout'

const API_URL = import.meta.env.VITE_API_URL

const validateField = (name, value) => {
    switch (name) {
        case 'email': {
            const trimmedEmail = value.trim()

            if (!trimmedEmail) return 'Email address is required'
            if (trimmedEmail.length > 254) return 'Email address is too long'

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
                return 'Enter a valid email address'
            }

            return ''
        }

        case 'password': {
            if (!value) return 'Password is required'
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
            newErrors[field] = validateField(field, formData[field])
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

            localStorage.setItem('resolveon-token', data.token)
            localStorage.setItem(
                'resolveon-user',
                JSON.stringify(data.user)
            )

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

    const inputClass = (field) =>
        `w-full rounded-xl border bg-[#1e293b] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:ring-4 ${
            errors[field]
                ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/10'
                : 'border-slate-700 hover:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/15'
        }`

    return (
        <AuthLayout>
            {/* Heading */}
            <div className="mb-8">
                <div className="mb-3 inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                    WELCOME BACK
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-white">
                    Sign in to your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                    Enter your credentials to access your workspace.
                </p>
            </div>

            {/* Registration Success */}
            {registrationSuccess && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
                    <CheckCircle2
                        size={19}
                        className="mt-0.5 shrink-0 text-emerald-400"
                    />
                    <p className="text-sm leading-5 text-emerald-300">
                        {registrationSuccess}
                    </p>
                </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

                {/* Email */}
                <div>
                    <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-semibold text-slate-200"
                    >
                        Email address
                    </label>

                    <div className="relative">
                        <Mail
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="you@example.com"
                            autoComplete="email"
                            maxLength={254}
                            className={inputClass('email')}
                        />
                    </div>

                    {errors.email && (
                        <p className="mt-1.5 text-xs font-medium text-red-400">
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <label
                            htmlFor="password"
                            className="text-sm font-semibold text-slate-200"
                        >
                            Password
                        </label>
                    </div>

                    <div className="relative">
                        <LockKeyhole
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className={`${inputClass('password')} pr-12`}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-indigo-400"
                            aria-label={
                                showPassword ? 'Hide password' : 'Show password'
                            }
                        >
                            {showPassword ? (
                                <EyeOff size={19} />
                            ) : (
                                <Eye size={19} />
                            )}
                        </button>
                    </div>

                    {errors.password && (
                        <p className="mt-1.5 text-xs font-medium text-red-400">
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* API Error */}
                {apiError && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5">
                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0 text-red-400"
                        />
                        <p className="text-sm leading-5 text-red-300">
                            {apiError}
                        </p>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 hover:shadow-indigo-600/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'Signing in...' : 'Sign in'}

                    {!loading && (
                        <ArrowRight
                            size={18}
                            className="transition-transform group-hover:translate-x-1"
                        />
                    )}
                </button>
            </form>

            {/* Register Link */}
            <div className="mt-5 border-t border-slate-700/70 pt-6 text-center">
                <p className="text-sm text-slate-400">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="font-semibold text-indigo-400 transition hover:text-indigo-300"
                    >
                        Create an account
                    </Link>
                </p>
            </div>

            <p className="mt-7 text-center text-xs text-slate-500">
                Secure access to your Resolveon workspace.
            </p>
        </AuthLayout>
    )
}

export default Login
