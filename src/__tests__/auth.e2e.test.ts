import request  from "supertest"
import { app } from '../settings';
import { authorizationValidation } from "../middlewares/input-validation-middleware";
import { RouterPaths } from "../routerPaths";
import { MongoClient } from "mongodb";


const getRequest = () => {
    return request(app)
}

let connection: any
let db: any

describe('tests for /blogs', () => {
    beforeAll(async () => {
        connection = await MongoClient.connect (process.env.mongoUrl!, 
            {// @ts-ignore
                useNewUrlParser: true, 
                useUnifiedTopology: true
            });
              db = await connection.db();
            await getRequest()
            .delete('/all-data')
    })
      
    beforeAll(async () => {
        authorizationValidation 
    })

    afterAll(async () => {
        await connection.close()
    })


    it ('should create new user and send confirmation email with code', async () => {
        const users = db.collection('users');

    const mockUser = {_id: 'some-user-id', name: 'John'};
    await users.insertOne(mockUser);

    const insertedUser = await users.findOne({_id: 'some-user-id'});
    expect(insertedUser).toEqual(mockUser);
    })

    it ('should return error if email or login already exist', async () => {
        await getRequest()
        .post()
        expect()
    })

    it ('should send email with new code if user exists but not confirmed yet', async () => {
        await getRequest()
        .post()
        .expect()
    })

    it ('should confirm registration by email', async () => {
        await getRequest()
        .post()
        .expect()
    })

    it ('should return error if code already confirmed', async () => {
        await getRequest()
        .post()
        .expect()
    })

    it ('should return error if email already confirmed', async () => {
        await getRequest()
        .post()
        .expect()
    })

    it ('should sign in user', async () => {
        await getRequest()
        .post()
        .expect()  
    })

    it ('should return error if passed body is incorrect', async () => {
        await getRequest()
        .post()
        .expect()
    })

    it ('should return error if code doesnt exist', async () => {
        await getRequest()
        .post()
        .expect()
    })

    it ('should return error if user email doesnt exist', async () => {
        await getRequest()
        .post()
        .expect()
    })

    it (`"/auth/login": 
        should sign in user; status 200; content: JWT 'access' token, JWT 'refresh' token in cookie (http only, secure);`, async () => {
        const loginOrEmail = ''
        const password = ''
        
            const responce = await getRequest()
        .post()
        .expect()
    })

    it (`"/auth/me": 
        should return the error when the 'access' token has expired or there is no one in the headers; status 401`, async () => {
            await getRequest()
            .get()
            .expect()
    })

    it (`"/auth/refresh-token", "/auth/logout": 
        should return an error when the "refresh" token has expired or there is no one in the cookie; status 401`, async () => {
            await getRequest()
        .post()
        .expect()
    })

    it (`"/auth/refresh-token": 
        should return new 'refresh' and 'access' tokens; status 200; 
        content: new JWT 'access' token, new JWT 'refresh' token in cookie (http only, secure)`, async () => {
            await getRequest()
        .post()
        .expect()
    })

    it (`"/auth/refresh-token", "/auth/logout": 
        should return an error if the "refresh" token has become invalid; status 401`, async () => {
            await getRequest()
        .post()
        .expect()
    })
    
    it (`"/auth/me": should check "access" token and return current user data; status 200; content: current user data`, async () => {
        await getRequest()
        .get()
        .expect()
    })

    it (`"/auth/logout": should make the 'refresh' token invalid; status 204`, async () => {
        await getRequest()
        .post()
        .expect()
    })

    it (` "/auth/refresh-token", "/auth/logout": should return an error if the "refresh" token has become invalid; status 401`, async () => {
        await getRequest()
        .post()
        .expect()
    })
})