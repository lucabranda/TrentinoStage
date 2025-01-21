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
    console.log("ProfileID: " + profileId)
    const profile = await profiles.findOne({ _id: ObjectId.createFromHexString(profileId) })

    return profile
}