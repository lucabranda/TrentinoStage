import { NextRequest, NextResponse } from "next/server";
import { checkSessionToken } from "@/utils/session"
import { getProfileId, isCompany } from "@/utils/accounts"
import available_positions from "@/utils/model/available_positions"
import { connectDB } from "@/utils/db";

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Apply for a position
 *     description: Endpoint to allow users to apply for a specific position.
 *     tags:
 *       - Applications
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
 *               positionId:
 *                 type: string
 *                 description: The ID of the position to apply for.
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The session token of the user.
 *               positionId:
 *                 type: string
 *                 description: The ID of the position to apply for.
 *     responses:
 *       200:
 *         description: Application created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Application created successfully
 *       403:
 *         description: Invalid token or account type. Companies cannot apply for positions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid account type. Companies can't apply
 *                 code:
 *                   type: string
 *                   example: error-invalid-account-type
 *       404:
 *         description: Application not found or position does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Application not found
 *                 code:
 *                   type: string
 *                   example: error-application-not-found
 *       405:
 *         description: Unsupported content type or missing positionId.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unsupported content type
 *                 code:
 *                   type: string
 *                   example: error-invalid-request
 * 
 *   get:
 *     summary: Get the positions to which the user is applied to
 *     description: Retrieve the list of positions the user has applied to.
 *     tags:
 *       - Applications
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The session token of the user.
 *     responses:
 *       200:
 *         description: List of positions retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The ID of the position.
 *                   issuerId:
 *                     type: string
 *                     description: The ID of the issuer of the position.
 *                   title:
 *                     type: string
 *                     description: The title of the position.
 *                   description:
 *                     type: string
 *                     description: The description of the position.
 *                   sector:
 *                     type: string
 *                     description: The sector of the position.
 *                   weeklyHours:
 *                     type: number
 *                     description: The weekly hours required for the position.
 *                   location:
 *                     type: string
 *                     description: The location of the position.
 *                   creationTime:
 *                     type: string
 *                     format: date-time
 *                     description: The time the position was created.
 *                   isOpen:
 *                     type: boolean
 *                     description: Whether the position is still open or not.
 *       401:
 *         description: Missing required fields or invalid session token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token not valid or expired
 *                 code:
 *                   type: string
 *                   example: error-invalid-session-token
 */


// Endpoint to apply for a position
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
    const company = isCompany(userId)

    if (!userId) {
        return NextResponse.json({error: "Invalid token", code: "error-invalid-token"}, { status: 403 })
    }

    const appId = formData.get("positionId") as string
    if (!appId) {
        return NextResponse.json({error: "positionId is a required parameter", code: "error-invalid-request"}, { status: 405 })
    }

    if (await company) {
        return NextResponse.json({error: "Invalid account type. Companies can't apply", code: "error-invalid-account-type"}, { status: 403 })
    }

    await connectDB()

    const application = {
        user_id: profileId,
        application_time: new Date().toISOString()
    }

    const res = await available_positions.findOneAndUpdate({ _id: appId }, { $addToSet: { applied_users: application } })
    res.save()

    if (res.modifiedCount === 0) {
        return NextResponse.json({error: "Application not found", code: "error-application-not-found"}, { status: 404 })
    }

    return NextResponse.json({message: "Application created successfully"}, { status: 200 })
}


// Endpoint to get the status of an application
/*export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token") as string
    const applicationId = req.nextUrl.searchParams.get("applicationId") as string
    
    if (!token || !applicationId) {
        return new Response(JSON.stringify({error: "Missing required fields"}), { status: 401 })
    }

    const accountId = await checkSessionToken(token)
    const profileId = await getProfileId(accountId)

    if (!profileId) {
        return NextResponse.json({error:"Invalid session token", code:"error-invalid-session"}, { status: 401 })
    }

    await connectDB()

    const application = await available_positions.findOne({ _id: applicationId, issuer_id: profileId })

    if (!application) {
        return NextResponse.json({error: "Application not found", code: "error-application-not-found"}, { status: 404 })
    }

    return NextResponse.json(application, { status: 200 })

}*/

// Get the positions to which a user is applied to
export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token") as string

    const user = await checkSessionToken(token)
    const profile = await getProfileId(user)

    if (!token) {
        return NextResponse.json({ error: "Missing required fields", code: "error-missing-required-fields"}, { status: 401})
    }
    if (!profile) {
        return NextResponse.json({ error: "Token not valid or expired", code: "error-invalid-session-token"}, { status: 401 })
    }

    await connectDB()

    const res = await available_positions.find({ "applied_users.user_id": profile })

    const filtered = res.map((pos) => {
        return {
            _id: pos._id,
            issuerId: pos.issuer_id,
            title: pos.title,
            description: pos.description,
            sector: pos.sector,
            weeklyHours: pos.weekly_hours,
            location: pos.location,
            creationTime: pos.creation_time,
            isOpen: (pos.chosen_user == "")
        }
    })

    return NextResponse.json( filtered , { status: 200 })

}