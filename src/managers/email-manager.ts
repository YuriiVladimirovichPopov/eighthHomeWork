import { emailAdapter } from '../adapters/email-adapter';
import { EmailConfirmationType } from '../models/users/userViewModel';

export const emailManager = {
    async sendEmail(newUser: any) {
        
       return emailAdapter.sendEmail(newUser.email, 'code', newUser.emailConfirmation.confirmationCode )
    }
}