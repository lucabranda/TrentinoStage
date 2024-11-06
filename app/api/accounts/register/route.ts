import { NextRequest, NextResponse } from "next/server"
import { DBClient } from "@/utils/db"
import bycript from "bcrypt"
import { createSessionToken } from "@/utils/session"

// Creates the account but leaves the profile_id as null. It will have to be set later with the profiles/create/new-profile endpoint.
// If the link contains an invitation token the account will be automatically connected to the profile
// Returns the session token
export async function POST(req: NextRequest) {

    let formData
    const contentType = req.headers.get("content-type") ?? ""

    if (contentType.includes("multipart/form-data")) {
        formData = await req.formData()
    } else {
        return new NextResponse("Unsupported content type", { status: 400 })
    }

    const db = new DBClient()
    const accounts = db.selectCollection("accounts")
    const inviteTokens = db.selectCollection("invite_tokens")

    const email = formData.get("email") as string ?? null
    const password = formData.get("password") as string ?? null
    const token = req.nextUrl.searchParams.get('token') ?? null

    // Check if the email is valid and not already in use
    if (!validatEmail(email)) {
        return new NextResponse("Email is invalid", { status: 400 })
    }
    const existing = await accounts.findOne({email: email})
    if (existing !== null) {
        return new NextResponse("Email is already in use", { status: 400 })
    }

    // Check if the password is valid
    if (!validatePassword(password)) {
        return new NextResponse("Password does not respect the minimum requirments", { status: 400 })
    }

    // Create the account on the database
    const hash = await bycript.hash(password, 10)
    const date = new Date().toISOString()

    if (token !== null) {
        // register with an invitation token
        const invite = await inviteTokens.findOne({token: token, is_used: false, expires_at: {$gt: new Date().toISOString()}})
        if (invite !== null) {
            await accounts.insertOne({email: email, password: hash, profile_id: invite.profile_id, is_verified: false, last_modified_password: date})
            return new NextResponse("Account created and connected to the profile", { status: 200 })
        } else {
            return new NextResponse("Invalid token", { status: 400 })
        }
    }

    // register without an invitation token
    const result = await accounts.insertOne({email: email, password: hash, profile_id: null, is_verified: false, last_modified_password: date}) // The profile_id will be set later

    const sessionToken = await createSessionToken(result.insertedId.toHexString())

    return new NextResponse(JSON.stringify({token: sessionToken}), { status: 200 })
}

function validatEmail(email: string): boolean {
    // Check if the email is valid
    if (email === null) {
        return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return false
    }
    return true
}

function validatePassword(password: string): boolean {
    // Check if the password is valid (at least 8 characters, 1 uppercase, 1lowercase and 1 number)
    if (password === null) {
        return false
    }
    if (password.length < 8) {
        return false
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(password)) {
        return false
    }
    return true
}