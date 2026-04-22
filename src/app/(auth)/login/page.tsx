"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { login, signInWithGoogle } from "@/actions/auth"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, { error: "" })
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
      <div className="flex w-full max-w-[1440px] min-h-screen md:min-h-[860px] md:max-h-[920px] md:rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(15,23,42,0.08)]">

        {/* ── Left Panel: Mesh Gradient ─────────────────────── */}
        <div className="hidden md:flex md:w-1/2 mesh-gradient relative items-end p-16 overflow-hidden">
          {/* glass overlay */}
          <div className="absolute inset-0 bg-black/10" />
          {/* blur orb */}
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-md">
            <h1 className="text-white text-5xl font-extrabold tracking-tight leading-[1.1]">
              Your AI-powered study command center
            </h1>
            <p className="text-white/80 text-lg font-medium max-w-xs">
              Elevate your cognitive performance with the precision of a curated atelier.
            </p>
          </div>
        </div>

        {/* ── Right Panel: Form ─────────────────────────────── */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-8 md:px-20 py-12 bg-white">
          <div className="w-full max-w-sm space-y-10">

            {/* Logo */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                  style={{ background: "linear-gradient(135deg, #00685f, #008378)" }}
                >
                  🧠
                </div>
                <span className="text-2xl font-bold tracking-tight" style={{ color: "#00685f" }}>
                  NeuroPlan AI
                </span>
              </div>
              <div className="pt-4">
                <h2 className="text-2xl font-bold text-[#191c1e]">Welcome back</h2>
                <p className="text-[#3d4947] text-sm mt-1">
                  Please enter your credentials to access your atelier.
                </p>
              </div>
            </div>

            {/* Form */}
            <form action={formAction} className="space-y-6">
              {state?.error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                  {state.error}
                </div>
              )}

              <div className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#3d4947] uppercase tracking-widest" htmlFor="email">
                    Email Address
                  </label>
                  <div className="input-underline">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="student@university.edu"
                      required
                      className="w-full px-4 py-3 bg-[#f2f4f6] border-none rounded-lg text-sm placeholder:text-[#bcc9c6] text-[#191c1e] outline-none transition-all focus:bg-white"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-[#3d4947] uppercase tracking-widest" htmlFor="password">
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-[11px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                      style={{ color: "#00685f" }}
                    >
                      Forgot?
                    </a>
                  </div>
                  <div className="relative input-underline">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 bg-[#f2f4f6] border-none rounded-lg text-sm placeholder:text-[#bcc9c6] text-[#191c1e] outline-none transition-all focus:bg-white pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bcc9c6] hover:text-[#00685f] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 text-white font-bold rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #00685f, #008378)" }}
              >
                {isPending ? "Signing in..." : "Login to Command Center"}
              </button>
            </form>

            {/* Social + Signup */}
            <div className="pt-2 space-y-6 border-t border-[#e2e8f0]">
              <div className="flex items-center gap-4 pt-2">
                <div className="h-px flex-1 bg-[#e2e8f0]" />
                <span className="text-[11px] font-bold text-[#6d7a77] uppercase tracking-widest">Or continue with</span>
                <div className="h-px flex-1 bg-[#e2e8f0]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-[#f2f4f6] hover:bg-[#e6e8ea] rounded-xl transition-colors text-sm font-semibold text-[#191c1e]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.68-2.33 1.09-3.71 1.09-2.85 0-5.27-1.92-6.13-4.51H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.87 14.15c-.22-.68-.35-1.41-.35-2.15s.13-1.47.35-2.15V7.01H2.18C1.43 8.52 1 10.21 1 12s.43 3.48 1.18 4.99l3.69-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.01l3.69 2.84c.86-2.59 3.28-4.51 6.13-4.47z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-[#f2f4f6] hover:bg-[#e6e8ea] rounded-xl transition-colors text-sm font-semibold text-[#191c1e]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.28.07 2.18.74 2.95.8 1.13-.23 2.19-.93 3.42-.84 1.46.12 2.54.69 3.27 1.75-3.02 1.84-2.31 5.77.37 6.9-.52 1.38-1.2 2.7-2.01 4.25zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Apple
                </button>
              </div>

              <p className="text-center text-sm text-[#3d4947]">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-bold hover:underline" style={{ color: "#00685f" }}>
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Security Badge */}
      <div className="fixed bottom-8 right-8 hidden lg:flex items-center gap-3 bg-white/80 backdrop-blur-xl px-4 py-3 rounded-full border border-[#e2e8f0] shadow-lg">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
          style={{ background: "#ffddb8" }}
        >
          ✨
        </div>
        <span className="text-[11px] font-bold tracking-widest uppercase text-[#3d4947]">
          AI-Enhanced Security Active
        </span>
      </div>
    </main>
  )
}
