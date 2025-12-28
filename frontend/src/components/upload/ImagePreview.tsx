import { X } from 'lucide-react';

interface ImagePreviewProps {
    url: string;
    onRemove?: () => void;
    className?: string;
    alt?: string;
}

export function ImagePreview({ url, onRemove, className = '', alt = 'Image' }: ImagePreviewProps) {
    return (
        <div className={`relative group ${className}`}>
            <img
                src={url}
                alt={alt}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
            />
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    title="Remove image"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}
