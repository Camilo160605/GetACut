import { Router } from 'express';
import { registerHandler, loginHandler } from '../controllers/auth-controller';

export const authRouter = Router();

// POST /auth/register — public, clients only
authRouter.post('/register', registerHandler);

// POST /auth/login — public, all roles
authRouter.post('/login', loginHandler);
