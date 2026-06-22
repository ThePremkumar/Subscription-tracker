import {Router} from 'express';

import authorize  from '../middlewares/auth.middleware.js';
import { getUser, getUsers } from '../controllers/user.controller.js';

const userRouter = Router();

// userRouter.get('/', (req,res) => {res.send( 'GET all users')});
userRouter.get('/', getUsers);
// /user - static parameter it get all user
// /:id - dynamic parameter
userRouter.get('/:id', authorize, getUser);

userRouter.post('/', (req,res) => {res.send({title: 'CREATE new user'})});

userRouter.put('/:id', (req,res) => {res.send({title: 'UPATE user'})});

userRouter.delete('/:id', (req,res) => {res.send({title: 'DELETE user'})});

export default userRouter;