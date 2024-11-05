import { loadEnvConfig } from "@next/env"
import { DBClient } from "./db";

const projectDir = process.cwd()
loadEnvConfig(projectDir)

if (!process.env.TOKEN_DURATION) {
    throw new Error("TOKEN_DURATION is not defined");
}
const tokenDuration = parseInt(process.env.TOKEN_DURATION, 10);
const db = new DBClient()

// Functions to manage the session

export async function checkSessionToken(token: string) {
    // Check if the token is valid and return the user id
    const sessions = db.selectCollection("auth_tokens")

    const session = await sessions.findOne({token: token, generation_time: {$lt: new Date(new Date().getTime() + tokenDuration * 1000).toISOString()}})

    if (!session) {
        return null
    } 
    return session.user_id
}

export async function checkExpiredTokens(uid: string) {
    // Check if the user has any expired tokens and remove them

    const sessions = db.selectCollection("auth_tokens")

    if (!process.env.TOKEN_DURATION) {
        throw new Error("TOKEN_DURATION is not defined");
    }
    
    await sessions.deleteMany({user_id: uid, generation_time: {$lt: new Date(new Date().getTime() + tokenDuration * 1000).toISOString()}})
}