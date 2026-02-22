import { useConvexAuth } from "convex/react";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-cyan-500/30 rounded-full animate-spin" style={{ borderTopColor: '#06b6d4' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-fuchsia-500/30 rounded-full animate-spin" style={{ borderBottomColor: '#d946ef', animationDirection: 'reverse', animationDuration: '0.7s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {isAuthenticated ? <Dashboard /> : <AuthScreen />}
    </div>
  );
}
