import accounts from "./model/accounts"
import profiles from "./model/profiles"
import { connectDB } from "./db"

import bycript from "bcrypt"
import { ObjectId } from "mongodb"

// Function to create a temporary test account
// This function is used to create a test account for testing purposes
// Returns the id of the account
export async function createTestAccount(email: string, password: string, role: string) {

    await connectDB()


    const account = {
        email,
        password: await bycript.hash(password, 10),
        profile_id: null,
        is_verified: true,
        last_modified_password: new Date().toISOString(),
        role
    }

    const result = await accounts.create(account)
    await result.save()

    return result._id.toHexString()
}

// Function to delete a test account
export async function deleteTestAccount(accountId: string) {
    await connectDB()

    const result = await accounts.deleteOne({ _id: accountId })

    return result.deletedCount === 1
}


// Function to create a test profile
// Returns the id of the profile
export async function createTestProfile(accountId: string, name: string, surname: string, birth_date: Date, address: object, bio: string, identifier: string, sector: string[], website: string, is_company: boolean) {
    await connectDB()
    
    const profile = {
        name,
        surname,
        birth_date,
        address,
        bio,
        identifier,
        sector,
        website,
        is_company,
        reviews: []
    }

    const result = await profiles.create(profile)
    await result.save()
    const profileId = result._id

    // Update the account with the profile id
    const res = await accounts.updateOne({ _id: ObjectId.createFromHexString(accountId) }, { $set: { profile_id: profileId } })
    if (res.modifiedCount !== 1) {
        return null
    }
    return profileId.toHexString()
}

// Function to delete a test profile
export async function deleteTestProfile(profileId: string) {
    await connectDB()

    const result = await profiles.deleteOne({ _id: ObjectId.createFromHexString(profileId) })

    return result.deletedCount === 1
}
