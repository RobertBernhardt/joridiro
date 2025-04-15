import userModel, { IUser } from "../models/user.model";
import passport from 'passport'
import * as passportLocal from 'passport-local'
import bcrypt from 'bcryptjs'

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser((user: any, done: any) => {
    done(null, user);
}); 

passport.deserializeUser(async (user: any, done: any) => {
    userModel.findById(user._id, (err: any, user: IUser) => {
        // Don't send the password back
        const userObj = {
            _id: user._id.toString(),
            pfp: user.pfp,
            fullName: user.fullName,
            email: user.email,
            city: user.city,
            country: user.country,
            street: user.street,
            zip: user.zip_code,
            password: undefined, 
            vat_id: user.vat_id,
            tax_id: user.tax_id,
            sys_permissions: user.sys_permissions,
            email_verified: user.email_verified,
            admin_verified: user.admin_verified,
            contests: user.contests?.map((contest: any) => contest.toString())
        }
        done(err, userObj);
    });
});


passport.use(new LocalStrategy(
    (email, password, done) => {
        userModel.findOne({ email }, async (err: any, user: IUser) => {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (!user.email_verified) { return done(null, false); }
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) { return done(null, false); }
            return done(null, user);
        });
    }
))