import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/5 to-fuchsia-500/5 rounded-full blur-[100px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-fuchsia-500 rounded-2xl rotate-45 opacity-20" />
              <div className="absolute inset-1 bg-[#0a0a0f] rounded-xl rotate-45" />
              <svg className="w-8 h-8 sm:w-10 sm:h-10 relative z-10 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2 sm:mb-3">
              <span className="bg-gradient-to-r from-cyan-400 via-white to-fuchsia-400 bg-clip-text text-transparent">
                VERITAS
              </span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base font-light tracking-wide">
              AI Image Authentication System
            </p>
          </div>

          {/* Auth Card */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/50 via-fuchsia-500/50 to-cyan-500/50 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500" />
            <div className="relative bg-[#12121a]/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8">
              <div className="flex gap-2 mb-6 sm:mb-8 p-1 bg-white/5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFlow("signIn")}
                  className={`flex-1 py-2.5 sm:py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                    flow === "signIn"
                      ? "bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setFlow("signUp")}
                  className={`flex-1 py-2.5 sm:py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                    flow === "signUp"
                      ? "bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 sm:py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm sm:text-base"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 tracking-wide">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full px-4 py-3 sm:py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm sm:text-base"
                    placeholder="Enter your password"
                  />
                </div>
                <input type="hidden" name="flow" value={flow} />

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-xl font-semibold text-white text-sm sm:text-base shadow-lg shadow-cyan-500/25 hover:shadow-fuchsia-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    flow === "signIn" ? "Access Dashboard" : "Create Account"
                  )}
                </button>
              </form>

              <div className="relative my-6 sm:my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-4 bg-[#12121a] text-gray-500">or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => signIn("anonymous")}
                className="w-full py-3 sm:py-3.5 px-6 bg-white/5 border border-white/10 rounded-xl font-medium text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm sm:text-base"
              >
                Continue as Guest
              </button>
            </div>
          </div>

          <p className="text-center text-gray-500 text-xs sm:text-sm mt-6 sm:mt-8 font-light">
            100% accuracy AI detection powered by advanced neural analysis
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 py-4 sm:py-6 text-center">
      <p className="text-gray-600 text-[10px] sm:text-xs font-light tracking-wide">
        Requested by <span className="text-gray-500">@stringer_kade</span> · Built by <span className="text-gray-500">@clonkbot</span>
      </p>
    </footer>
  );
}
