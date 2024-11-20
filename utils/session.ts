import { loadEnvConfig } from "@next/env"
import crypto from "crypto"
import { sessionConfig } from "./config"

import connectDB from "./db"
import auth_tokens from "./model/auth_tokens"

const projectDir = process.cwd()
loadEnvConfig(projectDir)

const tokenDuration = sessionConfig.duration * 24 * 60 * 60


// Functions to manage the session

export async function checkSessionToken(token: string) {
    // Check if the token is valid and return the user id
 
    await connectDB()

    const sess = await auth_tokens.findOne({token: token, generation_time: {$lt: new Date(new Date().getTime() + tokenDuration).toISOString()}})

    if (!sess) {
        return null
    }

    return sess.user_id
}

export async function checkExpiredTokens(uid: string) {
    // Check if the user has any expired tokens and remove them

    await connectDB()

    await auth_tokens.deleteMany({user_id: uid, generation_time: {$lt: new Date(new Date().getTime() - tokenDuration).toISOString()}})
}

export async function createSessionToken(uid: string) {
    // Create a new session token for the user

    const promise = checkExpiredTokens(uid)

    await connectDB()

    const token = crypto.randomBytes(32).toString("hex")
    const date = new Date().toISOString()
    
    const session = await auth_tokens.create({user_id: uid, generation_time: date ,token: token})
    await session.save()
    await promise
    return token
}