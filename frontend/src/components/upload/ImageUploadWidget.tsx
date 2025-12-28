import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface ImageUploadWidgetProps {
    onUploadSuccess: (url: string) => void;
    onUploadError?: (error: string) => void;
    accept?: string;
    maxSizeMB?: number;
    buttonText?: string;
    className?: string;
}

export function ImageUploadWidget({
    onUploadSuccess,
    onUploadError,
    accept = 'image/jpeg,image/png,image/webp',
    maxSizeMB = 5,
    buttonText = 'Upload Image',
    className = ''
}: ImageUploadWidgetProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        // Check file type
        if (!accept.split(',').some(type => file.type.match(type.trim()))) {
            return 'Invalid file type. Please upload a JPEG, PNG, or WebP image.';
        }

        // Check file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return `File size must be less than ${maxSizeMB}MB`;
        }

        return null;
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            onUploadError?.(validationError);
            return;
        }

        setError(null);

        // Show preview
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        // Upload file
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('image', file);

            const response = await api.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onUploadSuccess(response.data.url);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Failed to upload image';
            setError(errorMessage);
            onUploadError?.(errorMessage);
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleClearPreview = () => {
        setPreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {!preview ? (
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                        id="image-upload"
                    />
                    <label
                        htmlFor="image-upload"
                        className={`
                            flex flex-col items-center justify-center 
                            w-full h-48 border-2 border-dashed rounded-lg 
                            cursor-pointer transition-colors
                            ${uploading ? 'border-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}
                        `}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {uploading ? (
                                <>
                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                                    <p className="text-sm text-gray-500">Uploading...</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">{buttonText}</span>
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        PNG, JPG, WebP (max {maxSizeMB}MB)
                                    </p>
                                </>
                            )}
                        </div>
                    </label>
                </div>
            ) : (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                                <p className="text-white text-sm">Uploading...</p>
                            </div>
                        </div>
                    )}
                    {!uploading && (
                        <button
                            onClick={handleClearPreview}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                            title="Remove image"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    <ImageIcon size={16} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
