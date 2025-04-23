import { NextRequest, NextResponse } from 'next/server'
import { checkSessionToken } from '@/utils/session'
import { getProfileId, getAccountInfo } from '@/utils/accounts'

import { connectDB } from '@/utils/db'
import invite_tokens from '@/utils/model/invite_tokens'
import { randomBytes } from 'crypto'

// Creates an nvitation token to the relative profile
/**
 * @swagger
 * /api/profiles/invite:
 *   get:
 *     summary: Creates an invitation token for a profile
 *     description: Generates an invitation token for a profile based on the provided session token, duration, and role.
 *     tags: [Profiles]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: Session token to validate the request
 *         schema:
 *           type: string
 *       - in: query
 *         name: duration
 *         required: true
 *         description: Duration for the invitation token in the format "1h", "1d", "1w", or "1m"
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         required: true
 *         description: Role for the invitation token (company-manager or company-employee)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation token created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The generated invitation token
 *       400:
 *         description: Invalid role provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                 code:
 *                   type: string
 *                   description: Error code
 *       401:
 *         description: Invalid session token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                 code:
 *                   type: string
 *                   description: Error code
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                 code:
 *                   type: string
 *                   description: Error code
 *       500:
 *         description: Couldn't create token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                 code:
 *                   type: string
 *                   description: Error code
 */
export async function GET(req: NextRequest) {
    const sessionToken = req.nextUrl.searchParams.get("token") as string
    const tokenDuration = req.nextUrl.searchParams.get("duration") as string
    const role = req.nextUrl.searchParams.get("role") as string

    // Check the session token
    const accountId = await checkSessionToken(sessionToken)

    if (checkRole(role) === false) {
        return NextResponse.json({error: "Invalid role (the only available options are company-manager and company-employee)", code: "error-invalid-role"}, { status: 400 })
    }

    if (accountId === null) {
        return NextResponse.json({error: "Invalid session token", code: "error-invalid-session"}, { status: 401 })
    }

    const accountRole = await getAccountInfo(accountId).then(account => {
        return account.role
    })
    if (accountRole !== 'company-manager') {
        return NextResponse.json({error: "You don't have the permission to create an invitation token", code: "error-insufficient-permissions"}, { status: 403 })
    }

    const profileId = await getProfileId(accountId)

    if (profileId === null) {
        return NextResponse.json({error: "Profile not found", code: "error-profile-not-found"}, { status: 404 })
    }

    await connectDB()

    const token = randomBytes(32).toString('hex')

    const invitation = await invite_tokens.create({
        profile_id: profileId,
        expires_at: generateExpirationDate(tokenDuration).toISOString(),
        token: token,
        is_used: false,
        role: accountRole
    })

    await invitation.save()

    if (invitation._id === null) {
        return NextResponse.json({error: "Couldn't create token", code: "error-token-creation"}, { status: 500 })
    }
    return NextResponse.json({token: token}, { status: 200 })

}

// Generates the expiration date for the invitation token. The input is in the format "1h", "1d", "1w" with the max being 1 month
function generateExpirationDate(duration: string): Date {
    let date = new Date()
    const unit = duration.slice(-1)
    const value = parseInt(duration.slice(0, -1))

    switch(unit) {
        case 'h':
            date.setHours(date.getHours() + value)
            break
        case 'd':
            date.setDate(date.getDate() + value)
            break
        case 'w':
            date.setDate(date.getDate() + value * 7)
            break
        case 'm':
            date.setMonth(date.getMonth() + value)
            break
    }

    if (date.getTime() - new Date().getTime() > 2592000000) {
        date = new Date(new Date().getTime() + 2592000000)
    }

    return date
}

function checkRole(role: string): boolean {
    switch(role) {
        case 'company-employee':
            return true
        case 'company-manager':
            return true
    }
    return false
}