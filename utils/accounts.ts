import { ObjectId } from "mongodb"
import { getProfileInfo } from "./profiles"

import connectDB from "./db"
import accounts from "./model/accounts"

// Functions to help manage the accounts

export async function getAccountInfo(accountId: string) {
    // Check if the accountID is a valid BSON string
    if(!accountId || !accountId.match(/^[0-9a-fA-F]{24}$/)) return false
    
    // Get the account information
    await connectDB()

    const account = await accounts.findOne({ _id: ObjectId.createFromHexString(accountId) })

    return account
}

export async function getProfileId(accountId: string) {
    // Check if the accountID is a valid BSON string
    if(!accountId || !accountId.match(/^[0-9a-fA-F]{24}$/)) return false

    await connectDB()

    // Get the profile ID associated with the account
    const profileId = await accounts.findOne({ _id: ObjectId.createFromHexString(accountId) }).then(profileId => {
        if (!profileId || profileId.profile_id === null) {
            return null
        }
        return profileId.profile_id
    })

    return profileId
}

export async function isCompany(accountId: string) {
    // Check if the accountID is a valid BSON string
    if(!accountId || !accountId.match(/^[0-9a-fA-F]{24}$/)) return false

    await connectDB()

    // Check if the account is linked to a company profile
    const profileId = await getProfileId(accountId)

    if (!profileId) return false;

    const account = await getProfileInfo(profileId)

    if (!account || account.is_company === null || account.is_company === undefined || account.is_company === false) {
        return false
    }

    return true
}