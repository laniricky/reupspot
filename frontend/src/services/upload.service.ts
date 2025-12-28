import { api } from './api';

export interface UploadResponse {
    success: boolean;
    url: string;
    filename: string;
    size: number;
    mimetype: string;
}

export interface MultiUploadResponse {
    success: boolean;
    files: UploadResponse[];
    count: number;
}

export const uploadService = {
    /**
     * Upload a single image
     */
    uploadImage: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post<UploadResponse>('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    /**
     * Upload multiple images
     */
    uploadMultipleImages: async (files: File[]): Promise<MultiUploadResponse> => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('images', file);
        });

        const response = await api.post<MultiUploadResponse>('/upload/images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    /**
     * Delete an uploaded image
     */
    deleteImage: async (filename: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete<{ success: boolean; message: string }>(`/upload/${filename}`);
        return response.data;
    },
};
