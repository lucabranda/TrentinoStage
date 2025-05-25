import { NextRequest, NextResponse } from "next/server";
import { checkSessionToken } from "@/utils/session"
import { getProfileId } from "@/utils/accounts";
import { GridFSBucket } from "mongodb"
import { connectDB } from "@/utils/db";
import { isProfileCompany, isProfileOwner } from "@/utils/profiles";

export async function POST(req: NextRequest) {
    let formData
    const contentType = req.headers.get("content-type") ?? ""

    if (contentType.includes("multipart/form-data")) {
        formData = await req.formData()
    } else if (contentType.includes("application/json")) {
        const jsonData = await req.json()
        formData = new Map(Object.entries(jsonData))
    } else {
        return new NextResponse(JSON.stringify({error: "Unsupported content type"}), { status: 405 })
    }

    const token = formData.get("token") as string
    const file = formData.get('file') as File;

    try {

        const isAuthenticated = await checkSessionToken(token);
        
        
        if (!isAuthenticated) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Get the profile id from the session token
        const profileId = await getProfileId(isAuthenticated);
        
        
        if (!file) {
          return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }
    
        if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        }
        

        const buffer = Buffer.from(await file.arrayBuffer());
        
        const mongooseConnection = await connectDB();
        const db = mongooseConnection.connection.db;

        if (!db) {
            throw new Error("Database connection is not established");
        }

        // Create a GridFS bucket and upload the file
        const bucket = new GridFSBucket(db, { bucketName: "uploads" });
        const uploadStream = bucket.openUploadStream(file.name, { contentType: file.type, metadata: { profile_id: profileId } });
        uploadStream.end(buffer);
    
        return NextResponse.json({ message: "File uploaded successfully" });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        console.error(errorMessage);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token") as string
    const reqProfileId = req.nextUrl.searchParams.get("profileId") as string

    const profileId = await checkSessionToken(token)
    if (!profileId) {
        return NextResponse.json({error: "Invalid session token", code: "error-invalid-session"}, { status: 401 })
    }
    if (!reqProfileId) {
        return NextResponse.json({error: "Missing profile id", code: "error-missing-fields"}, { status: 400 })
    }

    // Only the owner of the profile and companies can access the CV
    if (!isProfileOwner(reqProfileId, profileId) || !isProfileCompany(profileId)) {
        return NextResponse.json({error: "Unauthorized", code: "error-unauthorized"}, { status: 401 })
    }

    const mongooseConnection = await connectDB();
    const db = mongooseConnection.connection.db;
    if (!db) {
        return NextResponse.json({error: "Database connection is not established"}, { status: 500 })
    }

    const bucket = new GridFSBucket(db, { bucketName: "uploads" });
    
    const files = await bucket.find({ "metadata.profile_id": reqProfileId }).toArray();
    const file = files[0]

    if (!file) {
        return NextResponse.json({error: "No files found"}, { status: 404 })
    }

    console.log(file)

    const downloadStream = bucket.openDownloadStream(file._id)
    

    const headers = new Headers()
    headers.set("Content-Type", file.contentType || "application/octet-stream")
    headers.set("Content-Disposition", `attachment; filename="${file.filename}"`)

    return new Response(downloadStream as any, {
        status: 200,
        headers,
    })

}