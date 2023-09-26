import  express from 'express'
import cors from 'cors'
import { blogsRouter } from './routers/blogs-router';
import { postsRouter } from './routers/posts-router';
import { testingRouter } from './routers/testing-router';
import { usersRouter } from './routers/users-router';
import { authRouter } from './routers/auth-router';
import { commentsRouter } from './routers/comment-router';
import { emailsRouter } from './routers/email-router';
import cookieParser from 'cookie-parser';


export const app = express()
const corsMiddleware = cors();
app.use(corsMiddleware)
const jsonBodyMiddleware = express.json()
app.use(jsonBodyMiddleware)

export const settings = {
    JWT_SECRET: process.env.JWT_SECRET || "1234",

}

app.use('/blogs', blogsRouter)

app.use('/posts', postsRouter)

app.use('/users', usersRouter)

app.use('/auth', authRouter)

app.use('/comments', commentsRouter)

app.use('/emails', emailsRouter)

app.use('/testing', testingRouter)

app.use(cookieParser())