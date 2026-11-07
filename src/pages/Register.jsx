import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Eye,
    EyeOff,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

const validateField = (name, value, formData) => {
    switch (name) {
        case 'name': {
            const trimmedName = value.trim()

            if (!trimmedName) {
                return 'Full name is required'
            }

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
            if (!value) {
                return 'Please confirm your password'
            }

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

        // Validate the current field if it already has an error
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

        // Revalidate confirm password when password changes
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

        // Validate every field
        const newErrors = {}

        Object.keys(formData).forEach((field) => {
            newErrors[field] = validateField(
                field,
                formData[field],
                formData
            )
        })

        setErrors(newErrors)

        // Stop submission if validation fails
        if (Object.values(newErrors).some((error) => error)) {
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/register`, {
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
                        Create an account
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Get started with Resolveon today.
                    </p>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit} noValidate className="space-y-5">

                    {/* Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter your full name"
                            autoComplete="name"
                            maxLength={50}
                            className={inputClass}
                        />

                        {errors.name && (
                            <p className={errorClass}>
                                {errors.name}
                            </p>
                        )}
                    </div>

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
                                placeholder="Create a password"
                                autoComplete="new-password"
                                maxLength={128}
                                className={`${inputClass} pr-12`}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-white"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                            8+ characters with uppercase, lowercase,
                            number and special character.
                        </p>

                        {errors.password && (
                            <p className={errorClass}>
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Confirm Password
                        </label>

                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                maxLength={128}
                                className={`${inputClass} pr-12`}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword((prev) => !prev)
                                }
                                className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-white"
                                aria-label={
                                    showConfirmPassword
                                        ? 'Hide confirm password'
                                        : 'Show confirm password'
                                }
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>

                        {errors.confirmPassword && (
                            <p className={errorClass}>
                                {errors.confirmPassword}
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
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                {/* Login Link */}
                <p className="mt-6 text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="font-medium text-indigo-400 transition hover:text-indigo-300"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register
