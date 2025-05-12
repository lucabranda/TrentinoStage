import { NextRequest, NextResponse } from "next/server"
import { checkSessionToken } from "@/utils/session"
import { isProfileOwner } from "@/utils/profiles"
import { getAccountInfo, getProfileId, isCompany } from "@/utils/accounts"

import { ObjectId } from "mongodb"
import { connectDB, checkBsonFormat } from "@/utils/db"
import profiles from "@/utils/model/profiles"
import accounts from "@/utils/model/accounts"




/**
 * @swagger
 * /api/profiles:
 *   get:
 *     summary: Retrieve profile information
 *     description: Given the profile ID and the authentication token, returns the profile information. If no profile ID is provided, it retrieves the user's own profile.
 *     tags: [Profiles]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Session token for authentication
 *       - in: query
 *         name: profileId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID of the profile to retrieve (if not provided the profile of the user making the request is returned)
 *     responses:
 *       200:
 *         description: Profile information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 surname:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 website:
 *                   type: string
 *                 birth_date:
 *                   type: string
 *                   format: date
 *                 address:
 *                   type: object
 *                   properties:
 *                     country:
 *                       type: string
 *                     region:
 *                       type: string
 *                     city:
 *                       type: string
 *                     postal_code:
 *                       type: string
 *                     street:
 *                       type: string
 *                     address:
 *                       type: string
 *                 identifier:
 *                   type: string
 *                 sector:
 *                   type: array
 *                   items:
 *                     type: string
 *                 isCompany:
 *                   type: boolean
 *                 profile_image:
 *                   type: string
 *       400:
 *         description: Invalid profile ID or other bad request
 *       401:
 *         description: Invalid session token
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/profiles:
 *   post:
 *     summary: Create a new profile
 *     description: Creates a new profile for the authenticated user. The user must not already have a profile.
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               isCompany:
 *                 type: string
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               country:
 *                 type: string
 *               region:
 *                 type: string
 *               city:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               street:
 *                 type: string
 *               address:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               bio:
 *                 type: string
 *               identifier:
 *                 type: string
 *               sector:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile created successfully
 *       400:
 *         description: Invalid input or unsupported content type
 *       401:
 *         description: Invalid session token or user already has a profile
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/profiles:
 *   put:
 *     summary: Edit an existing profile
 *     description: Updates the profile information for the authenticated user.
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sessionToken:
 *                 type: string
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               country:
 *                 type: string
 *               region:
 *                 type: string
 *               city:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               street:
 *                 type: string
 *               address:
 *                 type: string
 *               bio:
 *                 type: string
 *               sector:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile modified successfully
 *       400:
 *         description: Invalid input or unsupported content type
 *       401:
 *         description: Invalid session token
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */

// Given the profile ID and the authentication token returns the profile information
export async function GET(req: NextRequest) {
    const sessionToken = req.nextUrl.searchParams.get("token") as string
    let profileId = req.nextUrl.searchParams.get("profileId") as string ?? null

    // Check the session token
    const accountId = await checkSessionToken(sessionToken)
    if (!accountId) {
        return NextResponse.json({error: "Invalid session token", code: "error-invalid-session"}, { status: 401 })
    }

    // If the profileId is not provided return the info for own profile
    if (!profileId) {
        profileId = await getProfileId(accountId)
    }

    if (!checkBsonFormat(profileId)) {
        return NextResponse.json({error: "Invalid profile ID", code: "error-invalid-profile-id"}, { status: 400 })
    }

    await connectDB()

    const profile = await profiles.findOne({ _id: ObjectId.createFromHexString(profileId) })

    if (profile === null) {
        return new NextResponse("Profile not found", { status: 404 })
    }

    // Verify that the user is authorised to access the profile
    //   - The owner can access the full information on his profile
    //   - A user that is not the owner can only access the public information (name, surname, bio, website)
    //   - A company that is not the owner can only access the public information and the CV (name, surname, bio, website, CV)
    //   - An admin can access all the information

    const isOwner = isProfileOwner(profileId, accountId)
    const accountInfo = getAccountInfo(accountId)

    const name = profile.name
    const surname = profile.surname
    const bio = profile.bio
    const website = profile.website
    const address = profile.address

    if (await isOwner) {
        return NextResponse.json({
            name: name, 
            surname: surname, 
            bio: bio, 
            website: website,
            birthDate: profile.birth_date,
            address: profile.address,
            identifier: profile.identifier,
            sector: profile.sector,
            isCompany: profile.is_company,
            profile_image: profile.profile_image
        }, { status: 200 })
    } else if ((await accountInfo).role === "company-manager" || (await accountInfo).role === "company-employee") {
        return NextResponse.json({
            name: name, 
            surname: surname, 
            bio: bio, 
            website: website,
            birthDate: profile.birth_date,
            address: profile.address,
            identifier: profile.identifier,
            sector: profile.sector,
            isCompany: profile.is_company,
            profile_image: profile.profile_image
        }, { status: 200 })
    } else if ((await accountInfo).role === "admin") {
        return NextResponse.json({
            name: name, 
            surname: surname, 
            bio: bio, 
            website: website,
            birthDate: profile.birth_date,
            address: profile.address,
            identifier: profile.identifier,
            sector: profile.sector,
            cv: profile.cv,
            isCompany: profile.is_company,
            profile_image: profile.profile_image
        }, { status: 200 })
    } else {
        return NextResponse.json({
            name: name, 
            surname: surname, 
            bio: bio, 
            website: website,
            isCompany: profile.is_company,
            profile_image: profile.profile_image
        }, { status: 200 })
    }

}

