import { Router } from 'express';
import * as invitationsController from './invitations.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required)
router.post('/accept', invitationsController.acceptInvitation);
router.post('/complete', invitationsController.completeInvitation);

// Authenticated routes
router.get('/', authenticate, invitationsController.getInvitations);
router.delete('/:id', authenticate, invitationsController.cancelInvitation);
router.post('/:id/resend', authenticate, invitationsController.resendInvitation);

export default router;
