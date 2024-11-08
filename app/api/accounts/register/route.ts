import { NextRequest, NextResponse } from "next/server"
import { DBClient } from "@/utils/db"
import bycript from "bcrypt"
import { createSessionToken } from "@/utils/session"

// Creates the account but leaves the profile_id as null. It will have to be set later with the profiles/create/new-profile endpoint.
// If the link contains an invitation token the account will be automatically connected to the profile
// Returns the session token

/**
 * @swagger
 * /api/accounts/register:
 *   post:
 *     summary: Register a new account
 *     description: Creates a new account. If an invitation token is provided, the account will be connected to the profile associated with the token. Returns a session token upon successful registration.
 *     tags: ["Accounts"]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the new account.
 *               password:
 *                 type: string
 *                 description: The password for the new account.
 *     parameters:
 *       - in: query
 *         name: token
 *         type: string
 *         required: false
 *         description: Invitation token to connect the account to a profile.
 *     responses:
 *       200:
 *         description: Account created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Session token for the newly created account.
 *       401:
 *         description: Bad request. Possible reasons include invalid email, email already in use, invalid password, or invalid invitation token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Error message explaining the reason for failure."
 *                   example: "Email is already in use"
 *       405:
 *         description: "Unsupported content type."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Error message explaining the reason for failure."
 *                   example: "Unsupported content type"
 */
export async function POST(req: NextRequest) {

    let formData
    const contentType = req.headers.get("content-type") ?? ""

    if (contentType.includes("multipart/form-data")) {
        formData = await req.formData()
    } else {
        return new NextResponse(JSON.stringify({error: "Unsupported content type"}), { status: 405 })
    }

    const db = new DBClient()
    const accounts = db.selectCollection("accounts")
    const inviteTokens = db.selectCollection("invite_tokens")

    const email = formData.get("email") as string ?? null
    const password = formData.get("password") as string ?? null
    const token = req.nextUrl.searchParams.get('token') ?? null

    // Check if the email is valid and not already in use
    if (!validatEmail(email)) {
        return new NextResponse(JSON.stringify({error: "Email is invalid", code: "error-invalid-email"}), { status: 401 })
    }
    const existing = await accounts.findOne({email: email})
    if (existing !== null) {
        return new NextResponse(JSON.stringify({error: "Email is already in use", code: "error-email-already-used"}), { status: 401 })
    }

    // Check if the password is valid
    if (!validatePassword(password)) {
        return new NextResponse(JSON.stringify({error: "Password does not respect the minimum requirments", code: "error-password-insufficent"}), { status: 401 })
    }

    // Create the account on the database
    const hash = await bycript.hash(password, 10)
    const date = new Date().toISOString()

    let sessionToken

    if (token !== null) {
        // register with an invitation token
        const invite = await inviteTokens.findOne({token: token, is_used: false, expires_at: {$gt: new Date().toISOString()}})
        if (invite !== null) {
            const result = await accounts.insertOne({email: email, password: hash, profile_id: invite.profile_id, is_verified: false, last_modified_password: date})
            sessionToken = await createSessionToken(result.insertedId.toHexString())
        } else {
            return new NextResponse(JSON.stringify({error: "Invalid invitation token", code: "error-invalid-invtation"}), { status: 401 })
        }
    } else {
        // register without an invitation token
        const result = await accounts.insertOne({email: email, password: hash, profile_id: null, is_verified: false, last_modified_password: date}) // The profile_id will be set later
    
        sessionToken = await createSessionToken(result.insertedId.toHexString())
    }


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