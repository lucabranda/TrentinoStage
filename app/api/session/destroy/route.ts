import { NextRequest, NextResponse } from "next/server"
import { DBClient } from "@/utils/db"

// Removes the session token from the database
export async function POST(req: NextRequest, res: NextResponse) {
    
    let formData
    const contentType = req.headers.get("content-type") ?? ""

    if (contentType.includes("multipart/form-data")) {
        formData = await req.formData()
    } else {
        return new NextResponse("Unsupported content type", { status: 400 })
    }

    const token = formData.get("token") as string

    if (!token) {
        return new NextResponse("Token is missing", { status: 400 })
    }

    const db = new DBClient()
    const sessions = db.selectCollection("auth_tokens")

    await sessions.deleteOne({token: token})

    return new NextResponse("Session destroyed", { status: 200 })
}