import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../types';
import * as bulkImportController from './bulk-import.controller';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.use(authenticate);
router.use(authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN));

router.get('/', bulkImportController.getImportOptions);
router.get('/:entity/template', bulkImportController.downloadTemplate);
router.get('/:entity/reference', bulkImportController.downloadReference);
router.post('/:entity/upload', upload.single('file'), bulkImportController.uploadCsv);

export default router;
