import { ObjectId } from "mongodb"
import { getAccountInfo } from "./accounts"

import connectDB from "./db"
import profiles from "./model/profiles"


// Functions to help manage user profiles

export async function isProfileOwner(profileId: string, accountId: string) {
    // Check if the account is the owner of the profile

    // Get the account
    const account = await getAccountInfo(accountId)

    if (!account) {
        return null
    }

    return account.profile_id === profileId
}

export async function getProfileInfo(profileId: string) {
    // Get the profile information
    await connectDB()

    const profile = await profiles.findOne({ _id: ObjectId.createFromHexString(profileId) })

    return profile
}

export async function isProfileCompany(profileId: string) {
    // Check if the profile is a company
    const profile = await getProfileInfo(profileId)

    if (!profile) {
        return null
    }

    return profile.is_company
}