import { PaginatedType } from "../routers/helpers/pagination";
import { UserViewModel } from "../models/users/userViewModel";
import { usersRepository } from "../repositories/users-repository";
import { PaginatedUser } from "../models/users/paginatedQueryUser";
import  bcrypt  from "bcrypt";
import { ObjectId } from "mongodb";
import {UsersMongoDbType } from "../types";
import { error } from "console";
import { v4 as uuidv4 } from "uuid";
import add from "date-fns/add"
import { emailManager } from "../managers/email-manager";
import { settings } from "../settings";
import  Jwt  from "jsonwebtoken";


export const QueryUserRepository = {
    
    async findAllUsers(pagination: PaginatedType): Promise<PaginatedUser<UserViewModel[]>> {     //tyt nado dobavit functions
        
        return await usersRepository.findAllUsers(pagination)
    },

    async findUserById (id: ObjectId): Promise<UserViewModel | null> {
        return usersRepository.findUserById(id)

    },

    async deleteUserById(id: string): Promise<boolean> {
        return await usersRepository.deleteUser(id)
        }

}