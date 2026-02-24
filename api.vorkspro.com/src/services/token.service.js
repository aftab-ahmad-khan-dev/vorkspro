import jwt from "jsonwebtoken";

const tokenSecret = process.env.TOKEN_SECRET_KEY;

/**
 * Function to generate JWT tokens.
 * @param {Object} user - User details to embed in the token payload.
 * @returns {string} - Signed JWT token.
 */
export const tokenCreator = (user, expiresIn) => {
    return jwt.sign(user, tokenSecret, { expiresIn: expiresIn ?? "7d" });
};
