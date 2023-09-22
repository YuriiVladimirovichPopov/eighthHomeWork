import request  from "supertest"
import { app } from '../settings';
import { authorizationValidation } from "../middlewares/input-validation-middleware";
import { sendStatus } from "../routers/send-status";
import { BlogViewModel } from "../models/blogs/blogsViewModel";
import { BlogInputModel } from '../models/blogs/blogsInputModel';
import { createBlog } from "./blog-test-helpers";
import { blogsCollection, postsCollection } from '../db/db';
import { RouterPaths } from "../routerPaths";
import { async } from "rxjs";


const getRequest = () => {
    return request(app)
}
describe('tests for /blogs', () => {
    beforeAll(async () => {
        await getRequest()
        .delete('/testing/all-data')
    })
      
    beforeAll(async () => {
        authorizationValidation 
    })


    it ('should create new user and send confirmation email with code', async () => {

    })

    it ('should return error if email or login already exist', async () => {

    })

    it ('should send email with new code if user exists but not confirmed yet', async () => {

    })

    it ('should confirm registration by email', async () => {

    })

    it ('should return error if code already confirmed', async () => {

    })

    it ('should return error if email already confirmed', async () => {

    })

    it ('should sign in user', async () => {
        
    })

    it ('should return error if passed body is incorrect', async () => {

    })

    it ('should return error if code doesnt exist', async () => {

    })

    it ('should return error if user email doesnt exist', async () => {

    })
})