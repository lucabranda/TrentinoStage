import { NextRequest, NextResponse } from "next/server"
import { checkSessionToken } from "@/utils/session"
import { sanitize } from "string-sanitizer"


import { connectDB } from "@/utils/db"
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
 *               postalCode:
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

    const name = sanitize(formData.get("name") as string) ?? null
    const surname = sanitize(formData.get("surname") as string) ?? null
    const country = sanitize(formData.get("address") as string) ?? null
    const region = sanitize(formData.get("region") as string) ?? null
    const city = sanitize(formData.get("city") as string) ?? null
    const postalCode = sanitize(formData.get("postalCode") as string) ?? null
    const street = sanitize(formData.get("street") as string) ?? null
    const address = sanitize(formData.get("address") as string) ?? null

    const bio = formData.get("bio") as string ?? null
    const sector = formData.get("sector") as string ?? null
    const website = formData.get("website") as string ?? null

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
    if (postalCode) {
        addressObj['postalCode'] = postalCode
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