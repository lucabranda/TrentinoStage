import { NextRequest, NextResponse } from "next/server"
import { checkSessionToken } from "@/utils/session"
import { getProfileId } from "@/utils/accounts"
import { GridFSBucket } from "mongodb"
import { connectDB } from "@/utils/db"
import { isProfileCompany, isProfileOwner } from "@/utils/profiles"



/**
 * @swagger
 * /api/cv:
 *   post:
 *     summary: Upload a CV file for the authenticated user
 *     description: Uploads a single CV file (PDF, DOC, etc.) for the authenticated user. Only one file per user is allowed.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Session token for authentication
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The CV file to upload
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               file:
 *                 type: string
 *                 description: Base64-encoded file content (not recommended)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User already uploaded a file
 *       405:
 *         description: Unsupported content type
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     summary: Download a user's CV file
 *     description: Returns the CV file for the specified profile if the requester is the owner or a company.
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
 *         required: true
 *         description: Profile ID of the user whose CV is requested
 *     responses:
 *       200:
 *         description: File download stream
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized or invalid session token
 *       404:
 *         description: No files found
 *       500:
 *         description: Database connection error
 *
 *   delete:
 *     summary: Delete the authenticated user's CV file
 *     description: Deletes the CV file associated with the authenticated user's profile.
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Session token for authentication
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       401:
 *         description: Missing required fields or invalid session token
 *       404:
 *         description: No files found for this profile
 *       500:
 *         description: Failed to delete file or database connection error
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
        return new NextResponse(JSON.stringify({error: "Unsupported content type"}), { status: 405 })
    }

    const token = formData.get("token") as string
    const file = formData.get('file') as File;

    try {

        const isAuthenticated = await checkSessionToken(token)
        
        
        if (!isAuthenticated) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        // Get the profile id from the session token
        const profileId = await getProfileId(isAuthenticated)
        
        
        if (!file) {
          return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        }
    
        if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        }
        

        const buffer = Buffer.from(await file.arrayBuffer())
        
        const mongooseConnection = await connectDB()
        const db = mongooseConnection.connection.db

        if (!db) {
            throw new Error("Database connection is not established")
        }

        
        // Create a GridFS bucket
        const bucket = new GridFSBucket(db, { bucketName: "uploads" })

        // Check if the user already uploaded a file 
        const files = (await bucket.find({ "metadata.profile_id": profileId }).toArray()).length
        if (files >= 1) {
            return NextResponse.json({ error: "User already uploaded a file" }, { status: 403 })
        }


        const uploadStream = bucket.openUploadStream(file.name, { contentType: file.type, metadata: { profile_id: profileId } })
        uploadStream.end(buffer)

        return NextResponse.json({ message: "File uploaded successfully" })
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
        console.error(errorMessage)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

    const downloadStream = bucket.openDownloadStream(file._id)
    

    const headers = new Headers()
    headers.set("Content-Type", file.contentType || "application/octet-stream")
    headers.set("Content-Disposition", `attachment; filename="${file.filename}"`)

    return new Response(downloadStream as any, {
        status: 200,
        headers,
    })

}


export async function DELETE(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token") as string

    if (!token) {
        return NextResponse.json({ error: "Missing required fields", code: "error-missing-fields" }, { status: 401 })
    }

    const accountId = await checkSessionToken(token)
    const profileId = await getProfileId(accountId)

    if (!profileId) {
        return NextResponse.json({ error: "Invalid session token", code: "error-invalid-session" }, { status: 401 })
    }

    const mongooseConnection = await connectDB()
    const db = mongooseConnection.connection.db
    if (!db) {
        return NextResponse.json({ error: "Database connection is not established", code: "error-db-connection" }, { status: 500 })
    }
    const bucket = new GridFSBucket(db, { bucketName: "uploads" })

    // Check if the user has uploaded a file
    const files = await bucket.find({ "metadata.profile_id": profileId }).toArray()
    if (files.length === 0) {
        return NextResponse.json({ error: "No files found for this profile", code: "error-no-files" }, { status: 404 })
    }

    try {

        // Delete the file
        const fileId = files[0]._id
        await bucket.delete(fileId)

    } catch (err) {
        console.error("Error deleting file:", err);
        return NextResponse.json({ error: "Failed to delete file", code: "error-delete-failed" }, { status: 500 });
    }

    return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });

}