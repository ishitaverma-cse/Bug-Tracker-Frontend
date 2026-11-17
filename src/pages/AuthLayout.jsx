import { Bug, Sparkles } from 'lucide-react'

const AuthLayout = ({ children }) => {
    return (
        <main className="h-dvh overflow-hidden bg-[#0b1020] p-3 sm:p-5 lg:p-6">
            <div className="mx-auto grid h-full max-w-[1400px] grid-cols-1 overflow-hidden rounded-[28px] bg-[#111827] shadow-[0_20px_80px_-30px_rgba(0,0,0,0.5)] lg:grid-cols-[1.05fr_0.95fr]">

                {/* Left Branding Panel */}
                <section className="relative hidden min-h-0 overflow-hidden bg-[#171b3b] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-14 xl:py-12">

                    {/* Background decoration */}
                    <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

                    {/* Brand */}
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-950/30">
                            <Bug size={23} strokeWidth={2.2} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Resolveon
                            </h1>
                            <p className="text-[11px] font-medium tracking-[0.18em] text-indigo-200/70">
                                BUILD. TRACK. RESOLVE.
                            </p>
                        </div>
                    </div>

                    {/* Main Message */}
                    <div className="relative z-10 max-w-xl">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-indigo-200">
                            <Sparkles size={14} />
                            YOUR TEAM'S DEVELOPMENT WORKSPACE
                        </div>

                        <h2 className="text-4xl font-semibold leading-[1.2] tracking-tight xl:text-5xl">
                            Every issue has a
                            <span className="block text-indigo-300">
                                solution.
                            </span>
                        </h2>

                        <p className="mt-6 max-w-md text-[15px] leading-7 text-slate-300/80">
                            Keep your projects organized, collaborate with
                            your team, and turn bugs into progress — all in
                            one place.
                        </p>

                        <div className="mt-9 h-1 w-20 rounded-full bg-indigo-400/80" />
                    </div>

                    {/* Footer */}
                    <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
                        <p>© {new Date().getFullYear()} Resolveon</p>
                        <p>Made for teams that build better.</p>
                    </div>
                </section>

                {/* Right Form Area */}
                <section className="flex min-h-0 min-w-0 flex-col overflow-y-auto bg-[#111827] px-5 py-6 sm:px-10 sm:py-8 lg:justify-center lg:px-12 xl:px-16">

                    {/* Mobile Branding */}
                    <div className="mb-8 flex shrink-0 items-center gap-2.5 lg:hidden">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                            <Bug size={21} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">
                                Resolveon
                            </h1>
                            <p className="text-[10px] font-medium tracking-[0.15em] text-slate-400">
                                BUILD. TRACK. RESOLVE.
                            </p>
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-[420px] shrink-0">
                        {children}
                    </div>

                    {/* Mobile Footer */}
                    <p className="mt-8 shrink-0 text-center text-xs text-slate-500 lg:hidden">
                        © {new Date().getFullYear()} Resolveon
                    </p>
                </section>
            </div>
        </main>
    )
}

export default AuthLayout
