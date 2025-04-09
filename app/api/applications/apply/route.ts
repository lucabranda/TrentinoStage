// Endpoint to apply for a new application

import { NextRequest, NextResponse } from "next/server";
import { checkSessionToken } from "@/utils/session"
import { getProfileId, isCompany } from "@/utils/accounts"
import available_positions from "@/utils/model/available_positions"
import connectDB from "@/utils/db";
import { profile } from "console";


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
    const profileId = await getProfileId(userId)
    const company = isCompany(userId)

    if (!userId) {
        return NextResponse.json({error: "Invalid token", code: "error-invalid-token"}, { status: 403 })
    }

    const appId = formData.get("applicationId") as string
    if (!appId) {
        return NextResponse.json({error: "Invalid request missing applicationId field", code: "error-invalid-request"}, { status: 405 })
    }

    if (await company) {
        return NextResponse.json({error: "Invalid account type. Companies can't apply", code: "error-invalid-account-type"}, { status: 403 })
    }

    await connectDB()

    const application = {
        user_id: profileId,
        application_time: new Date().toISOString()
    }

    const res = await available_positions.findOneAndUpdate({ _id: appId }, { $addToSet: { applied_users: application } })
    res.save()

    if (res.modifiedCount === 0) {
        return NextResponse.json({error: "Application not found", code: "error-application-not-found"}, { status: 404 })
    }

    return NextResponse.json({message: "Application created successfully"}, { status: 200 })
}