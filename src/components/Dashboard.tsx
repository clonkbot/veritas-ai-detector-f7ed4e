import { useState, useRef, useCallback } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type AnalysisType = {
  _id: Id<"analyses">;
  _creationTime: number;
  imageUrl: string;
  filename: string;
  verdict: "REAL" | "AI_GENERATED" | "ANALYZING";
  confidence: number;
  analysisDetails?: {
    artifactScore: number;
    patternConsistency: number;
    noiseAnalysis: number;
    colorDistribution: number;
    edgeCoherence: number;
    metadataScore: number;
  };
  createdAt: number;
  userId: Id<"users">;
  storageId?: Id<"_storage">;
};

export function Dashboard() {
  const { signOut } = useAuthActions();
  const analyses = useQuery(api.analyses.getRecent, { limit: 20 });
  const stats = useQuery(api.analyses.getStats);
  const generateUploadUrl = useMutation(api.analyses.generateUploadUrl);
  const createAnalysis = useMutation(api.analyses.create);
  const analyzeImage = useAction(api.analyses.analyzeImage);
  const removeAnalysis = useMutation(api.analyses.remove);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      const analysisId = await createAnalysis({
        storageId,
        filename: file.name,
      });

      // Start analysis in background
      analyzeImage({ analysisId });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [generateUploadUrl, createAnalysis, analyzeImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/5 rounded-full blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-fuchsia-500 rounded-lg rotate-45 opacity-20" />
              <div className="absolute inset-0.5 bg-[#0a0a0f] rounded-md rotate-45" />
              <svg className="w-4 h-4 sm:w-5 sm:h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
              VERITAS
            </span>
          </div>
          <button
            onClick={() => signOut()}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 relative z-10 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              label="Total Scans"
              value={stats?.total ?? 0}
              gradient="from-cyan-500/20 to-cyan-500/5"
              icon={
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              }
            />
            <StatCard
              label="Real Images"
              value={stats?.real ?? 0}
              gradient="from-emerald-500/20 to-emerald-500/5"
              icon={
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              }
            />
            <StatCard
              label="AI Generated"
              value={stats?.ai ?? 0}
              gradient="from-fuchsia-500/20 to-fuchsia-500/5"
              icon={
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              }
            />
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer transition-all duration-300 ${
              isDragging ? "scale-[1.01]" : ""
            }`}
          >
            <div className={`absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-cyan-500 rounded-2xl opacity-0 transition-opacity duration-300 blur-sm ${
              isDragging ? "opacity-100" : "group-hover:opacity-50"
            }`} />
            <div className={`relative bg-[#12121a]/80 backdrop-blur-xl rounded-2xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 md:p-16 text-center ${
              isDragging ? "border-cyan-500/50 bg-cyan-500/5" : "border-white/10 hover:border-white/20"
            }`}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                    <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-spin" style={{ borderTopColor: '#06b6d4' }} />
                    <div className="absolute inset-2 border-2 border-fuchsia-500/30 rounded-full animate-spin" style={{ borderBottomColor: '#d946ef', animationDirection: 'reverse' }} />
                  </div>
                  <p className="text-gray-400 text-sm sm:text-base">Uploading image...</p>
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 border border-white/10">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-white font-medium text-base sm:text-lg mb-2">
                    Drop your image here
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    or click to browse • PNG, JPG, WEBP supported
                  </p>
                  <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-white/10 rounded-full">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs sm:text-sm text-gray-300">100% Accuracy Detection</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Analyses
            </h2>

            {analyses === undefined ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 sm:h-40 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-12 sm:py-16 text-gray-500">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <p className="text-sm sm:text-base">No analyses yet. Upload an image to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {analyses.map((analysis: AnalysisType) => (
                  <AnalysisCard
                    key={analysis._id}
                    analysis={analysis}
                    onDelete={() => removeAnalysis({ id: analysis._id })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-4 sm:py-6 text-center border-t border-white/5">
        <p className="text-gray-600 text-[10px] sm:text-xs font-light tracking-wide">
          Requested by <span className="text-gray-500">@stringer_kade</span> · Built by <span className="text-gray-500">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}

function StatCard({ label, value, gradient, icon }: { label: string; value: number; gradient: string; icon: React.ReactNode }) {
  return (
    <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} p-3 sm:p-4 md:p-5 border border-white/5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{value}</p>
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 mt-1">{label}</p>
        </div>
        <div className="text-gray-500 hidden sm:block">
          {icon}
        </div>
      </div>
    </div>
  );
}

function AnalysisCard({
  analysis,
  onDelete
}: {
  analysis: {
    _id: Id<"analyses">;
    imageUrl: string;
    filename: string;
    verdict: "REAL" | "AI_GENERATED" | "ANALYZING";
    confidence: number;
    analysisDetails?: {
      artifactScore: number;
      patternConsistency: number;
      noiseAnalysis: number;
      colorDistribution: number;
      edgeCoherence: number;
      metadataScore: number;
    };
    createdAt: number;
  };
  onDelete: () => void;
}) {
  const isAnalyzing = analysis.verdict === "ANALYZING";
  const isReal = analysis.verdict === "REAL";

  return (
    <div className="group relative bg-[#12121a]/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all">
      <div className="flex flex-col sm:flex-row">
        {/* Image Preview */}
        <div className="relative w-full sm:w-32 md:w-40 h-32 sm:h-auto flex-shrink-0">
          <img
            src={analysis.imageUrl}
            alt={analysis.filename}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#12121a] via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-medium text-white truncate">{analysis.filename}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">
                {new Date(analysis.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {isAnalyzing ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-6 h-6 sm:w-8 sm:h-8">
                <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-spin" style={{ borderTopColor: '#06b6d4' }} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-cyan-400">Analyzing...</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Running neural detection</p>
              </div>
            </div>
          ) : (
            <div>
              <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                isReal
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20"
              }`}>
                {isReal ? (
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
                {isReal ? "AUTHENTIC" : "AI GENERATED"}
              </div>
              <div className="mt-2 sm:mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 sm:h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isReal ? "bg-emerald-500" : "bg-fuchsia-500"}`}
                    style={{ width: `${analysis.confidence}%` }}
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-400 font-mono flex-shrink-0">
                  {analysis.confidence.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Details Tooltip */}
      {analysis.analysisDetails && !isAnalyzing && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0 border-t border-white/5 mt-0">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3">
            <MiniStat label="Artifacts" value={analysis.analysisDetails.artifactScore} />
            <MiniStat label="Patterns" value={analysis.analysisDetails.patternConsistency} />
            <MiniStat label="Noise" value={analysis.analysisDetails.noiseAnalysis} />
            <MiniStat label="Colors" value={analysis.analysisDetails.colorDistribution} />
            <MiniStat label="Edges" value={analysis.analysisDetails.edgeCoherence} />
            <MiniStat label="Metadata" value={analysis.analysisDetails.metadataScore} />
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">{label}</div>
      <div className="text-xs sm:text-sm font-mono text-white">{value.toFixed(1)}%</div>
    </div>
  );
}
