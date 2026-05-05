export default function DashboardLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header skeleton */}
            <div>
                <div className="h-9 w-48 bg-white/10 rounded-lg mb-2" />
                <div className="h-4 w-64 bg-white/5 rounded-lg" />
            </div>

            {/* Stats grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white/10 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="h-3 w-24 bg-white/10 rounded mb-2" />
                            <div className="h-7 w-16 bg-white/15 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Secondary stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white/10 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="h-3 w-24 bg-white/10 rounded mb-2" />
                            <div className="h-7 w-16 bg-white/15 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Content area skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 h-64" />
                <div className="rounded-2xl border border-white/10 bg-white/5 h-64" />
            </div>
        </div>
    );
}
