import session from 'express-session';
declare module 'express-session' {
    export interface SessionData {
        [key: string]: any;
    }
}

declare global {
    namespace Express {
        interface User {
            [key: string]: any;
        }
    }
}

