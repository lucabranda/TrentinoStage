import { NextRequest, NextResponse } from "next/server"
import { checkSessionToken } from "@/utils/session"
import connectDB from "@/utils/db"
import profiles from "@/utils/model/profiles"
import { isCompany } from "@/utils/accounts"
import { isProfileCompany, isProfileOwner } from "@/utils/profiles"

/**
 * @swagger
 * /api/reviews/get:
 *   get:
 *     summary: Retrieve reviews for a specific profile
 *     description: Fetches a list of reviews for a given profile, with optional pagination.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Session token for authentication.
 *       - in: query
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the profile whose reviews are being fetched.
 *       - in: query
 *         name: from
 *         required: false
 *         schema:
 *           type: integer
 *           default: 0
 *         description: The starting index for pagination.
 *       - in: query
 *         name: to
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The ending index for pagination.
 *     responses:
 *       200:
 *         description: A list of reviews for the specified profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   reviewer:
 *                     type: string
 *                     description: The ID of the reviewer.
 *                   rating:
 *                     type: number
 *                     description: The rating given by the reviewer.
 *                   comment:
 *                     type: string
 *                     description: The review comment.
 *       401:
 *         description: Missing or invalid session token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *       403:
 *         description: Access to the profile's reviews is forbidden.
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
 */
export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token") as string
    const profileId = req.nextUrl.searchParams.get("profileId") as string

    // Pagination
    const from = parseInt(req.nextUrl.searchParams.get("from") || '0')
    const to = parseInt(req.nextUrl.searchParams.get("to") || '10')

    if (!token || !profileId) {
        return new Response(JSON.stringify({error: "Missing required fields"}), { status: 401 })
    }

    const searcherId = await checkSessionToken(token)

    if (!searcherId) {
        return NextResponse.json({error:"Invalid session token", code:"error-invalid-session"}, { status: 401 })
    }

    // Deny access by companies to other companies' reviews and by users to other users' reviews
    const searcher = await isCompany(searcherId)
    const searched = await isProfileCompany(profileId)

    if (searcher === searched && !isProfileOwner(searcherId, profileId)) {
        return NextResponse.json({error: "You cannot access this profile's reviews", code: "error-invalid-access"}, { status: 403 })
    }


    await connectDB()

    const reviewsList = await profiles.findOne( { _id: profileId }, { reviews: { $slice: [from, to] }} ).then((result) => {
        if (result.length === 0) {
            return NextResponse.json({error: "Profile not found", code: "error-profile-not-found"}, { status: 404 })
        }
        return result.reviews
    })

    return NextResponse.json(reviewsList, { status: 200 })

}