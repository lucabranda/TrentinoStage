// Endpoint to apply for a new application

import { NextRequest, NextResponse } from "next/server";
import { checkSessionToken } from "@/utils/session"
import { getProfileId, isCompany } from "@/utils/accounts"
import available_positions from "@/utils/model/available_positions"
import { connectDB } from "@/utils/db";




/**
 * @swagger
 * /api/applications/apply:
 *   post:
 *     summary: Apply for a new application
 *     description: Endpoint to allow users to apply for a specific application. Only individual accounts are allowed to apply.
 *     consumes:
 *       - multipart/form-data
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: application
 *         description: Application data
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: Session token of the user.
 *             applicationId:
 *               type: string
 *               description: ID of the application to apply for.
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
 *                   example: "Application created successfully"
 *       403:
 *         description: Forbidden. Invalid token or account type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid token"
 *                 code:
 *                   type: string
 *                   example: "error-invalid-token"
 *       404:
 *         description: Application not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Application not found"
 *                 code:
 *                   type: string
 *                   example: "error-application-not-found"
 *       405:
 *         description: Unsupported content type or missing applicationId field.
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

    const userId = await checkSessionToken(token)
    const profileId = await getProfileId(userId)
    const company = isCompany(userId)

    if (!userId) {
        return NextResponse.json({error: "Invalid token", code: "error-invalid-token"}, { status: 403 })
    }

    const appId = formData.get("applicationId") as string
    if (!appId) {
        return NextResponse.json({error: "Invalid request missing applicationId field", code: "error-invalid-request"}, { status: 405 })
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