import { NextRequest, NextResponse } from "next/server";
import { checkSessionToken } from "@/utils/session";
import connectDB from "@/utils/db";
import profiles from "@/utils/model/profiles";
import { getProfileId } from "@/utils/accounts";


/**
 * @swagger
 * /api/reviews/edit:
 *   post:
 *     summary: Edit a review
 *     description: Updates an existing review for a user. At least one of the fields (title, review, or rating) must be provided for the update.
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
 *                 example: "user-session-token"
 *               reviewId:
 *                 type: string
 *                 description: The ID of the review to be updated.
 *                 example: "64f1c2e5d4a3b2c1a1e5f6d7"
 *               title:
 *                 type: string
 *                 description: The new title of the review (optional).
 *                 example: "Updated Review Title"
 *               review:
 *                 type: string
 *                 description: The new body of the review (optional).
 *                 example: "This is the updated review content."
 *               rating:
 *                 type: integer
 *                 description: The new rating for the review (optional).
 *                 example: 4
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The session token of the user.
 *                 example: "user-session-token"
 *               reviewId:
 *                 type: string
 *                 description: The ID of the review to be updated.
 *                 example: "64f1c2e5d4a3b2c1a1e5f6d7"
 *               title:
 *                 type: string
 *                 description: The new title of the review (optional).
 *                 example: "Updated Review Title"
 *               review:
 *                 type: string
 *                 description: The new body of the review (optional).
 *                 example: "This is the updated review content."
 *               rating:
 *                 type: integer
 *                 description: The new rating for the review (optional).
 *                 example: 4
 *     responses:
 *       200:
 *         description: Review updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review updated successfully"
 *       401:
 *         description: Missing required fields or invalid session token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *                 code:
 *                   type: string
 *                   example: "error-missing-fields"
 *       404:
 *         description: Review not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Review not found"
 *                 code:
 *                   type: string
 *                   example: "error-review-not-found"
 *       405:
 *         description: Unsupported content type or no fields to update.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unsupported content type"
 *                 code:
 *                   type: string
 *                   example: "error-invalid-request"
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
    const reviewId = formData.get("reviewId") as string

    const title = formData.get("title") as string
    const body = formData.get("review") as string
    let rating = parseInt(formData.get("rating") as string)

    if (!token || !reviewId) {
        return NextResponse.json({error: "Missing required fields", code: "error-missing-fields"}, { status: 401 })
    }

    if (!title && !body && !rating) {
        return NextResponse.json({error: "Provide at least one field to update", code: "error-nothing-to-update"}, { status: 405 })
    }

    const userId = await checkSessionToken(token)
    const profileId = await getProfileId(userId)

    if (!profileId) {
        return NextResponse.json({error:"Invalid session token", code:"error-invalid-session"}, { status: 401 })
    }

    await connectDB()

    let review = await profiles.findOne( { reviews: { $elemMatch: { _id: reviewId, reviewer_id: profileId } } } )

    if (review === null) {
        return NextResponse.json({error: "Review not found", code: "error-review-not-found"}, { status: 404 })
    }

    if (title) {
        review = await profiles.updateOne(
            { "reviews._id": reviewId },
            { $set: { "reviews.$.title": title}}
        )
    }
    if (body) {
        review = await profiles.updateOne(
            { "reviews._id": reviewId },
            { $set: { "reviews.$.review": body}}
        )
    }
    if (rating) {
        review = await profiles.updateOne(
            { "reviews._id": reviewId },
            { $set: { "reviews.$.rating": rating } }
        )
    }

    return NextResponse.json({message: "Review updated successfully"}, { status: 200 })    
}