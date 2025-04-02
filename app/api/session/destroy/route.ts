import { NextRequest, NextResponse } from "next/server"
import { checkSessionToken } from "@/utils/session"

import connectDB from "@/utils/db"
import auth_tokens from "@/utils/model/auth_tokens"


// Removes the session token from the database

/**
 * @swagger
 * /api/session/destroy:
 *    post:
 *      summary: "Destroy a session token"
 *      description: "This endpoint allows a user to destroy a session token, logging out the user."
 *      tags: ["Session"]
 *      requestBody:
 *          required: true
 *          content: 
 *             multipart/form-data:
 *               schema:
 *                  type: object
 *                  properties:
 *                      token:
 *                         type: string
 *                         description: "The session token to destroy"
 *                         example: "eyJhbGciOi..."
 *      responses:
 *         200: 
 *              description: "Session destroyed"
 *              content:
 *                 application/json:
 *                    schema:
 *                      type: object
 *                      properties:
 *                          result:
 *                              type: string
 *                              description: "Result of the operation"
 *                              example: "Session destroyed"
 *         401:
 *             description: "Token is invalid"
 *             content:
 *                application/json:
 *                   schema:
 *                      type: object
 *                      properties:
 *                          error:
 *                              type: string
 *                              description: "Error message explaining the reason for failure"
 *                              example: "Token is missing"
 *         405:
 *              description: "Unsupported content type"
 *              content:
 *                 application/json:
 *                    schema:
 *                       type: object
 *                       properties:
 *                          error:
 *                              type: string
 *                              description: "Error message explaining the reason for failure"
 *                              example: "Unsupported content type" 
 */

export async function POST(req: NextRequest) {
    
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