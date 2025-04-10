
import { NextRequest, NextResponse } from "next/server"
import { checkSessionToken } from "@/utils/session"
import { isProfileOwner } from "@/utils/profiles"
import { getAccountInfo } from "@/utils/accounts"

import { ObjectId } from "mongodb"
import connectDB from "@/utils/db"
import profiles from "@/utils/model/profiles"

// Given the profile ID and the authentication token returns the profile information


/**
 * @swagger
 * /api/profiles/get:
 *   get:
 *     summary: Retrieve profile information
 *     description: Given the profile ID and the authentication token, returns the profile information.
 *     tags: [Profiles]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: Session token for authentication
 *         schema:
 *           type: string
 *       - in: query
 *         name: profileId
 *         required: true
 *         description: ID of the profile to retrieve
 *         schema:
 *           type: string
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
 *                   type: string
 *                 identifier:
 *                   type: string
 *                 sector:
 *                   type: string
 *                 cv:
 *                   type: string
 *       401:
 *         description: Invalid session token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *       404:
 *         description: Profile not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
export async function GET(req: NextRequest) {
    const sessionToken = req.nextUrl.searchParams.get("token") as string
    const profileId = req.nextUrl.searchParams.get("profileId") as string

    // Check the session token
    const accountId = await checkSessionToken(sessionToken)

    if (!accountId) {
        return NextResponse.json({error: "Invalid session token", code: "error-invalid-session"}, { status: 401 })
    }

    // Check if the profile exists
    
    await connectDB()

    const profile = await profiles.findOne({ _id: ObjectId.createFromHexString(profileId) })
 
    console.log(profile)

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
    
    if (await isOwner) {
        return NextResponse.json({
            name: name, 
            surname: surname, 
            bio: bio, 
            website: website,
            birth_date: profile.birth_date,
            address: profile.address,
            identifier: profile.identifier,
            sector: profile.sector
        }, { status: 200 })
    } else if ((await accountInfo).role === "company-manager" || (await accountInfo).role === "company-employee") {
        return NextResponse.json({
            name: name, 
            surname: surname, 
            bio: bio, 
            website: website,
            cv: profile.cv
        }, { status: 200 })
    } else if ((await accountInfo).role === "admin") {
        return NextResponse.json({
            name: name, 
            surname: surname, 
            bio: bio, 
            website: website,
            birth_date: profile.birth_date,
            address: profile.address,
            identifier: profile.identifier,
            sector: profile.sector,
            cv: profile.cv
        }, { status: 200 })
    } else {
        return NextResponse.json({
            name: name, 
            surname: surname, 
            bio: bio, 
            website: website
        }, { status: 200 })
    }

}