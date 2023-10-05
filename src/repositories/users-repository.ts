import { ObjectId} from "mongodb";
import { usersCollection } from "../db/db";
import { UsersMongoDbType } from '../types';
import { UserPagination } from "../routers/helpers/pagination";
import { UserViewModel } from '../models/users/userViewModel';
import { PaginatedUser } from "../models/users/paginatedQueryUser";


export const usersRepository = {

    _userMapper(user: UsersMongoDbType): UserViewModel {
        return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,             
            createdAt: user.createdAt,
            emailConfirmation: user.emailConfirmation
            //passwordHash: user.passwordHash,
            //passwordSalt: user.passwordSalt
        }
    },

    async findAllUsers(pagination: UserPagination): Promise<PaginatedUser<UserViewModel[]>> {
        let filter = {};
        if(pagination.searchEmailTerm && pagination.searchLoginTerm){
            filter = { $or:[{email: {$regex: pagination.searchEmailTerm, $options: 'i'}}, 
                            {login: {$regex: pagination.searchLoginTerm, $options: 'i'}}]}
        }
        else if (pagination.searchEmailTerm ) {
            filter = {email:  { $regex: pagination.searchEmailTerm, $options: 'i'} }              
        }
        else if (pagination.searchLoginTerm) {
            filter = {login: { $regex: pagination.searchLoginTerm, $options: 'i'}}
        }

        const result: UsersMongoDbType[] =
        await usersCollection.find(filter, {projection: {passwordSalt: 0, passwordHash: 0}}) 
            
          .sort({[pagination.sortBy]: pagination.sortDirection})
          .skip(pagination.skip)
          .limit(pagination.pageSize)
          .toArray()

                    
          const totalCount: number = await usersCollection.countDocuments(filter)
          const pageCount: number = Math.ceil(totalCount / pagination.pageSize)
    
          const res: PaginatedUser<UserViewModel[]> = {
            pagesCount: pageCount,
            page: pagination.pageNumber,
            pageSize: pagination.pageSize,
            totalCount: totalCount,
            items: result.map(b => this._userMapper(b))
            }
          return res
    },

    async findUserById(id: ObjectId):Promise<UserViewModel | null> {
        const userById = await usersCollection.findOne({_id: new ObjectId(id)}, {projection: {passwordSalt: 0, passwordHash: 0}})
        if(!userById) {
            return null
        }
            return this._userMapper(userById)
    }, 
    
    async findByLoginOrEmail(loginOrEmail: string) {
        const user = await usersCollection.findOne({$or: [{email: loginOrEmail}, {login: loginOrEmail}]})
        return user
    },

    async findUserByEmail(email: string) {
        const user = await usersCollection.findOne({email: email})
        return user
    },

    async findUserByConfirmationCode(emailConfirmationCode: string) {
        const user = await usersCollection.findOne({"emailConfirmation.confirmationCode": emailConfirmationCode})
        return user
    },
    
    async createUser(newUser: UsersMongoDbType): Promise<UserViewModel> { 
        await usersCollection.insertOne(newUser)
        return this._userMapper(newUser)
    },

    async deleteUser(id: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) {
            return false
        }
        
        const foundUserById = await usersCollection.deleteOne({_id: new ObjectId(id)})
        
        return foundUserById.deletedCount === 1
    }, 
   
    async deleteAllUsers(): Promise<boolean> {
        try {
            const result = await usersCollection.deleteMany({});
            return result.acknowledged === true
        } catch (error) {
            return false
        }
    }
}



