import { NextResponse, NextRequest } from "next/server"
import { createSessionToken, checkSessionToken } from "@/utils/session"
import bcrypt from "bcrypt"
import { ObjectId } from "mongodb"

import { connectDB } from "@/utils/db"
import accounts from "@/utils/model/accounts"
import auth_tokens from "@/utils/model/auth_tokens"


/**
 * @swagger
 * /api/session:
 *   get:
 *     summary: Check the status of a session token
 *     description: Validates a session token and retrieves the associated profile ID.
 *     tags:
 *       - Session
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: The session token to validate.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session token is valid, profile ID returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profileId:
 *                   type: string
 *                   description: The ID of the associated profile.
 *       401:
 *         description: Invalid session token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *       404:
 *         description: Profile not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 * 
 *   post:
 *     summary: Create a new session token
 *     description: Authenticates a user using email and password, and generates a session token.
 *     tags:
 *       - Session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *               password:
 *                 type: string
 *                 description: The user's password.
 *             required:
 *               - email
 *               - password
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *               password:
 *                 type: string
 *                 description: The user's password.
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Session token created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The generated session token.
 *       401:
 *         description: Invalid username or password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *       405:
 *         description: Unsupported content type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 * 
 *   delete:
 *     summary: Delete a session token
 *     description: Deletes an existing session token, effectively logging the user out.
 *     tags:
 *       - Session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The session token to delete.
 *             required:
 *               - token
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The session token to delete.
 *             required:
 *               - token
 *     responses:
 *       200:
 *         description: Session destroyed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: Confirmation message.
 *       401:
 *         description: Invalid or missing session token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *       405:
 *         description: Unsupported content type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 */
// Check the status of a session token
export async function GET(req: NextRequest) {
    const sessionToken = req.nextUrl.searchParams.get("token") as string

    // Check the session token
    const accountId = await checkSessionToken(sessionToken)

    if (accountId === null || accountId === '') {
        return NextResponse.json({error: "Invalid session token", code: "error-invalid-session"}, { status: 401 })
    }


    const profileId = await accounts.findOne({_id: ObjectId.createFromHexString(accountId as string)}).then(profileId => {
        if (profileId === null) {
            return null
        }
        return profileId._id.toHexString()
    })

    if (profileId === null) {
        return NextResponse.json({error: "Profile not found", code: "error-profile-not-found"}, { status: 404 })
    }

    return NextResponse.json({profileId: profileId}, { status: 200 })

}


// Creates a new session token by authenticating the user with email and password
export async function POST(req: NextRequest) {
  let formData
  const contentType = req.headers.get("content-type") ?? ""


  if (contentType.includes("multipart/form-data")) {
      formData = await req.formData()
  } else if (contentType.includes("application/json")) {
      const jsonData = await req.json()
      formData = new Map(Object.entries(jsonData))
  } else {
      return NextResponse.json({error: "Method is not allowed", code: "content-error"}, { status: 405 })
  }

  const email = formData.get("email") as String
  const password = formData.get("password") as String

  // Get the user id for the email
  const db = await connectDB()

  const user = await accounts.findOne({email: email})

  console.log(user)
  // Check if the password is correct

  if (!user || !await bcrypt.compare(password as string, user.password as string)) {
      // The email or password is incorrect
      return NextResponse.json({error: "Invalid username or password", code: "error-invalid-credentials"}, { status: 401 })
  }

  return NextResponse.json({token: await createSessionToken(user._id.toHexString())}, { status: 200 })

}

// Deletes the session token
export async function DELETE(req: NextRequest) {
    
    let formData
    const contentType = req.headers.get("content-type") ?? ""

    if (contentType.includes("multipart/form-data")) {
        formData = await req.formData()
    } else if (contentType.includes("application/json")) {
        const jsonData = await req.json()
        formData = new Map(Object.entries(jsonData))
    } else {
        return NextResponse.json({error: "Unsupported content type", code: "content-error"}, { status: 405 })
    }

    const token = formData.get("token") as string

    if (checkSessionToken(token) === null) {
        return NextResponse.json({error: "Token is missing", code: "error-invalid-session"}, { status: 401 })
    }

    await connectDB()

    const res = await auth_tokens.deleteOne({token: token})

    if (res.deletedCount === 0) {
        return NextResponse.json({error: "Session couldn't be destroyed", code: "error-invalid-session"}, { status: 401 })
    }

    return NextResponse.json({result: "Session destroyed"}, { status: 200 })
}