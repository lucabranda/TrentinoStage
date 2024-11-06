import { NextRequest, NextResponse } from 'next/server'
import { DBClient } from '@/utils/db'


// Get the profile details for a user
export async function GET(req: NextRequest) {
    const db = new DBClient()

    // Get the profile_id for the user
    const accounts = db.selectCollection("accounts")

    const user = req.nextUrl.searchParams.get('username') ?? null

    if (user === null) {
        return new NextResponse("User is missing", { status: 400 })
    }

    const profileID = await accounts.findOne({username: user}).then((profile) => {
        if (!profile) {
            return null
        }
        return profile.profile_id
    })

    if (profileID === null) {
        return new NextResponse("Profile not founda", { status: 404 })
    }

    // Get the profile details
    const profiles = db.selectCollection("profiles")

    const profile = await profiles.findOne({_id: profileID})

    if (!profile) {
        return new NextResponse("Profile not foundb", { status: 404 })
    }

    return new NextResponse(JSON.stringify(profile), { status: 200 })
}
