import { checkSessionToken } from '@/utils/session'
import { NextRequest, NextResponse } from 'next/server'

import { connectDB } from '@/utils/db'
import available_positions from '@/utils/model/available_positions'
import { ObjectId } from 'mongodb'
import { getProfileId } from '@/utils/accounts'


/**
 * @swagger
 * /api/applications/modify:
 *   post:
 *     summary: Modify an existing application
 *     description: This endpoint allows you to modify an existing application by providing the necessary fields. Can also be used to set a chosen user for the application.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: token
 *         type: string
 *         required: true
 *         description: Session token for authentication.
 *       - in: formData
 *         name: title
 *         type: string
 *         required: true
 *         description: Title of the application.
 *       - in: formData
 *         name: description
 *         type: string
 *         required: true
 *         description: Description of the application.
 *       - in: formData
 *         name: sector
 *         type: string
 *         required: true
 *         description: Sector of the application.
 *       - in: formData
 *         name: country
 *         type: string
 *         required: true
 *         description: Country of the application.
 *       - in: formData
 *         name: region
 *         type: string
 *         required: true
 *         description: Region of the application.
 *       - in: formData
 *         name: city
 *         type: string
 *         required: true
 *         description: City of the application.
 *       - in: formData
 *         name: weekly_hours
 *         type: integer
 *         required: true
 *         description: Weekly hours for the application.
 *       - in: formData
 *         name: chosen_user
 *         type: string
 *         required: false
 *         description: Chosen user for the application.
 *     responses:
 *       200:
 *         description: Application modified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Application modified successfully
 *       401:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Missing required fields
 *       403:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid token
 *                 code:
 *                   type: string
 *                   example: error-invalid-session-token
 *       405:
 *         description: Unsupported content type
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
 *       500:
 *         description: Error modifying application
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error modifying application
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
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const sector = formData.get("sector") as string
    const country = formData.get("country") as string
    const region = formData.get("region") as string
    const city = formData.get("city") as string
    const weekly_hours = parseInt(formData.get("weekly_hours") as string)
    const chosen_user = formData.get("chosen_user") as string

    if (!token || !title || !description || !sector || !country || !region || !city || !weekly_hours) {
        return new NextResponse("Missing required fields", { status: 401 })
    }

    const profileId = await getProfileId(await checkSessionToken(token))
    if (!profileId) {
        return NextResponse.json({error: "Invalid token", code: "error-invalid-session-token"}, { status: 403 })
    }

    console.log(profileId)

    let edit: { 
        [key: string]: string | null | { [key: string]: string | null } | string[] | number
    } = {}

    if (chosen_user) {
        // If modify is used to set a chosen user ignore all the other fields
        edit['chosen_user'] = chosen_user
    } else {
        if (title) {
            edit['title'] = title
        }
        if (description) {
            edit['description'] = description
        }
        if (sector) {
            edit['sector'] = sector
        }
        if (country) {
            edit['country'] = country
        }
        if (region) {
            edit['region'] = region
        }
        if (city) {
            edit['city'] = city
        }
        if (weekly_hours) {
            edit['weekly_hours'] = weekly_hours
        }
    }

    await connectDB()

    const update = await available_positions.updateOne({ _id: ObjectId.createFromHexString(profileId) }, edit,{
        new: true,
        upsert: true,
        // Return additional properties about the operation, not just the document
        includeResultMetadata: true
    })

    if (update.modifiedCount === 0) {
        return NextResponse.json({error: "Error modifying application"}, { status: 500 })
    }

    return NextResponse.json({message: "Application modified successfully"}, { status: 200 })
}