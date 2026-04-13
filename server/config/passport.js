import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user.model.js';

export const setupPassport = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.EMAIL_CLIENT_ID,
        clientSecret: process.env.EMAIL_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL}/api/v1/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Pass full profile to callback 
            return done(null, profile);
        } catch (error) {
            return done(error);
        }
    }));

    // Serialize/deserialize 
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};