import { Router } from 'express';
import { createAccount, updateAccount, deleteAccount, login } from '../controllers/authController.js';

const authRouter = Router();

authRouter.post('/signup', createAccount);
authRouter.post('/user/:email', updateAccount);
authRouter.delete('', deleteAccount);
authRouter.post('/login', login);

export { authRouter };
