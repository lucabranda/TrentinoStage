import { ObjectId } from "mongodb"
import { getProfileInfo } from "./profiles"

import connectDB from "./db"
import accounts from "./model/accounts"

// Functions to help manage the accounts

export async function getAccountInfo(accountId: string) {
    // Get the account information
    await connectDB()

    const account = await accounts.findOne({ _id: ObjectId.createFromHexString(accountId) })

    return account
}

export async function getProfileId(accountId: string) {
    // Get the profile ID associated with the account
    const profileId = await accounts.findOne({ _id: ObjectId.createFromHexString(accountId) }).then(profileId => {
        if (profileId.profile_id === null) {
            return null
        }
        return profileId.profile_id
    })

    return profileId
}

export async function isCompany(accountId: string) {
    // Check if the account is linked to a company profile
    const account = await getProfileInfo(await getProfileId(accountId))

    if (!account || account.is_company === null || account.is_company === undefined || account.is_company === false) {
        return false
    }

    return true
}