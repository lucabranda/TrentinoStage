import { NextRequest } from 'next/server'
import { POST } from '../../app/api/session/create/route'
import { GET as IsCompanyGET} from '../../app/api/profiles/isCompany/route'

import { createTestAccount, deleteTestAccount, deleteTestProfile } from '@/utils/testingUtils'
import { createSessionToken } from '@/utils/session'

import { connectDB } from '@/utils/db'
import profiles from '@/utils/model/profiles'
import { getProfileId } from '@/utils/accounts'
import { ObjectId } from 'mongodb'

const basePath = process.env.BASE_PATH

const testAccount = {
    email: "profiles@test.test",
    password: "Password1!",
    role: "user"
}
const testProfile = {
    name: "mario",
    surname: "rossi",
    birthDate: new Date("1990-01-01"),
    country: "Italy",
    region: "Lazio",
    city: "Rome",
    postalCode: "00100",
    street: "Via Roma",
    address: "1A",
    bio: "Test bio",
    identifier: "1234567890",
    sector: JSON.stringify(["Technology", "Finance"]),
    website: "https://example.com",
    is_company: false
}

describe('Create profile api testing', () => {
    it('Should return 401 because of invalid token', async () => {
        const requestBody = { sessionToken: 'wrongToken' }
        const request = new NextRequest(basePath + '/api/accounts/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
    
        const response = await POST(request)
    
        expect(response.status).toBe(401)
    })

    it('Should create a profile with the correct data', async () => {
        // Create the test account
        const accountId = await createTestAccount(testAccount.email, testAccount.password, testAccount.role)

        // Create the session token
        const sessionToken = await createSessionToken(accountId)

        // Create the test profile
        const body = { sessionToken, ...testProfile }
        const request = await fetch(basePath + '/api/profiles/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        expect(request.status).toBe(200)

        // Check if the data is correctly inserted in the DB
        await connectDB()

        const profileId = await getProfileId(accountId)

        const profile = await profiles.findOne({ _id: ObjectId.createFromHexString(profileId) })

        expect(profile.name).toBe(testProfile.name)
        expect(profile.surname).toBe(testProfile.surname)
        expect(profile.birth_date).toEqual(testProfile.birthDate)
        expect(profile.address.country).toBe(testProfile.country)
        expect(profile.address.region).toBe(testProfile.region)
        expect(profile.address.city).toBe(testProfile.city)
        expect(profile.address.postal_code).toBe(testProfile.postalCode)
        expect(profile.address.street).toBe(testProfile.street)
        expect(profile.address.address).toBe(testProfile.address)
        expect(profile.bio).toBe(testProfile.bio)
        expect(profile.identifier).toBe(testProfile.identifier)
        expect(profile.sector).toEqual(await JSON.parse(testProfile.sector))
        expect(profile.website).toBe(testProfile.website)
        expect(profile.is_company).toBe(testProfile.is_company)

        // Delete the test profile
        await deleteTestProfile(profileId)
        // Delete the test account
        await deleteTestAccount(accountId)

    })
})

describe('Is company api testing', () => {
    it('Should return true because the id is a company', async () => {
        const companyId = '67926cb8123b793f72cbcc05'
        const request = new NextRequest(basePath + `/api/profiles/isCompany?accountId=${companyId}`)
    
        const response = await IsCompanyGET(request)

        const jsonResponse = await response.json()

        console.log(response)
    
        expect(jsonResponse['isCompany']).toBe(true)
    })
})
