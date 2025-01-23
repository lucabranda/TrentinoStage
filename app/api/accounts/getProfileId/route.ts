import { NextRequest, NextResponse } from "next/server"
import { getProfileId } from "@/utils/accounts"

// Endpoint to get the profile id given the account id


/**
 * @swagger
 * /api/accounts/getProfileId:
 *   get:
 *     summary: Retrieve the profile ID for a given account ID
 *     description: This endpoint returns the profile ID associated with the provided account ID.
 *     tags: [Accounts]
 *     parameters:
 *       - in: query
 *         name: accountId
 *         required: true
 *         description: The ID of the account for which to retrieve the profile ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the profile ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profileId:
 *                   type: string
 *                   description: The profile ID associated with the provided account ID.
 *       401:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the missing required fields.
 *                 code:
 *                   type: string
 *                   description: Error code indicating the missing account ID.
 */
export async function GET(req: NextRequest) {
    const accountId = req.nextUrl.searchParams.get("accountId") as string

    if (!accountId) {
        return NextResponse.json({ error: "Missing required fields", code: "error-accountId-required" }, { status: 401 })
    }

    // Check the accountId is in BSON format
    if (!accountId.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ error: "Invalid account ID", code: "error-invalid-accountId" }, { status: 401 })
    }

    const profileId = await getProfileId(accountId)

    return NextResponse.json({ profileId })
}