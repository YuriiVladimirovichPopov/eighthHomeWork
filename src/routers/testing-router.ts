import { Request, Response, Router } from "express"
import { blogsRepository } from "../repositories/blogs-repository"
import { postsRepository } from "../repositories/posts-repository"
import { usersRepository } from '../repositories/users-repository';
import { commentsRepository } from "../repositories/comments-repository";

export const testingRouter = Router()

testingRouter.delete('/all-data', (req: Request, res: Response) => {
    blogsRepository.deleteAllBlogs()
    postsRepository.deleteAllPosts()
    usersRepository.deleteAllUsers()
    commentsRepository.deleteAllComment()
    res.status(204).send('All data is deleted')
})