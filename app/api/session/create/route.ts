import { NextResponse, NextRequest } from "next/server"
import { DBClient } from "@/utils/db"
import bcrypt from "bcrypt"
import crypto from "crypto"

const db = new DBClient()

export async function POST(req: NextRequest, res: NextResponse) {
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

    const username = formData.get("username") as string
    const password = formData.get("password") as string

    // Get the user id for the username
    
    const accounts = db.selectCollection("accounts")
    const user = await accounts.findOne({username: username})

    // Check if the password is correct
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      // The username or password is incorrect
      return new NextResponse("Unauthorized", { status: 401 })
    } 
    
    // The username and password are correct
    // Generate a session token

    const token = crypto.randomBytes(64).toString("hex")

    const sessions = db.selectCollection("auth_tokens")
    const date = new Date().toISOString()
    await sessions.insertOne({user_id: user._id, generation_time: date ,token: token})

    return new NextResponse(JSON.stringify({token: token}), { status: 200 })
      
  } catch (e) {
    console.error(e);
    return new NextResponse("Error", { status: 500 })
  }
}
