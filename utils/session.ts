import { loadEnvConfig } from "@next/env"
import { DBClient } from "./db"
import crypto from "crypto"

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

export async function createSessionToken(uid: string) {
    // Create a new session token for the user

    checkExpiredTokens(uid)

    const sessions = db.selectCollection("auth_tokens")
    const token = crypto.randomBytes(64).toString("hex")
    const date = new Date().toISOString()
    await sessions.insertOne({user_id: uid, generation_time: date ,token: token})
    return token
}