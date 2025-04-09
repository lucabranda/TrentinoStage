import { NextRequest, NextResponse } from 'next/server'

import { checkSessionToken } from '@/utils/session'
import { getProfileId, isCompany } from '@/utils/accounts'

import connectDB from '@/utils/db'
import applications from '@/utils/model/available_positions'

// Api endpoint to lis all the open positions for a company
// If the user is not a company restrict the access to the applied_users and chosen_user fields
// If the user is the company that created the position return all the fields


/**
 * @swagger
 * /api/applications/list:
 *   get:
 *     summary: Retrieve a list of open positions for a company.
 *     description: |
 *       This endpoint retrieves all open positions for a specified company. 
 *       If the user accessing the endpoint is the company that created the positions, 
 *       all fields are returned. Otherwise, sensitive fields such as `applied_users` 
 *       and `chosen_user` are omitted.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The session token of the user making the request.
 *       - in: query
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The profile ID of the company whose positions are being queried.
 *     responses:
 *       200:
 *         description: A list of open positions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   issuer_id:
 *                     type: string
 *                     description: The ID of the company that created the position.
 *                   title:
 *                     type: string
 *                     description: The title of the position.
 *                   description:
 *                     type: string
 *                     description: A description of the position.
 *                   sector:
 *                     type: string
 *                     description: The sector of the position.
 *                   location:
 *                     type: string
 *                     description: The location of the position.
 *       401:
 *         description: Unauthorized access due to missing or invalid session token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error message.
 *                 code:
 *                   type: string
 *                   description: The error code.
 *       500:
 *         description: Internal server error.
 */
export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token") as string
    const companyProfile = req.nextUrl.searchParams.get("profileId") as string

    if (!token) {
        return NextResponse.json({error: "Missing required fields", code: "error-missing-fields"}, { status: 401 })
    }

    const accountId = await checkSessionToken(token)
    const profileId = getProfileId(accountId)
    const company = isCompany(accountId)


    if (!accountId) {
        return NextResponse.json({error: "Invalid session token", code: "error-invalid-session"}, { status: 401 })
    }

    await connectDB()

    const openPositions = await applications.find({ issuer_id: companyProfile, chosen_user: "" })

    if (!openPositions) {
        return NextResponse.json({}, { status: 200 })
    }


    // If the useer accessing the positions is the company that created them retrieve all data
    if (await company) {
        return NextResponse.json(openPositions, { status: 200 })
    } else {
        // If the user is not the company that created the positions remove the applied_users and chosen_user fields
        const filteredPositions = openPositions.map((position) => {
            const { issuer_id, title, description, sector, location } = position.toObject()
            return {
                issuer_id,
                title,
                description,
                sector,
                location
            }
        })

        return NextResponse.json(filteredPositions, { status: 200 })
    }

}
