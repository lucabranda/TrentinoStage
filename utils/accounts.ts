import { ObjectId } from "mongodb"

import connectDB from "./db"
import accounts from "./model/accounts"

// Functions to help manage the accounts

export async function getAccountInfo(accountId: string) {
    // Get the account information
    await connectDB()

    const account = await accounts.findOne({ _id: ObjectId.createFromHexString(accountId) })

    return account
}