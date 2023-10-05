import jwt from "jsonwebtoken"
import { accessTokenSecret1, refreshTokenSecret2, settings } from "../settings";
import { ObjectId } from "mongodb";
import { UsersMongoDbType } from '../types';

export const jwtService =  {
    async createJWT(user: UsersMongoDbType) {
        const token = jwt.sign({userId: user._id}, accessTokenSecret1, {expiresIn: '100sec'}) // 10sec
        return token
    },

    async getUserIdByToken(token: string) {
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET)
            return new ObjectId(result.userId)
        } catch (error) {
            return null;
        }
    },
    //todo, may be finished!
    async createRefreshToken(user: UsersMongoDbType) {
        const refToken = jwt.sign({userId: user._id}, refreshTokenSecret2, {expiresIn: '200sec'})  // 20sec
        return refToken;
    }
}