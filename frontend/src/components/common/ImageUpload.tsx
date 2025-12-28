import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadService } from '../../services/upload.service';
import { getImageUrl } from '../../services/api';

interface ImageUploadProps {
    value: string[];
    onChange: (urls: string[]) => void;
    multiple?: boolean;
    label?: string;
    maxFiles?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    value = [],
    onChange,
    multiple = false,
    label = "Upload Images",
    maxFiles = 5
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setError(null);
        setIsUploading(true);

        try {
            // Validation
            if (multiple && value.length + files.length > maxFiles) {
                throw new Error(`Maximum ${maxFiles} images allowed`);
            }

            const filesArray = Array.from(files);

            // Validate types and size
            for (const file of filesArray) {
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                    throw new Error('Only JPG, PNG and WebP images are allowed');
                }
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error('File size must be less than 5MB');
                }
            }

            let newUrls: string[] = [];

            if (multiple) {
                const response = await uploadService.uploadMultipleImages(filesArray);
                if (response.success) {
                    newUrls = response.files.map(f => f.url);
                    onChange([...value, ...newUrls]);
                }
            } else {
                const response = await uploadService.uploadImage(filesArray[0]);
                if (response.success) {
                    onChange([response.url]);
                }
            }
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = (indexToRemove: number) => {
        const newValue = value.filter((_, index) => index !== indexToRemove);
        onChange(newValue);
    };



    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {value.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                        <img
                            src={getImageUrl(url)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}

                {(multiple ? value.length < maxFiles : value.length === 0) && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        {isUploading ? (
                            <Loader2 className="animate-spin text-blue-500 mb-2" size={24} />
                        ) : (
                            <Upload className="text-gray-400 mb-2" size={24} />
                        )}
                        <span className="text-xs text-center text-gray-500 font-medium">
                            {isUploading ? 'Uploading...' : 'Click to Upload'}
                        </span>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple={multiple}
                onChange={handleFileSelect}
                className="hidden"
            />
            <p className="text-xs text-gray-400">
                Supported: JPG, PNG, WebP (Max 5MB)
            </p>
        </div>
    );
};
