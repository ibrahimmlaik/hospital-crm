export default function Loading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-9 w-52 bg-white/10 rounded-lg mb-2" />
                    <div className="h-4 w-72 bg-white/5 rounded-lg" />
                </div>
                <div className="h-10 w-28 bg-white/10 rounded-xl" />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                {/* Table header */}
                <div className="flex gap-4 px-6 py-4 border-b border-white/10">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-3 flex-1 bg-white/10 rounded" />
                    ))}
                </div>
                {/* Table rows */}
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex gap-4 px-6 py-4 border-b border-white/5">
                        <div className="h-4 w-8 bg-white/5 rounded" />
                        <div className="h-4 flex-1 bg-white/5 rounded" />
                        <div className="h-4 flex-1 bg-white/5 rounded" />
                        <div className="h-4 w-20 bg-white/5 rounded" />
                        <div className="h-4 w-16 bg-white/8 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
