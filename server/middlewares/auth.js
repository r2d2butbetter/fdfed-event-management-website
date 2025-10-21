import { getUser } from '../services/auth.js';

async function isAuth(req, res, next) {
    const userId = req.session.userId;

    // If no userId is found in cookies, redirect to login
    if (!userId) {
        return res.redirect("/login");
    }

    // Fetch user from the in-memory store
    const user = getUser(userId);

    // If no user is found, redirect to login
    if (!user) {
        return res.redirect("/login");
    }

    // Attach the user to the request object for downstream use
    req.user = user;
    res.locals.isAuth = !!user;

    // Proceed to the next middleware
    next();
}

async function optionalAuth(req, res, next) {
    const userId = req.cookies.uid;

    // Try to fetch the user if the session exists
    if (userId) {
        const user = getUser(userId);
        if (user) {
            req.user = user;
            // res.locals.user = user; // Optional: Make user globally available in templates
            res.locals.isAuth = true;
        }
    }

    // If no user is found, just proceed without redirect
    res.locals.isAuth = !!req.user;

    // Proceed to the next middleware
    next();
}
export  {isAuth,optionalAuth};


