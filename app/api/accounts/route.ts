/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Retrieve account information based on session token
 *     description: Fetches the role and profile ID of an account using a valid session token.
 *     tags: [Accounts]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The session token of the account.
 *     responses:
 *       200:
 *         description: Successfully retrieved account information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role:
 *                   type: string
 *                   description: The role of the account.
 *                 profileId:
 *                   type: string
 *                   description: The profile ID associated with the account.
 *       401:
 *         description: Unauthorized or invalid session token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                 code:
 *                   type: string
 *                   description: Error code.
 *
 *   post:
 *     summary: Create a new account
 *     description: Registers a new account with email, password, and optional invitation token or role.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the new account.
 *               password:
 *                 type: string
 *                 description: The password for the new account.
 *               role:
 *                 type: string
 *                 description: The role of the new account (required if no invitation token is provided).
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
 *               role:
 *                 type: string
 *                 description: The role of the new account (required if no invitation token is provided).
 *     parameters:
 *       - in: query
 *         name: token
 *         required: false
 *         schema:
 *           type: string
 *         description: An optional invitation token for account creation.
 *     responses:
 *       200:
 *         description: Successfully created a new account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The session token for the newly created account.
 *       401:
 *         description: Unauthorized or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                 code:
 *                   type: string
 *                   description: Error code.
 *       405:
 *         description: Unsupported content type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */
import { NextRequest, NextResponse } from "next/server"
import bycript from "bcrypt"
import { createSessionToken } from "@/utils/session"

import { connectDB, checkBsonFormat } from "@/utils/db"
import accounts from "@/utils/model/accounts"
import invite_tokens from "@/utils/model/invite_tokens"
import { checkSessionToken } from "@/utils/session"
import { getAccountInfo } from "@/utils/accounts"


// Get the account information (role and profile_id) given the session token
export async function GET(req: NextRequest) {
    const connection = connectDB()

    const token = req.nextUrl.searchParams.get("token") as string

    if (!token) {
        return NextResponse.json({error: "Missing required fields", code: "error-missing-fields"}, { status: 401 })
    }

    const accountId = await checkSessionToken(token)

    if (!accountId) {
        return NextResponse.json({error: "Invalid session token", code: "error-invalid-session"}, { status: 401 })
    }

    await connection
    const account = await getAccountInfo(accountId)

    return NextResponse.json({ email: account.email, role: account.role, profileId: account.profile_id }, { status: 200 })
}


// Creates the account
export async function POST(req: NextRequest) {
    const connection = connectDB()

    let formData
    const contentType = req.headers.get("content-type") ?? ""

    if (contentType.includes("multipart/form-data")) {
        formData = await req.formData()
    } else if (contentType.includes("application/json")) {
        const jsonData = await req.json()
        formData = new Map(Object.entries(jsonData))
    } else {
        return new NextResponse(JSON.stringify({error: "Unsupported content type"}), { status: 405 })
    }

    const email = formData.get("email") as string ?? null
    const password = formData.get("password") as string ?? null
    const token = req.nextUrl.searchParams.get('token') ?? null
    const role = formData.get("role") as string ?? null

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

    await connection

    if (token !== null) {
        // register with an invitation token
        const invite = await invite_tokens.findOne({token: token, is_used: false, expires_at: {$gt: new Date().toISOString()}})
        if (invite !== null) {
            const result = await accounts.create({email: email, password: hash, profile_id: invite.profile_id, is_verified: false, last_modified_password: date, role: invite.role})
            await result.save()
            sessionToken = await createSessionToken(result.insertedId.toHexString())
        } else {
            return new NextResponse(JSON.stringify({error: "Invalid invitation token", code: "error-invalid-invtation"}), { status: 401 })
        }
    } else {
        // register without an invitation token

        // Check if the role is set
        if (!checkRole(role)) {
            return new NextResponse(JSON.stringify({error: "Role is required", code: "error-role-required"}), { status: 401 })
        }

        const result = await accounts.create({email: email, password: hash, profile_id: null, is_verified: false, last_modified_password: date, role: role}) // The profile_id will be set later
        await result.save()
    
        sessionToken = await createSessionToken(result._id.toHexString())
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

function checkRole(role: string): boolean {
    const roles = ["user", "company-manager", "company-employee"]
    return roles.includes(role)
}