import { NextResponse, NextRequest } from "next/server"
import { DBClient } from "@/utils/db"
import { createSessionToken } from "@/utils/session"
import bcrypt from "bcrypt"

const db = new DBClient()


/**
 * @swagger
 * /api/session/create:
 *   post:
 *     summary: "Authenticate user and return session token"
 *     description: "This endpoint allows a user to log in with a email and password, receiving a session token upon successful authentication."
 *     tags: ["Session"]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: "The user's email"
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 description: "The user's password"
 *                 format: password
 *                 example: "securepassword123"
 *     responses:
 *       200:
 *         description: "Session token generated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: "The session token"
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: "Invalid username or password"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Error message explaining the reason for failure"
 *                   example: "Invalid username or password"
 * 
 */
export async function POST(req: NextRequest) {
  let formData
  const contentType = req.headers.get("content-type") ?? ""

  try {
    if (contentType.includes("multipart/form-data")) {
      formData = await req.formData()
    } else if (contentType.includes("application/json")) {
      const jsonData = await req.json()
      formData = new Map(Object.entries(jsonData))
    } else {
      return NextResponse.json({error: "Method is not allowed", code: "content-error"}, { status: 405 })
    }

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Get the user id for the email
    
    const accounts = db.selectCollection("accounts")
    const user = await accounts.findOne({email: email})

    // Check if the password is correct
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      // The email or password is incorrect
      return NextResponse.json({error: "Invalid username or password", code: "error-invalid-credentials"}, { status: 401 })
    } 
    
    // The email and password are correct
    // Generate a session token

    const token = createSessionToken(user._id.toHexString())

    return NextResponse.json({token: await token}, { status: 200 })

  } catch (e) {
    console.error(e);
    return NextResponse.json({error: "Error"}, { status: 500 })
  }
}
