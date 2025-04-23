import { NextRequest, NextResponse } from "next/server"

import { checkSessionToken } from "@/utils/session"
import { getAccountInfo } from "@/utils/accounts"


/**
 * @swagger
 * /api/accounts/role:
 *   get:
 *     summary: Retrieve the role of an account based on a session token.
 *     description: This endpoint retrieves the role of an account by validating the provided session token.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The session token used to identify the account.
 *     responses:
 *       200:
 *         description: Successfully retrieved the role of the account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role:
 *                   type: string
 *                   description: The role of the account.
 *       401:
 *         description: Unauthorized access due to missing or invalid session token.
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
 */
export async function GET(req: NextRequest) {

    const token = req.nextUrl.searchParams.get("token") as string

    if (!token) {
        return NextResponse.json({error: "Missing required fields", code: "error-missing-fields"}, { status: 401 })
    }

    const accountId = await checkSessionToken(token)

    if (!accountId) {
        return NextResponse.json({error: "Invalid session token", code: "error-invalid-session"}, { status: 401 })
    }

    const role = await getAccountInfo(accountId).then((account) => {
        if (!account) {
            return null
        }
        return account.role
    })

    return NextResponse.json({ role: role }, { status: 200 })
}