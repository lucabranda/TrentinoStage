import { NextRequest, NextResponse } from "next/server"
import { checkSessionToken } from "@/utils/session"
import { connectDB } from "@/utils/db"
import profiles from "@/utils/model/profiles"
import { getProfileId, isCompany } from "@/utils/accounts"
import { isProfileCompany, isProfileOwner } from "@/utils/profiles"
import { ObjectId } from "mongodb"


/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Retrieve reviews of a profile
 *     description: Fetches a paginated list of reviews for a specific profile. Access is restricted based on the type of profile and ownership.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: Session token of the user making the request.
 *         schema:
 *           type: string
 *       - in: query
 *         name: profileId
 *         required: true
 *         description: ID of the profile whose reviews are being fetched.
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         required: false
 *         description: Starting index for pagination (default is 0).
 *         schema:
 *           type: integer
 *       - in: query
 *         name: to
 *         required: false
 *         description: Ending index for pagination (default is 10).
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the reviews.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Missing or invalid session token.
 *       403:
 *         description: Access denied to the requested profile's reviews.
 *       404:
 *         description: Profile not found.
 *
 *   post:
 *     summary: Create a new review
 *     description: Allows a user to create a review for another profile. Users can only review companies and vice versa.
 *     tags:
 *       - Reviews
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Session token of the user creating the review.
 *               reviewedProfile:
 *                 type: string
 *                 description: ID of the profile being reviewed.
 *               title:
 *                 type: string
 *                 description: Title of the review.
 *               review:
 *                 type: string
 *                 description: Content of the review.
 *               rating:
 *                 type: integer
 *                 description: Rating for the profile (1-5).
 *     responses:
 *       200:
 *         description: Review created successfully.
 *       403:
 *         description: Invalid session token or unauthorized review.
 *       405:
 *         description: Missing parameters or invalid review type.
 *       404:
 *         description: Profile not found.
 *
 *   put:
 *     summary: Update an existing review
 *     description: Allows a user to update their own review. At least one field (title, review, or rating) must be provided for the update.
 *     tags:
 *       - Reviews
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Session token of the user updating the review.
 *               reviewId:
 *                 type: string
 *                 description: ID of the review to be updated.
 *               title:
 *                 type: string
 *                 description: New title for the review (optional).
 *               review:
 *                 type: string
 *                 description: New content for the review (optional).
 *               rating:
 *                 type: integer
 *                 description: New rating for the review (optional).
 *     responses:
 *       200:
 *         description: Review updated successfully.
 *       401:
 *         description: Missing or invalid session token.
 *       404:
 *         description: Review not found.
 *       405:
 *         description: No fields provided for update.
 */
// Get the reviews of a profile
export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token") as string
    const profileId = req.nextUrl.searchParams.get("profileId") as string
   
    // If reviewerId is not provided, get the reviews of the profile
    if (!token || !profileId) {
        return NextResponse.json({error: "Missing required fields", code: "error-missing-fields"}, { status: 401 })
    }


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
    
    await connectDB()

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


    const res = await profiles.updateOne({ _id: ObjectId.createFromHexString(reviewedProfile) }, { $push: { reviews: data } })
    
    if (res.modifiedCount !== 1) {
        return NextResponse.json({error: "Profile not found", code: "error-profile-not-found"}, { status: 404 })
    }

    return NextResponse.json({message: "Review created succesfully", data}, { status: 200 })

}


// Edit the review
export async function PUT(req: NextRequest) {
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