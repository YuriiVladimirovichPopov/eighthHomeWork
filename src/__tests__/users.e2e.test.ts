import request  from "supertest"
import { app } from '../settings';
import { authorizationValidation } from "../middlewares/input-validation-middleware";
import { sendStatus } from "../routers/send-status";
import { UserViewModel } from "../models/users/userViewModel";
import { UserInputModel } from "../models/users/userInputModel";
import { createUser } from "../__tests__/user-test-helpers";
import { usersCollection } from '../db/db';
import { RouterPaths } from "../routerPaths";


const getRequest = () => {
    return request(app)
}
describe('tests for /users', () => {
    beforeAll(async () => {
        await getRequest()
        .delete('/testing/all-data')
    })
      
    beforeAll(async () => {
        authorizationValidation 
    })
    
    it("should return 200 and user", async () => {
        await getRequest()
                .get(RouterPaths.users)
                .expect(sendStatus.OK_200)
    })
    
    it ("should return 404 for not existing user", async () => {
        await getRequest()
                .get(`${RouterPaths.users}/999999`)
                .expect(sendStatus.NOT_FOUND_404)
    })

    it ("shouldn't create a new user without auth", async () => {
        await getRequest().post(RouterPaths.users).send({}).expect(sendStatus.UNAUTHORIZED_401)

        await getRequest().post(RouterPaths.users).auth('login', 'password').send({}).expect(sendStatus.UNAUTHORIZED_401)  
    })

    it ("shouldn't create a new user with incorrect input data", async () => {
        const data: UserViewModel = {
            id: '',
            login: '',
            email: '',
            createdAt: '',
            emailConfirmation: {
                isConfirmed: false,
                confirmationCode: " ",
                expirationDate: new Date()
            }
        }
            
        await getRequest()
                .post(RouterPaths.users)
                .send(data)
                .expect(sendStatus.UNAUTHORIZED_401)
        
        await getRequest()
                .get(RouterPaths.users)
                .expect(sendStatus.OK_200)
    })

    let createdUser1: UserViewModel

    it ("should create a new user with correct input data", async () => {
        const countOfUsersBefore = await usersCollection.countDocuments()   
        expect(countOfUsersBefore).toBe(0)
        const inputModel: UserInputModel = {
            login: 'new user1',
            email: 'blabla@email.com',
            password: 'www.youtube.com',
        }

        const createResponse = await createUser(inputModel)

        const createdUser: UserViewModel = createResponse.body
        expect(createdUser).toEqual({
            id: expect.any(String),
            login: inputModel.login,
            email: inputModel.email,
            createdAt: expect.any(String),
            emailConfirmation:  {
                confirmationCode: expect.any(String),
                expirationDate: expect.any(String),
                isConfirmed: false
            }
        })

        expect(createResponse.status).toBe(sendStatus.CREATED_201)
            
        const countOfUsersAfter = await usersCollection.countDocuments()
        expect(countOfUsersAfter).toBe(1)
    
        createdUser1 = createdUser
        expect.setState({ user1: createdUser})
    })
    
    it ("should create one more user with correct input data", async () => {
        const inputModel: UserInputModel = {
            login: 'new user2',
            email: 'newuser@example.com',
            password: 'new user pass'
        }

        const createResponse = await createUser(inputModel)

        expect.setState({ user2: createResponse.body})
    })

    it ("should delete both users", async () => {
        const {user1, user2} = expect.getState()

        await getRequest()
                .delete(`${RouterPaths.users}/${user1.id}`)   
                .auth('admin', 'qwerty')
                .expect(sendStatus.NO_CONTENT_204)

        await getRequest()
                .delete(`${RouterPaths.users}/${user2.id}`)
                .auth('admin', 'qwerty')
                .expect(sendStatus.NO_CONTENT_204)
    })
})
    
    


        