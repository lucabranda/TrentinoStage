import { checkSessionToken } from "@/utils/session"
import { NextRequest, NextResponse } from "next/server"
import { getProfileId, isCompany } from "@/utils/accounts"

import connectDB from "@/utils/db"
import available_positions from "@/utils/model/available_positions"

/**
 * @swagger
 * /api/applications/create:
 *   post:
 *     summary: Create a new application
 *     description: Endpoint to create a new application with the provided details.
 *     tags: [Applications]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Session token for authentication
 *                 example: "your-session-token"
 *               title:
 *                 type: string
 *                 description: Title of the application
 *                 example: "Application Title"
 *               description:
 *                 type: string
 *                 description: Description of the application
 *                 example: "Application Description"
 *               sector:
 *                 type: string
 *                 description: Sector of the application
 *                 example: "Technology"
 *               country:
 *                 type: string
 *                 description: Country of the application
 *                 example: "USA"
 *               region:
 *                 type: string
 *                 description: Region of the application
 *                 example: "California"
 *               city:
 *                 type: string
 *                 description: City of the application
 *                 example: "San Francisco"
 *               weekly_hours:
 *                 type: integer
 *                 description: Weekly hours for the application
 *                 example: 40
 *             required:
 *               - token
 *               - title
 *               - description
 *               - sector
 *               - country
 *               - region
 *               - city
 *               - weekly_hours
 *     responses:
 *       200:
 *         description: Application created successfully
 *       403:
 *         description: Invalid token
 *       405:
 *         description: Invalid request or unsupported content type
 */

export async function POST(req: NextRequest) {
    let formData
    const contentType = req.headers.get("content-type") ?? ""

    if (contentType.includes("multipart/form-data")) {
        formData = await req.formData()
    } else {
        return NextResponse.json({error: "Unsupported content type", code: "error-invalid-request"}, { status: 405 })
    }

    const token = formData.get("token") as string

    const userId = await checkSessionToken(token)

    // Check if the account is a company
    if (!(await isCompany(userId))) {
        return NextResponse.json({error: "Invalid account type", code: "error-invalid-account-type"}, { status: 403 })
    } 

    const issuer_id = await getProfileId(userId)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const sector = formData.get("sector") as string
    const country = formData.get("country") as string
    const region = formData.get("region") as string
    const city = formData.get("city") as string
    const weekly_hours = parseInt(formData.get("weekly_hours") as string)

    if (await issuer_id === null) {
        return NextResponse.json({error: "Invalid token", code: "error-invalid-token"}, { status: 403 })
    }

    if (!title || !description || !sector || !country || !region || !city || Number.isNaN(weekly_hours)) {
        return NextResponse.json({error: "Invalid request", code: "error-invalid-request"}, { status: 405 })
    }

    const data = {
        issuer_id,
        title,
        description,
        sector,
        location: {
            country,
            region,
            city
        },
        weekly_hours,
        applied_users: [{}],
        chosen_user: "",
        creation_time: new Date().toISOString()
    }

    try {
        await connectDB()

        const res = await available_positions.create(data)

        res.save()
    } catch (error) {
        return NextResponse.json({error: "Internal server error", code: "error-internal-server"}, { status: 500 })
    }

    console.log("Data: " + data)

    return NextResponse.json({message: "Application created successfully", data}, { status: 200 })

}