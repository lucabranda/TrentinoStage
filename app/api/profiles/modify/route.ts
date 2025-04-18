import { NextRequest, NextResponse } from "next/server"
import { checkSessionToken } from "@/utils/session"
import { sanitize } from "string-sanitizer"
import dayjs from "dayjs"

import connectDB from "@/utils/db"
import profiles from "@/utils/model/profiles"
import { getProfileId } from "@/utils/accounts"
import { ObjectId } from "mongodb"

/**
 * @swagger
 * /api/profiles/modify:
 *   post:
 *     summary: Modify user profile
 *     description: Endpoint to modify user profile details.
 *     tags: [Profiles]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sessionToken:
 *                 type: string
 *                 description: Session token for authentication.
 *                 example: "your-session-token"
 *               name:
 *                 type: string
 *                 description: User's first name.
 *                 example: "John"
 *               surname:
 *                 type: string
 *                 description: User's surname.
 *                 example: "Doe"
 *               country:
 *                 type: string
 *                 description: User's country.
 *                 example: "USA"
 *               region:
 *                 type: string
 *                 description: User's region.
 *                 example: "California"
 *               city:
 *                 type: string
 *                 description: User's city.
 *                 example: "Los Angeles"
 *               postal_code:
 *                 type: string
 *                 description: User's postal code.
 *                 example: "90001"
 *               street:
 *                 type: string
 *                 description: User's street.
 *                 example: "123 Main St"
 *               address:
 *                 type: string
 *                 description: User's address.
 *                 example: "123 Main St, Apt 4B"
 *               bio:
 *                 type: string
 *                 description: User's bio.
 *                 example: "Software Developer"
 *               sector:
 *                 type: string
 *                 description: User's sector. Multiple sectors can be separated by commas.
 *                 example: "Technology, Software"
 *               website:
 *                 type: string
 *                 description: User's website.
 *                 example: "https://example.com"
 *     responses:
 *       200:
 *         description: Profile modified successfully.
 *       401:
 *         description: Invalid session token.
 *       405:
 *         description: Unsupported content type.
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

    const sessionToken = sanitize(formData.get("sessionToken") as string)
    const userId = await checkSessionToken(sessionToken)

    if (!userId) {
        return NextResponse.json({error: "Invalid session token", code: "error-invalid-session-token"}, { status: 401 })
    }

    const profileId = await getProfileId(userId)

    // Check the existence of the profile
    if (!profileId) {
        return NextResponse.json({error: "Profile not found", code: "error-profile-not-found"}, { status: 404 })
    }

    const name = safeSanitize(formData.get("name"))
    const surname = safeSanitize(formData.get("surname"))
    const country = safeSanitize(formData.get("country"))
    const region = safeSanitize(formData.get("region"))
    const city = safeSanitize(formData.get("city")) 
    const postal_code = safeSanitize(formData.get("postal_code")  )
    const street = safeSanitize(formData.get("street"))
    const address = safeSanitize(formData.get("address"))
    const identifier = safeSanitize(formData.get("identifier") )
    const bio = safeSanitize(formData.get("bio"))
    const sector = safeSanitize(formData.get("sector") )
    const website = safeSanitize(formData.get("website"))

    const rawBirthDate = formData.get("birthDate")
    const birth_date = typeof rawBirthDate === "string" ? rawBirthDate.trim() : null

    let edit: { 
        [key: string]: string | null | { [key: string]: string | null } | string[]
    } = {}

    if (name) {
        edit['name'] = name
    }
    if (surname) {
        edit['surname'] = surname
    }
    let addressObj: { 
        [key: string]: string | null 
    } = {}

    if (country) {
        addressObj['country'] = country
    }
    if (region) {
        addressObj['region'] = region
    }
    if (city) {
        addressObj['city'] = city
    }
    if (postal_code) {
        addressObj['postal_code'] = postal_code
    }
    if (street) {
        addressObj['street'] = street
    }
    if (address) {
        addressObj['address'] = address
    }

    if (Object.keys(addressObj).length > 0) {
        edit['address'] = addressObj
    }
    if (bio) {
        edit['bio'] = bio
    }
    if (sector) {
        const sectors = sector.split(",")
        edit['sector'] = sectors
    }
    if (website) {
        edit['website'] = website
    }
    if(identifier){
        edit['identifier'] = identifier
    }

    if (birth_date) {
        const parsedDate = dayjs(birth_date)
        if (parsedDate.isValid()) {
            edit['birth_date'] = parsedDate.format("MM-DD-YYYY")
        } else {
            return NextResponse.json({ error: "Invalid birth date format", code: "error-invalid-date" }, { status: 400 })
        }
    }


    await connectDB()

    const update = await profiles.updateOne({ _id: ObjectId.createFromHexString(profileId) }, edit,{
        new: true,
        upsert: true,
        // Return additional properties about the operation, not just the document
        includeResultMetadata: true
    })

    if (update.modifiedCount === 0) {
        return NextResponse.json({error: "Error modifying profile"}, { status: 500 })
    }

    return NextResponse.json({message: "Profile modified successfully"}, { status: 200 })

}

function safeSanitize(input: unknown): string | null {
    if (typeof input !== "string") return null

    return input
        .replace(/<[^>]*>?/gm, "")      // Rimuove tag HTML
        .replace(/[^\p{L}\p{N}\s.,'-]/gu, "") // Lascia lettere, numeri, spazi, punteggiatura base
        .trim()
}
