import { NextRequest, NextResponse } from 'next/server'

import { checkSessionToken } from '@/utils/session'
import { getProfileId } from '@/utils/accounts'
import applications from '@/utils/model/available_positions'
import connectDB from '@/utils/db'


// Endpoint for the companies to view the status of their applications


/**
 * @swagger
 * /api/applications/status:
 *   get:
 *     summary: Retrieve the status of a specific application
 *     description: Endpoint for companies to view the status of their applications.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: Session token for authentication
 *         schema:
 *           type: string
 *       - in: query
 *         name: applicationId
 *         required: true
 *         description: The ID of the application to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the application status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 issuer_id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 other_fields:
 *                   type: object
 *       401:
 *         description: Missing required fields or invalid session token
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
 *         description: Application not found
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

    const application = await applications.findOne({ _id: applicationId, issuer_id: profileId })

    if (!application) {
        return NextResponse.json({error: "Application not found", code: "error-application-not-found"}, { status: 404 })
    }

    return NextResponse.json(application, { status: 200 })

}