import { Response, Request, Router } from "express";
import { sendStatus } from './send-status';
import { RequestWithBody, RequestWithUser, UsersMongoDbType } from '../types';
import { jwtService } from "../application/jwt-service";
import { authMiddleware } from '../middlewares/validations/auth.validation';
import { UserViewModel } from '../models/users/userViewModel';
import { UserInputModel } from "../models/users/userInputModel";
import { usersRepository } from "../repositories/users-repository";
import { CodeType } from "../models/code";
import { createUserValidation } from "../middlewares/validations/users.validation";
import { authService } from "../domain/auth-service";
import { validateCode } from "../middlewares/validations/code.validation";
import { emailConfValidation } from "../middlewares/validations/emailConf.validation";
import { emailManager } from "../managers/email-manager";
import { usersCollection } from "../db/db";
import { randomUUID } from 'crypto';
import { add } from "date-fns";
import { error } from 'console';


export const authRouter = Router ({})

authRouter.post('/login', async(req: Request, res: Response) => {
    console.log(req.cookies, "hjkkldcsjhdf")
    const user = await authService.checkCredentials(req.body.loginOrEmail, req.body.password)
console.log(user)
    if (user) {
        const token = await jwtService.createJWT(user)
        const refreshToken = await jwtService.createRefreshToken(user)
console.log(refreshToken)
        res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})     //secure: true
        res.status(sendStatus.OK_200).send({accessToken: token})
        return
    } else {
        return res.sendStatus(sendStatus.UNAUTHORIZED_401)
    }
})

authRouter.get('/me', authMiddleware, async(req: RequestWithUser<UserViewModel>, res: Response) => {    
    if(!req.user){
        return res.sendStatus(sendStatus.UNAUTHORIZED_401)
    } else {
        return res.sendStatus(sendStatus.OK_200)
            .send({
            email: req.user.email,
            login: req.user.login,
            userId: req.user.id
        })
    }
})

authRouter.post('/registration-confirmation', validateCode, async(req: RequestWithBody<CodeType>, res: Response) => {
    const currentDate = new Date()
    
    const user = await usersRepository.findUserByConfirmationCode(req.body.code)
    
    if(!user) {
        return res.status(sendStatus.BAD_REQUEST_400).send({ errorsMessages: [{ message: 'User not found by this code', field: "code" }] })
    } 
    if (user.emailConfirmation.isConfirmed) {
        return res.status(sendStatus.BAD_REQUEST_400).send({ errorsMessages: [{ message: 'Email is confirmed', field: "code" }] })
    }
    if (user.emailConfirmation.expirationDate < currentDate ) {
        return res.status(sendStatus.BAD_REQUEST_400).send({ errorsMessages: [{ message: 'The code is exparied', field: "code" }] })
    }
    if (user.emailConfirmation.confirmationCode !== req.body.code) {  
        return res.status(sendStatus.BAD_REQUEST_400).send({ errorsMessages: [{ message: 'Invalid code', field: "code" }] })
    }
   
    await authService.updateConfirmEmailByUser(user._id.toString())
   

        return res.sendStatus(sendStatus.NO_CONTENT_204)
})

authRouter.post('/registration', createUserValidation, async(req: RequestWithBody<UserInputModel>, res: Response) => {
    const user = await authService.createUser(req.body.login, req.body.email, req.body.password)
    
    if (user) {
        return res.sendStatus(sendStatus.NO_CONTENT_204)
    } else {
        return res.sendStatus(sendStatus.BAD_REQUEST_400)
    }
})

authRouter.post('/registration-email-resending', emailConfValidation, async(req: RequestWithBody<UsersMongoDbType>, res: Response) => {
    
    const user = await usersRepository.findUserByEmail(req.body.email)
    if(!user) {
        return res.sendStatus(sendStatus.BAD_REQUEST_400)
    }

    if (user.emailConfirmation.isConfirmed) {
        return res.status(sendStatus.BAD_REQUEST_400).send({info: "isConfirmed" })
    }

    await usersCollection.updateOne({_id: user!._id}, {$set: {
            emailConfirmation: {confirmationCode: randomUUID(),
                                expirationDate: add(new Date(), {
                                    minutes: 60
                                }),
                                isConfirmed: false}}});
    
    const updatedUser = await usersCollection.findOne({_id: user!._id})
    
    try {
        await emailManager.sendEmail(updatedUser)
    } catch {
        error("email is already confirmed", error)
    }
        return res.sendStatus(sendStatus.NO_CONTENT_204)
})

authRouter.post('/refresh-token', async (req: Request, res: Response) => {
    try {
        //console.log(`Refresh token`, req.cookies)
    const refreshToken = req.cookies.refreshToken
        if (!refreshToken) return res.status(401).send({ message: 'Refresh token not found' })
//console.log(`Refresh token`, req.cookies)
    const isValid = await authService.validateRefreshToken(refreshToken);
    console.log('isValid', isValid) 
        if (!isValid) return res.status(401).send({ message: 'Invalid refresh token' });
          

    const user = await usersRepository.findUserById(isValid.userId);
    console.log('user', user)
        if(!user) return res.status(401).send({ message: 'User not found', isValid: isValid});

    const validToken = await  authService.findTokenInBlackList(user.id, refreshToken);
    if(validToken) return res.status(432).send({ message: 'Token'}) 

    const tokens = await authService.refreshTokens(user.id);

    await usersCollection.updateOne({id: user.id}, { $push : { refreshTokenBlackList: refreshToken } })

    res.cookie('refreshToken', tokens.newRefreshToken, {httpOnly: true, secure: true})
    return res.status(sendStatus.OK_200).send({ accessToken: tokens.accessToken })

    } catch(error) {
        console.error(error)
        return res.status(sendStatus.INTERNAL_SERVER_ERROR_500).send({ message: 'Server error'})

    }
})

authRouter.post('/logout', async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken    
        console.log('refreshToken', refreshToken)
           if (!refreshToken) return res.status(sendStatus.UNAUTHORIZED_401).send({ message: 'Refresh token not found' });
      
            const isValid = await authService.validateRefreshToken(refreshToken);    //вынести в мидлевару
        console.log('is valid', isValid)
            if (!isValid) return res.status(sendStatus.UNAUTHORIZED_401).send({ message: 'Invalid refresh token' });
            
        const user = await usersRepository.findUserById(isValid.user);
        if(!user) return res.sendStatus(sendStatus.UNAUTHORIZED_401);

        const validToken = await  authService.findTokenInBlackList(user.id, refreshToken); //userId
        
        if(validToken)return res.sendStatus(sendStatus.UNAUTHORIZED_401); 
    
    await usersCollection.updateOne({id: user.id}, { $push : { refreshTokenBlackList: refreshToken } });
        
            res.clearCookie('refreshToken', { httpOnly: true, secure: true });
            res.sendStatus(sendStatus.NO_CONTENT_204);
    } catch (error) {
        console.error(error)
        return res.status(sendStatus.INTERNAL_SERVER_ERROR_500).send({ message: 'Server error'})
    }
})
