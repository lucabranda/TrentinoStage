import { NextResponse, NextRequest } from "next/server"
import { DBClient } from "@/utils/db"
import { checkExpiredTokens, createSessionToken } from "@/utils/session"
import bcrypt from "bcrypt"
import crypto from "crypto"

const db = new DBClient()

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
      throw new Error("Unsupported content type")
    }

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Get the user id for the email
    
    const accounts = db.selectCollection("accounts")
    const user = await accounts.findOne({email: email})

    
    // Check if the password is correct
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      // The email or password is incorrect
      return new NextResponse("Unauthorized", { status: 401 })
    } 
    
    // The email and password are correct
    // Generate a session token

    const token = createSessionToken(user._id.toHexString())

    return new NextResponse(JSON.stringify({token: await token}), { status: 200 })

  } catch (e) {
    console.error(e);
    return new NextResponse("Error", { status: 500 })
  }
}
