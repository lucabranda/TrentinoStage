import { NextRequest, NextResponse } from "next/server"
import { checkSessionToken } from "@/utils/session"
import { ObjectId } from "mongodb"

import connectDB from "@/utils/db"
import accounts from "@/utils/model/accounts"

/**
 * @swagger
 * /api/session/verify:
 *   get:
 *     summary: Verify session token and retrieve profile ID
 *     description: Verifies the session token and, if the token is valid, returns the profile ID associated with the token
 *     tags: [Session]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The session token to verify
 *     responses:
 *       200:
 *         description: Successfully retrieved profile ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profileId:
 *                   type: string
 *                   description: The profile ID associated with the session token
 *       401:
 *         description: Invalid session token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

export async function GET(req: NextRequest) {
    const sessionToken = req.nextUrl.searchParams.get("token") as string

    // Check the session token
    const accountId = await checkSessionToken(sessionToken)

    if (accountId === null) {
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