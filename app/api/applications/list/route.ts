import { NextRequest, NextResponse } from 'next/server'

import { checkSessionToken } from '@/utils/session'
import { getProfileId, isCompany } from '@/utils/accounts'

import connectDB from '@/utils/db'
import applications from '@/utils/model/available_positions'

// Api endpoint to lis all the open positions for a company
// If the user is not a company restrict the access to the applied_users and chosen_user fields
// If the user is the company that created the position return all the fields


export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token") as string
    const companyProfile = req.nextUrl.searchParams.get("profileId") as string

    if (!token) {
        return NextResponse.json({error: "Missing required fields", code: "error-missing-fields"}, { status: 401 })
    }

    const accountId = await checkSessionToken(token)
    const profileId = getProfileId(accountId)
    const company = isCompany(accountId)


    if (!accountId) {
        return NextResponse.json({error: "Invalid session token", code: "error-invalid-session"}, { status: 401 })
    }

    await connectDB()

    const openPositions = await applications.find({ issuer_id: companyProfile, chosen_user: "" })

    if (!openPositions) {
        return NextResponse.json({}, { status: 200 })
    }

    


    
    if (await company) {

    }

}
