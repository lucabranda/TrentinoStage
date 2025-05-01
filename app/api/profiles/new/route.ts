import { NextRequest, NextResponse } from 'next/server'
import { checkSessionToken } from '@/utils/session'
import { ObjectId } from 'mongodb'

import { connectDB } from '@/utils/db'
import accounts from '@/utils/model/accounts'
import profiles from '@/utils/model/profiles'
import { profile } from 'console'

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
 *               is_company:
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
    } else if (contentType.includes("application/json")) {
        const jsonData = await req.json()
        formData = new Map(Object.entries(jsonData))
    } else {
        return NextResponse.json({error: "Unsupported content type", code: "error-invalid-request"}, { status: 405 })
    }

    const sessionToken = formData.get("sessionToken") as string
    const profileId = await checkSessionToken(sessionToken)
    const is_company = stringToBool(formData.get("is_company") as string)
    const name = formData.get("name") as string
    const surname = formData.get("surname") as string
    const country = formData.get("country") as string
    const region = formData.get("region") as string
    const city = formData.get("city") as string
    const postalCode = formData.get("postalCode") as string
    const street = formData.get("street") as string
    const address = formData.get("address") as string
    let birthDate = formData.get("birthDate") as string
    const profileImage = formData.get("profile_image") as string ?? null

    const bio = formData.get("bio") as string ?? null
    const identifier = formData.get("identifier") as string
    const sector = formData.get("sector") as string
    const website = formData.get("website") as string ?? null

    // Check if the session token is valid
    if (!profileId) {
        return NextResponse.json({error: "Invalid session token", code: "error-invalid-session"}, { status: 401 })
    }
    
    // Check if the user doesn't have a profile already
    const existingProfile = await accounts.findOne({_id: ObjectId.createFromHexString(profileId), profile_id: null})
    if (!existingProfile) {
        return NextResponse.json({error: "User already has a profile", code: "error-profile-already-exists"}, { status: 401 })
    }

    // Check if the profileImage is in a valid format
    if (profileImage && ( !isValidBase64Image(profileImage) || !isSizeOk(profileImage) )) {
        return NextResponse.json({error: "Profile image is not in a valid format or is too large"}, { status: 400 })
    }

    // Check all the inputs 
    if (name === null) {
        return NextResponse.json({error: "Name is required", code: "error-name-not-provided"}, { status: 401 })
    }
    if (identifier === null) {
        if (is_company) {
            return NextResponse.json({error: "P.iva is required", code: "error-piva-required"}, { status: 401 })
        } else {
            return NextResponse.json({error: "CF is required", code: "error-cf-required"}, { status: 401 })
        }
    }
    if (sector === null) {
        return NextResponse.json({error: "Sector is required", code: "error-sector-required"}, { status: 401 })
    }

    // If the user is a company check the presence of an address, sector and the correctness of the identifier
    if (is_company) {
        if (country === null) {
            return NextResponse.json({error: "Country is required", code: "error-country-required"}, { status: 401 })
        }
        if (region === null) {
            return NextResponse.json({error: "Region is required", code: "error-region-required"}, { status: 401 })
        }
        if (city === null) {
            return NextResponse.json({error: "City is required", code: "error-city-required"}, { status: 401 })
        }
        if (postalCode === null) {
            return NextResponse.json({error: "Postal code is required", code: "error-postal-code-required"}, { status: 401 })
        }
        if (street === null) {
            return NextResponse.json({error: "Street is required", code: "error-street-required"}, { status: 401 })
        }
        if (address === null) {
            return NextResponse.json({error: "Address is required", code: "error-address-required"}, { status: 401 })
        }
        birthDate = new Date().toUTCString()
        // TODO: Check the correctness of the P.iva
    } else {
        if (surname === null) {
            return NextResponse.json({error: "Surname is required", code: "error-surname-required"}, { status: 401 })
        }
        if (birthDate === undefined) {
            return NextResponse.json({error: "Please provide a date of birth", code: "error-birth-date-required"}, { status: 401 })
        }
        // TODO: Check the correctness of the fiscal code
    }

    await connectDB()
    // Create the profile on the database
    try {
        const result = await profiles.create({
            name: name,
            surname: surname,
            birth_date: birthDate,
            profile_image: profileImage,
            address: {
                country: country,
                region: region,
                city: city,
                postal_code: postalCode,
                street: street,
                address: address,
            },
            bio: bio,
            identifier: identifier,
            sector: [sector],
            website: website,
            is_company: is_company
        })

        await result.save()

        // Link the profile to the user
        await accounts.updateOne({_id: ObjectId.createFromHexString(profileId)}, {$set: {profile_id: result._id.toHexString()}})
    } catch (e) {
        console.error(e)
        return NextResponse.json({error: "Internal server error", code: "error-internal-server"}, { status: 500 })
    }

    return NextResponse.json({message: "Profile created"}, { status: 200 })
}


function stringToBool(str: string): boolean {
    return str === "true"
}

function isValidBase64Image(data: string): boolean {
    const base64ImageRegex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=\s]+$/
    return base64ImageRegex.test(data)
}

function isSizeOk(data: string): boolean {
    const base64Length = data.split(',')[1]?.length || 0
    const sizeInBytes = (base64Length * 3) / 4
    return sizeInBytes <= 2 * 1024 * 1024 // 2MB
}