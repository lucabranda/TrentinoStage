import { checkSessionToken } from "@/utils/session"
import { NextRequest, NextResponse } from "next/server"
import { getProfileId, isCompany } from "@/utils/accounts"

import { connectDB, checkBsonFormat } from "@/utils/db"
import { ObjectId } from "mongodb"
import available_positions from "@/utils/model/available_positions"




/**
* @swagger 
 * /api/Positions:
 *   get:
 *     summary: Retrieve a list of open positions
 *     description: Fetches a list of open positions based on various filters such as sector, city, weekly hours, and position ID. If the user is a company, all data is returned. Otherwise, sensitive fields are omitted.
 *     tags:
 *       - Positions
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: Session token of the user.
 *         schema:
 *           type: string
 *       - in: query
 *         name: profileId
 *         required: false
 *         description: Profile ID of the company issuing the positions.
 *         schema:
 *           type: string
 *       - in: query
 *         name: sector
 *         required: false
 *         description: Filter positions by sector. Multiple sectors can be separated by a pipe (`|`).
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         required: false
 *         description: Filter positions by city.
 *         schema:
 *           type: string
 *       - in: query
 *         name: maxTime
 *         required: false
 *         description: Maximum weekly hours for the position.
 *         schema:
 *           type: string
 *       - in: query
 *         name: minTime
 *         required: false
 *         description: Minimum weekly hours for the position.
 *         schema:
 *           type: string
 *       - in: query
 *         name: positionId
 *         required: false
 *         description: Filter by a specific position ID.
 *         schema:
 *           type: string
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
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   sector:
 *                     type: string
 *                   location:
 *                     type: object
 *                     properties:
 *                       city:
 *                         type: string
 *                       region:
 *                         type: string
 *                       country:
 *                         type: string
 *                   weekly_hours:
 *                     type: number
 *                   creation_time:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Missing or invalid session token.
 *       500:
 *         description: Internal server error.
 *
 *   post:
 *     summary: Create a new position
 *     description: Allows a company to create a new job position. Only accounts with a company profile can use this endpoint.
 *     tags:
 *       - Positions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - title
 *               - description
 *               - sector
 *               - country
 *               - region
 *               - city
 *               - weeklyHours
 *             properties:
 *               token:
 *                 type: string
 *                 description: Session token of the user.
 *               title:
 *                 type: string
 *                 description: Title of the position.
 *               description:
 *                 type: string
 *                 description: Description of the position.
 *               sector:
 *                 type: string
 *                 description: Sector of the position.
 *               country:
 *                 type: string
 *                 description: Country where the position is located.
 *               region:
 *                 type: string
 *                 description: Region where the position is located.
 *               city:
 *                 type: string
 *                 description: City where the position is located.
 *               weeklyHours:
 *                 type: number
 *                 description: Weekly hours required for the position.
 *     responses:
 *       200:
 *         description: Position created successfully.
 *       403:
 *         description: Invalid account type or token.
 *       405:
 *         description: Invalid request or unsupported content type.
 *       500:
 *         description: Internal server error.
 *
 *   put:
 *     summary: Modify an existing position
 *     description: Allows a company to modify an existing job position. If a chosen user is specified, other fields are ignored.
 *     tags:
 *       - Positions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Session token of the user.
 *               title:
 *                 type: string
 *                 description: Title of the position.
 *               description:
 *                 type: string
 *                 description: Description of the position.
 *               sector:
 *                 type: string
 *                 description: Sector of the position.
 *               country:
 *                 type: string
 *                 description: Country where the position is located.
 *               region:
 *                 type: string
 *                 description: Region where the position is located.
 *               city:
 *                 type: string
 *                 description: City where the position is located.
 *               weeklyHours:
 *                 type: number
 *                 description: Weekly hours required for the position.
 *               chosenUser:
 *                 type: string
 *                 description: ID of the chosen user for the position.
 *     responses:
 *       200:
 *         description: Position modified successfully.
 *       401:
 *         description: Missing required fields.
 *       403:
 *         description: Invalid session token.
 *       500:
 *         description: Error modifying the position.
 */

