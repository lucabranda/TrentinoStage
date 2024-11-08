import { NextRequest, NextResponse } from 'next/server'
import { DBClient } from '@/utils/db'
import { checkSessionToken } from '@/utils/session'
import { ObjectId } from 'mongodb'

/**
 * @swagger
 * /api/profiles/new:
 *     produces:
 *       - application/json
 *     post:
 *      summary: Create a new profile and link it to the user
 *      description: Create a new profile and link it to the user. The profile can be a company or a person
 *      tags: ["Profiles"]
 *      consumes:
 *       - multipart/form-data
 *      requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sessionToken:
 *                  type: string
 *                  description: The authentication token
 *               isCompany:
 *                  type: boolean
 *                  description: True if the profile is a company, false if it's a person
 *               name:
 *                  type: string
 *                  description: The name of the profile
 *               surname:
 *                  type: string
 *                  description: The surname of the profile
 *               country:
 *                  type: string
 *                  description: The country where the user/company is located
 *               region:
 *                  type: string
 *                  description: The region where the user/company is located
 *               city:
 *                  type: string
 *                  description: The city where the user/company is located
 *               postalCode:
 *                  type: string
 *                  description: The postal code where the user/company is located
 *               street:
 *                  type: string
 *                  description: The street where the user/company is located
 *               address:
 *                  type: string
 *                  description: The full address where the user/company is located
 *               birthDate:
 *                  type: string
 *                  format: date
 *                  description: The birth date of the user
 *               bio:
 *                  type: string
 *                  description: A short biography of the user/company
 *               identifier:
 *                  type: string
 *                  description: The fiscal code or P.iva of the user/company
 *               sector:
 *                  type: string
 *                  description: The sector in which the user/company operates
 *               website:
 *                  type: string
 *                  description: The website of the user/company
 *      responses:
 *       200:
 *         description: Profile created successfully
 *         content:
 *          application/json:
 *           schema:
 *            type: object
 *            properties:
 *             message: 
 *              type: string
 *              description: Successfully created the profile
 *           examples:
 *             application/json:
 *               value:
 *                 message: "Profile created"
 *       401:
 *         description: Unauthorized or missing required fields
 *         content:
 *          application/json:
 *           schema:
 *            type: object
 *            properties:
 *             error:
 *              type: string
 *              description: Error message
 *           examples:
 *             application/json:
 *               value:
 *                 error: "Invalid session token"
 *       405:
 *         description: Unsupported content type
 *         content:
 *          application/json:
 *           schema:
 *            type: object
 *            properties:
 *             error:
 *              type: string
 *              description: Error message
 *           examples:
 *             application/json:
 *               value:
 *                 error: "Unsupported content type"
 *       500:
 *         description: Internal server error
 *         content:
 *          application/json:
 *           schema:
 *            type: object
 *            properties:
 *             error:
 *              type: string
 *              description: Error message
 *           examples:
 *             application/json:
 *               value:
 *                 error: "Internal server error"
 */
export async function POST(req: NextRequest) {

    let formData
    const contentType = req.headers.get("content-type") ?? ""

    if (contentType.includes("multipart/form-data")) {
        formData = await req.formData()
    } else {
        return NextResponse.json({error: "Unsupported content type"}, { status: 405 })
    }

    const sessionToken = formData.get("sessionToken") as string
    const profileId = await checkSessionToken(sessionToken)
    const isCompany = stringToBool(formData.get("isCompany") as string)
    const name = formData.get("name") as string
    const surname = formData.get("surname") as string
    const country = formData.get("address") as string
    const region = formData.get("region") as string
    const city = formData.get("city") as string
    const postalCode = formData.get("postalCode") as string
    const street = formData.get("street") as string
    const address = formData.get("address") as string
    const birthDate = formData.get("birthDate") as string

    const bio = formData.get("bio") as string ?? null
    const identifier = formData.get("identifier") as string
    const sector = formData.get("sector") as string
    const website = formData.get("website") as string ?? null

    // Check if the session token is valid
    if (!profileId) {
        return NextResponse.json({error: "Invalid session token"}, { status: 401 })
    }
    // Check if the user doesn't have a profile already
    const db = new DBClient()
    const accounts = db.selectCollection("accounts")

    const existingProfile = await accounts.findOne({_id: ObjectId.createFromHexString(profileId), profile_id: null})
    if (existingProfile) {
        return NextResponse.json({error: "User already has a profile"}, { status: 401 })
    }


    // Check all the inputs 
    if (name === null) {
        return NextResponse.json({error: "Name is required"}, { status: 401 })
    }
    if (identifier === null) {
        return NextResponse.json({error: "CF/P.iva is required"}, { status: 401 })
    }
    if (sector === null) {
        return NextResponse.json({error: "Sector is required"}, { status: 401 })
    }

    // If the user is a company check the presence of an address, sector and the correctness of the identifier
    if (isCompany) {
        if (country === null) {
            return NextResponse.json({error: "Country is required"}, { status: 401 })
        }
        if (region === null) {
            return NextResponse.json({error: "Region is required"}, { status: 401 })
        }
        if (city === null) {
            return NextResponse.json({error: "City is required"}, { status: 401 })
        }
        if (postalCode === null) {
            return NextResponse.json({error: "Postal code is required"}, { status: 401 })
        }
        if (street === null) {
            return NextResponse.json({error: "Street is required"}, { status: 401 })
        }
        if (address === null) {
            return NextResponse.json({error: "Address is required"}, { status: 401 })
        }
        // TODO: Check the correctness of the P.iva
    } else {
        if (surname === null) {
            return NextResponse.json({error: "Surname is required"}, { status: 401 })
        }
        // TODO: Check the correctness of the fiscal code
    }


    // Create the profile on the database
    const profiles = db.selectCollection("profiles")

    const result = await profiles.insertOne({
        name: name,
        surname: surname,
        birthDate: new Date(Date.parse(birthDate)).toISOString(),
        address: {
            country: country,
            region: region,
            city: city,
            postalCode: postalCode,
            street: street,
            address: address,
        },
        bio: bio,
        identifier: identifier,
        sector: [sector],
        website: website,
        isCompany: isCompany
    })

    // Link the profile to the user
    await accounts.updateOne({_id: ObjectId.createFromHexString(profileId)}, {$set: {profile_id: result.insertedId.toHexString()}})

    return NextResponse.json({message: "Profile created"}, { status: 200 })
}


function stringToBool(str: string): boolean {
    return str === "true"
}