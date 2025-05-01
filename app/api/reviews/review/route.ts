import { NextRequest, NextResponse } from 'next/server'

import { checkSessionToken } from '@/utils/session'
import { getProfileId } from '@/utils/accounts'
import profiles from '@/utils/model/profiles'
import { connectDB } from '@/utils/db'
import { sanitize } from 'string-sanitizer'
import { isProfileCompany } from '@/utils/profiles'
import { ObjectId } from "mongodb"


/**
 * @swagger
 * /api/reviews/review:
 *   post:
 *     summary: Create a review for a profile.
 *     description: Allows users to create reviews for profiles. Users can only review companies, and companies can only review users.
 *     tags:
 *       - Reviews
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The session token of the user.
 *               reviewedProfile:
 *                 type: string
 *                 description: The ID of the profile being reviewed.
 *               title:
 *                 type: string
 *                 description: The title of the review.
 *               review:
 *                 type: string
 *                 description: The content of the review.
 *               rating:
 *                 type: integer
 *                 description: The rating for the review (1-5).
 *                 minimum: 1
 *                 maximum: 5
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The session token of the user.
 *               reviewedProfile:
 *                 type: string
 *                 description: The ID of the profile being reviewed.
 *               title:
 *                 type: string
 *                 description: The title of the review.
 *               review:
 *                 type: string
 *                 description: The content of the review.
 *               rating:
 *                 type: integer
 *                 description: The rating for the review (1-5).
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Review created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: object
 *                   description: The created review data.
 *                   properties:
 *                     reviewer_id:
 *                       type: string
 *                       description: The ID of the reviewer.
 *                     title:
 *                       type: string
 *                       description: The title of the review.
 *                     review:
 *                       type: string
 *                       description: The content of the review.
 *                     rating:
 *                       type: integer
 *                       description: The rating of the review.
 *                     creation_time:
 *                       type: string
 *                       format: date-time
 *                       description: The creation time of the review.
 *       403:
 *         description: Invalid token.
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
 *       404:
 *         description: Profile not found.
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
 *       405:
 *         description: Invalid request or missing parameters.
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
export async function POST(req: NextRequest) {
    let formData
    const contentType = req.headers.get("content-type") ?? ""

    if (contentType.includes("multipart/form-data")) {
        formData = await req.formData()
    } else if (contentType.includes("application/json")) {
        const jsonData = await req.json()
        formData = new Map(Object.entries(jsonData))
    } else {
        return NextResponse.json({error: "Unsupported content type", code: "error-invalid-request"}, { status: 405 })
    }

    const token = formData.get("token") as string
    const userId = await checkSessionToken(token)
    const profileId = await getProfileId(userId)
    const reviewedProfile = formData.get("reviewedProfile") as string
    const title = formData.get("title") as string
    const review = formData.get("review") as string
    let rating = parseInt(formData.get("rating") as string)
    if (rating <= 0) rating = 1
    if (rating > 5) rating = 5
    const time = new Date().toISOString()

    if (await userId === null) {
        return NextResponse.json({error: "Invalid token", code: "error-invalid-token"}, { status: 403 })
    }

    if (!title || !review || !rating || !reviewedProfile) {
        return NextResponse.json({error: "Missing parameters", code: "error-missing-parameters"}, { status: 405 })
    }

    // Allow only users to review companies and companies to review users
    const reviewerIsCompany = await isProfileCompany(profileId)
    const reviewedIsCompany = await isProfileCompany(reviewedProfile)

    if (reviewerIsCompany === reviewedIsCompany) {
        return NextResponse.json({error: "Cannot review a profile of the same type", code: "error-invalid-review"}, { status: 405 })
    }

    // Check if the profile has already reviewed the other profile
    const profile = await profiles.findOne({ _id: ObjectId.createFromHexString(reviewedProfile), reviews: { $elemMatch: { reviewer_id: profileId } } })

    if (profile) {
        return NextResponse.json({error: "The profile has already reviewed this profile", code: "error-already-reviewed"}, { status: 405 })
    }


    // Create the review
    const data = {
        reviewer_id: profileId,
        title: title,
        review: review,
        rating: rating,
        creation_time: time,
        eidted: false
    }

    await connectDB()

    const res = await profiles.updateOne({ _id: ObjectId.createFromHexString(reviewedProfile) }, { $push: { reviews: data } })
    
    if (res.modifiedCount !== 1) {
        return NextResponse.json({error: "Profile not found", code: "error-profile-not-found"}, { status: 404 })
    }

    return NextResponse.json({message: "Review created succesfully", data}, { status: 200 })

}