// Endpoint to list the open positions
export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token") as string
    const companyProfile = req.nextUrl.searchParams.get("profileId") as string
    const sector = req.nextUrl.searchParams.get("sector") as string
    const city = req.nextUrl.searchParams.get("city") as string
    const maxTime = req.nextUrl.searchParams.get("maxTime") as string
    const minTime = req.nextUrl.searchParams.get("minTime") as string
    const posId = req.nextUrl.searchParams.get("positionId") as string ?? null

    const sectors = sector?.split("|")

    if (!token) {
        return NextResponse.json({error: "Missing required fields", code: "error-missing-fields"}, { status: 401 })
    }

    if (posId && !checkBsonFormat(posId)) {
        return NextResponse.json({error: "PositionId is not in a valid BSON format"}, { status: 401 })
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
    if (posId) {
        query = { ...query, _id: ObjectId.createFromHexString(posId) }
    }
    if (maxTime && minTime) {
        query = { ...query, weekly_hours: { $lte: parseInt(maxTime), $gte: parseInt(minTime)} }
    } else if (maxTime && !minTime) {
        query = { ...query, weekly_hours: { $lte: parseInt(maxTime) } }
    } else if (!maxTime && minTime) {
        query = { ...query, weekly_hours: { $gte: parseInt(minTime) } }
    }

    // If the user accessing the positions is the company that created them retrieve all data
    if (await company) {
        query = { ...query, issuer_id: await profileId }
    }

    const openPositions = await available_positions.find(query)

    if (!openPositions) {
        return NextResponse.json({}, { status: 200 })
    }


    // If the useer accessing the positions is the company that created them retrieve all data
    if (await company) {
        return NextResponse.json(openPositions, { status: 200 })
    } else {
        // If the user is not the company that created the positions remove the applied_users and chosen_user fields
        const filteredPositions = openPositions.map((position) => {
            const { _id, issuer_id, title, description, sector, location, weekly_hours, creation_time } = position.toObject()
            return {
                _id,
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


// Endpoint to create a new position
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

    const company = await isCompany(userId)
    // Check if the account is a company
    if (!company) {
        return NextResponse.json({error: "Invalid account type", code: "error-invalid-account-type"}, { status: 403 })
    } 

    const issuer_id = await getProfileId(userId)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const sector = formData.get("sector") as string
    const country = formData.get("country") as string
    const region = formData.get("region") as string
    const city = formData.get("city") as string
    const weekly_hours = parseInt(formData.get("weeklyHours") as string)

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
        applied_users: [],
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

    return NextResponse.json({message: "Application created successfully", data}, { status: 200 })

}


// Endpoint to modifi a position
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
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const sector = formData.get("sector") as string
    const country = formData.get("country") as string
    const region = formData.get("region") as string
    const city = formData.get("city") as string
    const weekly_hours = parseInt(formData.get("weeklyHours") as string)
    const chosen_user = formData.get("chosenUser") as string

    if (!token || !title || !description || !sector || !country || !region || !city || !weekly_hours) {
        return new NextResponse("Missing required fields", { status: 401 })
    }

    const profileId = await getProfileId(await checkSessionToken(token))
    if (!profileId) {
        return NextResponse.json({error: "Invalid token", code: "error-invalid-session-token"}, { status: 403 })
    }

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

    await connectDB();

    const update = await available_positions.updateOne(
        { _id: ObjectId.createFromHexString(formData.get("positionId") as string) },
        { $set: edit },
        {
            new: true,
            upsert: false,
        }
    );

    if (update.modifiedCount === 0) {
        return NextResponse.json({ error: "Error modifying application" }, { status: 500 });
    }

    return NextResponse.json({ message: "Application modified successfully" }, { status: 200 });
}

/**
 * @swagger
 * /api/positions:
 *   delete:
 *     summary: Elimina una posizione esistente
 *     description: Permette a un'azienda di eliminare una posizione esistente. L'utente deve essere autenticato e autorizzato.
 *     tags:
 *       - Positions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - positionId
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token di sessione dell'utente.
 *               positionId:
 *                 type: string
 *                 description: ID della posizione da eliminare.
 *     responses:
 *       200:
 *         description: Posizione eliminata con successo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Position deleted successfully
 *       400:
 *         description: Campi richiesti mancanti.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing required fields
 *                 code:
 *                   type: string
 *                   example: error-missing-fields
 *       403:
 *         description: Token non valido o non autorizzato.
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
 *       404:
 *         description: Posizione non trovata o non autorizzata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Position not found or unauthorized
 *                 code:
 *                   type: string
 *                   example: error-not-found
 *       405:
 *         description: Tipo di contenuto non supportato.
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
 */
export async function DELETE(req: NextRequest) {
    let formData;
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        const jsonData = await req.json();
        formData = new Map(Object.entries(jsonData));
    } else {
        return NextResponse.json({ error: "Unsupported content type", code: "error-invalid-request" }, { status: 405 });
    }

    const token = formData.get("token") as string;
    const positionId = formData.get("positionId") as string;

    if (!token || !positionId) {
        return NextResponse.json({ error: "Missing required fields", code: "error-missing-fields" }, { status: 400 });
    }

    const profileId = await getProfileId(await checkSessionToken(token));
    if (!profileId) {
        return NextResponse.json({ error: "Invalid token", code: "error-invalid-session-token" }, { status: 403 });
    }

    await connectDB();

    const deleteResult = await available_positions.deleteOne({
        _id: ObjectId.createFromHexString(positionId),
        issuer_id: profileId,
    });

    if (deleteResult.deletedCount === 0) {
        return NextResponse.json({ error: "Position not found or unauthorized", code: "error-not-found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Position deleted successfully" }, { status: 200 });
}