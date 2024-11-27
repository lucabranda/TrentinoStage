import { NextRequest, NextResponse } from "next/server"
import { checkSessionToken } from "@/utils/session"
import { isCompany } from "@/utils/accounts"

import connectDB from "@/utils/db"
import accounts from "@/utils/model/accounts"

// Endpoint to check if the user is a company
/**
 * @swagger
 * /api/profiles/isCompany:
 *   get:
 *     summary: Check if the user is a company
 *     description: Returns whether the user associated with the provided session token or account ID is a company. At least one of the two parameters must be provided.
 *     tags: [Profiles]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: false
 *         description: The session token of the user
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         required: false
 *         description: The account ID of the user
 *     responses:
 *       200:
 *         description: A JSON object indicating whether the user is a company
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isCompany:
 *                   type: boolean
 *                   description: Indicates if the user is a company
 *       400:
 *         description: Missing session token or account ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                 code:
 *                   type: string
 *                   description: Error code
 */
export async function GET(req: NextRequest) {
    const sessionToken = req.nextUrl.searchParams.get("token") as string ?? null
    let accountId = req.nextUrl.searchParams.get("accountId") as string ?? null

    if (accountId == null && sessionToken == null) {
        return NextResponse.json({ error: "Missing session token or account ID", code: "error-missing-session" }, { status: 400 })
    }

    if (accountId == null) {
        if (sessionToken == null) return NextResponse.json({ error: "Missing session token", code: "error-missing-session" }, { status: 400 })
        accountId = await checkSessionToken(sessionToken)
        if (accountId == null) return NextResponse.json({ error: "Invalid session token", code: "error-invalid-session" }, { status: 401 })
    }
    console.log("AccountID: " + accountId)
    return NextResponse.json({ isCompany: await isCompany(accountId) }, { status: 200 })
}