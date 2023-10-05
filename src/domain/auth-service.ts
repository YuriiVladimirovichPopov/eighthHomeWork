import { UserViewModel } from "../models/users/userViewModel";
import { usersRepository } from "../repositories/users-repository";
import  bcrypt  from "bcrypt";
import { ObjectId } from "mongodb";
import {UsersMongoDbType } from "../types";
import { error } from "console";
import add from "date-fns/add"
import { emailManager } from "../managers/email-manager";
import { accessTokenSecret1, refreshTokenSecret2, settings } from "../settings";
import  Jwt  from "jsonwebtoken";
import { usersCollection } from "../db/db";
import { randomUUID } from "crypto";


export const authService = {
    
    async createUser (login: string, email: string, password: string): Promise<UserViewModel | null> {
        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(password, passwordSalt)
        
        const newUser: UsersMongoDbType = {
            _id: new ObjectId(),
            login,
            email,
            passwordHash,
            passwordSalt,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: randomUUID(),
                expirationDate: add(new Date(), {
                    minutes: 60
                }),
                isConfirmed: false
            },
            refreshTokenBlackList: []
            
        }

        const createResult = usersRepository.createUser(newUser)
       
        try {
         const res = await emailManager.sendEmail(newUser)
         console.log('sendEmail:', res)
        } catch {
            console.error('send email error:', error)
        }
        return createResult
    },

    async checkCredentials (loginOrEmail: string, password: string) {
        const user = await usersRepository.findByLoginOrEmail(loginOrEmail)

        if (!user) return false
        
        const passwordHash = await this._generateHash(password, user.passwordSalt)
        if (user.passwordHash !== passwordHash) {
            return false
        }
        return user
    },

    async confirmEmail(code: string): Promise<UserViewModel | boolean> {
        let user = await usersRepository.findUserByConfirmationCode(code)
        if (!user) return false
        if (user.emailConfirmation.isConfirmed) return false
        if (user.emailConfirmation.confirmationCode !== code) return false
        if (user.emailConfirmation.expirationDate < new Date()) return false
            
        let result = await usersRepository.createUser(user)
            return result
    },

    async checkAndFindUserByToken(token: string) {
        try {
            const result: any = Jwt.verify(token, settings.JWT_SECRET)
            const user  = await usersRepository.findUserById(new ObjectId(result.userId))
            return user
        } catch (error) {
            return null
        }
    },

    async _generateHash(password: string, salt: string) {
        const hash = await bcrypt.hash(password, salt)
        return hash
    },

    async updateConfirmEmailByUser(userId: string): Promise<boolean> {    
        const foundUserByEmail = await usersCollection.updateOne({_id: new ObjectId(userId)}, {$set: {"emailConfirmation.isConfirmed": true}})
        return foundUserByEmail.matchedCount === 1 
    },
    //todo, may be finished!
    async findRefreshToken(token: string) {
        const result = await usersCollection.findOne({token})
        return result
    },

    async validateRefreshToken(refreshToken: string): Promise<any>{
        try {
          const payload = Jwt.verify(refreshToken, refreshTokenSecret2);
          return payload;
        } catch (error) {
          return null; // if token invalid
        }
    },

    async findTokenInBlackList(userId: string, token: string):Promise<boolean>{
        const userByToken = await usersCollection.findOne({id: userId, refreshTokenBlackList: {$in: [token]}})
        return !!userByToken
    },

    async refreshTokens(userId: string): Promise<{ accessToken: string, newRefreshToken: string }> {
        try {
          const accessToken = Jwt.sign({ userId }, accessTokenSecret1 , { expiresIn: '10s' });

          const newRefreshToken = Jwt.sign({ userId }, refreshTokenSecret2, { expiresIn: '20s' });
      
          return { accessToken, newRefreshToken };
        } catch (error) {
          throw new Error('Failed to refresh tokens');
        }
      }
}