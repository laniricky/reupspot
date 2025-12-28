import { Router } from 'express';
import { uploadImage, uploadMultipleImages, deleteImage } from './upload.controller';
import { uploadSingle, uploadMultiple } from '../../middleware/multer.middleware';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/upload/image
 * @desc    Upload a single image
 * @access  Private (authenticated users)
 */
router.post('/image', uploadSingle('image'), uploadImage);

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images (max 5)
 * @access  Private (authenticated users)
 */
router.post('/images', uploadMultiple('images', 5), uploadMultipleImages);

/**
 * @route   DELETE /api/upload/:filename
 * @desc    Delete an uploaded image
 * @access  Private (authenticated users)
 */
router.delete('/:filename', deleteImage);

export default router;
