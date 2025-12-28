interface SkeletonLoaderProps {
    className?: string;
}

// Base Skeleton Component
export function Skeleton({ className = '' }: SkeletonLoaderProps) {
    return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// Product Card Skeleton
export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Skeleton className="w-full h-48" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </div>
        </div>
    );
}

// Shop Card Skeleton
export function ShopCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Skeleton className="w-full h-32" />
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
            </div>
        </div>
    );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-gray-200">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-6 py-4">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

// List Item Skeleton
export function ListItemSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-gray-200">
            <Skeleton className="w-16 h-16 rounded" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}
