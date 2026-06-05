import Router from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { submitProblem } from '../controllers/submit.controller.js';

const router = Router();

router.route('/:problemId/submit').post(authenticateUser, submitProblem);

export default router;