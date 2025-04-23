import { NextRequest, NextResponse } from 'next/server'

import { checkSessionToken } from '@/utils/session'
import { getProfileId, isCompany } from '@/utils/accounts'

import { connectDB } from '@/utils/db'
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
 *         required: false
 *         schema:
 *           type: string
 *         description: The profile ID of the company whose positions are being queried.
 *       - in: query
 *         name: sector
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter positions by sector. Multiple sectors can be separated by `|`.
 *       - in: query
 *         name: city
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter positions by city.
 *       - in: query
 *         name: maxTime
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter positions by maximum weekly hours.
 *       - in: query
 *         name: minTime
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter positions by minimum weekly hours.
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
 *                     type: object
 *                     properties:
 *                       city:
 *                         type: string
 *                         description: The city of the position.
 *                   weekly_hours:
 *                     type: integer
 *                     description: The weekly hours required for the position.
 *                   creation_time:
 *                     type: string
 *                     format: date-time
 *                     description: The creation time of the position.
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
    const sector = req.nextUrl.searchParams.get("sector") as string
    const city = req.nextUrl.searchParams.get("city") as string
    const maxTime = req.nextUrl.searchParams.get("maxTime") as string
    const minTime = req.nextUrl.searchParams.get("minTime") as string

    const sectors = sector?.split("|")

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

    let query = {}

    if (!company) { 
        query = { chosen_user: "" }
    }
    if (companyProfile) {
        query = { ...query, issuer_id: companyProfile }
    }
    if (sector) {
        query = { ...query, sector: { $in: sectors } }
    }
    if (city) {
        query = { ...query, "location.city": city }
    }
    if (maxTime && minTime) {
        query = { ...query, weekly_hours: { $lte: parseInt(maxTime), $gte: parseInt(minTime)} }
    } else if (maxTime && !minTime) {
        query = { ...query, weekly_hours: { $lte: parseInt(maxTime) } }
    } else if (!maxTime && minTime) {
        query = { ...query, weekly_hours: { $gte: parseInt(minTime) } }
    }

    const openPositions = await applications.find(query).sort({ creation_time: -1 })

    if (!openPositions) {
        return NextResponse.json({}, { status: 200 })
    }


    // If the useer accessing the positions is the company that created them retrieve all data
    if (await company) {
        return NextResponse.json(openPositions, { status: 200 })
    } else {
        // If the user is not the company that created the positions remove the applied_users and chosen_user fields
        const filteredPositions = openPositions.map((position) => {
            const { issuer_id, title, description, sector, location, weekly_hours, creation_time } = position.toObject()
            return {
                issuer_id,
                title,
                description,
                sector,
                location,
                weekly_hours,
                creation_time
            }
        })

        return NextResponse.json(filteredPositions, { status: 200 })
    }

}
