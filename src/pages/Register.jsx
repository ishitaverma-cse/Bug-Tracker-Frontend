import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    ArrowRight,
    Eye,
    EyeOff,
    UserRound,
    Mail,
    LockKeyhole,
    AlertCircle,
} from 'lucide-react'
import AuthLayout from './AuthLayout'

const API_URL = import.meta.env.VITE_API_URL

const validateField = (name, value, formData) => {
    switch (name) {
        case 'name': {
            const trimmedName = value.trim()

            if (!trimmedName) return 'Full name is required'
            if (trimmedName.length < 2) {
                return 'Name must contain at least 2 characters'
            }
            if (trimmedName.length > 50) {
                return 'Name cannot exceed 50 characters'
            }
            if (!/^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u.test(trimmedName)) {
                return 'Enter a valid name using letters only'
            }

            return ''
        }

        case 'email': {
            const trimmedEmail = value.trim()

            if (!trimmedEmail) return 'Email address is required'
            if (trimmedEmail.length > 254) {
                return 'Email address is too long'
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
                return 'Enter a valid email address'
            }

            return ''
        }

        case 'password': {
            if (!value) return 'Password is required'
            if (value.length < 8) {
                return 'Password must be at least 8 characters long'
            }
            if (value.length > 128) {
                return 'Password cannot exceed 128 characters'
            }
            if (!/[A-Z]/.test(value)) {
                return 'Password must contain an uppercase letter'
            }
            if (!/[a-z]/.test(value)) {
                return 'Password must contain a lowercase letter'
            }
            if (!/[0-9]/.test(value)) {
                return 'Password must contain a number'
            }
            if (!/[^A-Za-z0-9]/.test(value)) {
                return 'Password must contain a special character'
            }
            if (/\s/.test(value)) {
                return 'Password cannot contain spaces'
            }

            return ''
        }

        case 'confirmPassword': {
            if (!value) return 'Please confirm your password'
            if (value !== formData.password) {
                return 'Passwords do not match'
            }

            return ''
        }

        default:
            return ''
    }
}

const Register = () => {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    const [errors, setErrors] = useState({})
    const [apiError, setApiError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target

        const updatedFormData = {
            ...formData,
            [name]: value,
        }

        setFormData(updatedFormData)
        setApiError('')

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: validateField(
                    name,
                    value,
                    updatedFormData
                ),
            }))
        }

        if (name === 'password' && errors.confirmPassword) {
            setErrors((prev) => ({
                ...prev,
                confirmPassword: validateField(
                    'confirmPassword',
                    updatedFormData.confirmPassword,
                    updatedFormData
                ),
            }))
        }
    }

    const handleBlur = (e) => {
        const { name, value } = e.target

        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, value, formData),
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setApiError('')

        const newErrors = {}

        Object.keys(formData).forEach((field) => {
            newErrors[field] = validateField(
                field,
                formData[field],
                formData
            )
        })

        setErrors(newErrors)

        if (Object.values(newErrors).some((error) => error)) {
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setApiError(data.message || 'Registration failed')
                return
            }

            navigate('/login', {
                state: {
                    success: data.message,
                },
            })
        } catch (error) {
            console.error('Registration error:', error)

            setApiError(
                'Unable to connect to the server. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    const inputClass = (field) =>
        `w-full rounded-xl border bg-[#1e293b] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:ring-4 ${errors[field]
            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/10'
            : 'border-slate-700 hover:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/15'
        }`

    return (
        <AuthLayout>
            {/* Heading */}
            <div className="mb-6">
                <div className="mb-3 inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                    GET STARTED
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-white">
                    Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                    Join Resolveon and bring your team's work together.
                </p>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

                {/* Full Name */}
                <div>
                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-semibold text-slate-200"
                    >
                        Full name
                    </label>

                    <div className="relative">
                        <UserRound
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter your full name"
                            autoComplete="name"
                            maxLength={50}
                            className={inputClass('name')}
                        />
                    </div>

                    {errors.name && (
                        <p className="mt-1.5 text-xs font-medium text-red-400">
                            {errors.name}
                        </p>
                    )}
                </div>

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
                    <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-semibold text-slate-200"
                    >
                        Password
                    </label>

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
                            placeholder="Create a password"
                            autoComplete="new-password"
                            maxLength={128}
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

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                        Use 8+ characters with uppercase, lowercase,
                        a number and a special character.
                    </p>

                    {errors.password && (
                        <p className="mt-1.5 text-xs font-medium text-red-400">
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-semibold text-slate-200"
                    >
                        Confirm password
                    </label>

                    <div className="relative">
                        <LockKeyhole
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                            maxLength={128}
                            className={`${inputClass('confirmPassword')} pr-12`}
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword((prev) => !prev)
                            }
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-indigo-400"
                            aria-label={
                                showConfirmPassword
                                    ? 'Hide confirm password'
                                    : 'Show confirm password'
                            }
                        >
                            {showConfirmPassword ? (
                                <EyeOff size={19} />
                            ) : (
                                <Eye size={19} />
                            )}
                        </button>
                    </div>

                    {errors.confirmPassword && (
                        <p className="mt-1.5 text-xs font-medium text-red-400">
                            {errors.confirmPassword}
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
                    {loading ? 'Creating account...' : 'Create account'}

                    {!loading && (
                        <ArrowRight
                            size={18}
                            className="transition-transform group-hover:translate-x-1"
                        />
                    )}
                </button>
            </form>

            {/* Login Link */}
            <div className="mt-5 border-t border-slate-700/70 pt-5 text-center">
                <p className="text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="font-semibold text-indigo-400 transition hover:text-indigo-300"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    )
}

export default Register
