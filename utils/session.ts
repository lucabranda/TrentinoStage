import { loadEnvConfig } from "@next/env"
import crypto from "crypto"
import { sessionConfig } from "./config"

import { connectDB } from "./db"
import auth_tokens from "./model/auth_tokens"

import { cookies } from 'next/headers'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

const tokenDuration = sessionConfig.duration * 24 * 60 * 60 * 1000


// Functions to manage the session

export async function checkSessionToken(token: string) {
    // Check if the token is valid and return the user id
 
    await connectDB()

    const sess = await auth_tokens.findOne({token: token, generation_time: {$gt: new Date(new Date().getTime() - tokenDuration)}})

    if (!sess) {
        return null
    }

    return sess.user_id
}

export async function checkExpiredTokens(uid: string) {
    // Check if the user has any expired tokens and remove them

    await connectDB()

    await auth_tokens.deleteMany({user_id: uid, generation_time: {$lt: new Date(new Date().getTime() - tokenDuration)}})
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

export async function isLoggedIn(){
    const cookieStore = await cookies();
    const token = await cookieStore.get('trentino-stage-session')?.value || "";
    const isLoggedIn = await checkSessionToken(token);
    return isLoggedIn ? true : false;
}