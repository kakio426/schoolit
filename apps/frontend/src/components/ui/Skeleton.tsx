export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`} />
    );
}

export function JobCardSkeleton() {
    return (
        <div className="border border-slate-700 bg-slate-800/40 p-5 rounded-xl space-y-4">
            <div className="flex gap-4">
                {/* Left Section */}
                <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                        <Skeleton className="h-5 w-16 rounded" />
                        <Skeleton className="h-5 w-24 rounded" />
                    </div>
                    <Skeleton className="h-7 w-3/4 rounded" />
                    <div className="flex gap-3 pt-1">
                        <Skeleton className="h-4 w-12 rounded" />
                        <Skeleton className="h-4 w-12 rounded" />
                        <Skeleton className="h-4 w-12 rounded" />
                    </div>
                </div>

                {/* Right Section (Hidden on mobile usually, but keeping skeleton simple) */}
                <div className="hidden md:block w-32 border-l border-slate-700/50 pl-5">
                    <Skeleton className="h-full w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}