// Creates the profile
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

    const sessionToken = formData.get("token") as string
    const profileId = await checkSessionToken(sessionToken)
    const isCompany = stringToBool(formData.get("isCompany") as string)
    const name = formData.get("name") as string
    const surname = formData.get("surname") as string
    const country = formData.get("country") as string
    const region = formData.get("region") as string
    const city = formData.get("city") as string
    const postalCode = formData.get("postalCode") as string
    const street = formData.get("street") as string
    const address = formData.get("address") as string
    let birthDate = formData.get("birthDate") as string
    const profileImage = formData.get("profileImage") as string ?? null

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
        if (isCompany) {
            return NextResponse.json({error: "P.iva is required", code: "error-piva-required"}, { status: 401 })
        } else {
            return NextResponse.json({error: "CF is required", code: "error-cf-required"}, { status: 401 })
        }
    }
    if (sector === null) {
        return NextResponse.json({error: "Sector is required", code: "error-sector-required"}, { status: 401 })
    }

    // If the user is a company check the presence of an address, sector and the correctness of the identifier
    if (isCompany) {
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
    let sectors
    try {
        sectors = JSON.parse(sector)
    } catch {
        return NextResponse.json({error: "Sector has to be in a valid json format"}, { status: 400 })
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
            sector: sectors,
            website: website,
            is_company: isCompany
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

// Edits the profile
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

    const sessionToken = formData.get("sessionToken") as string
    const userId = await checkSessionToken(sessionToken)

    if (!userId) {
        return NextResponse.json({error: "Invalid session token", code: "error-invalid-session-token"}, { status: 401 })
    }

    const profileId = await getProfileId(userId)

    // Check the existence of the profile
    if (!profileId) {
        return NextResponse.json({error: "Profile not found", code: "error-profile-not-found"}, { status: 404 })
    }

    const name = formData.get("name") as string ?? null
    const surname = formData.get("surname") as string ?? null
    const address = formData.get("address") as {
        address: string
        city: string
        region: string
        country: string
        postal_code: string
        street: string
    } | null ?? null
  
    /*
    const region = address?.region as string ?? null
    const city = address?.city as string ?? null
    const postalCode = address?.postal_code as string ?? null
    const street = address?.street as string ?? null
    const country = address?.country as string ?? null
    */
    const birthDate = formData.get("birth_date") as string ?? null
    const profileImage = formData.get("profile_image") as string ?? null

    const bio = formData.get("bio") as string ?? null
    const sector = formData.get("sector") as string ?? null
    const website = formData.get("website") as string ?? null
    const profileImage = formData.get("profileImage") as string ?? null

    // Check if the profileImage is in a valid format
    if (profileImage && ( !isValidBase64Image(profileImage) || !isSizeOk(profileImage) )) {
        return NextResponse.json({error: "Profile image is not in a valid format or is too large"}, { status: 400 })
    }

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
    if (address) {
        addressObj['address'] = address.address
        addressObj['city'] = address.city
        addressObj['region'] = address.region
        addressObj['country'] = address.country
        addressObj['postal_code'] = address.postal_code
        addressObj['street'] = address.street
    }
    /*
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
    if (profileImage) {
        edit['profile_image'] = profileImage
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