import { NextRequest, NextResponse } from 'next/server'
import { POST } from '../../app/api/session/create/route'

import { connectDB } from '@/utils/db'
import accounts from '@/utils/model/accounts'

const basePath = process.env.BASE_PATH

describe('Register api testing', () => {
    it('Should return 401 because of invalid email and password format', async () => {
        const requestBody = { email: 'testuser', password: 'wrongPassword' }
        const request = new NextRequest(basePath + '/api/accounts/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
    
        const response = await POST(request)
    
        expect(response.status).toBe(401)
    })

    it('Should return 401 because of email already in use', async () => {
        const requestBody = { email: 'utente@ciof.fi', password: 'Passw0rd' }
        const request = new NextRequest(basePath + '/api/accounts/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })

        const response = await POST(request)
        expect(response.status).toBe(401)

    })

    // Try to create a new account with a valid email and password and check the data in the DB
    it('Should create an account with the correct data', async () => {
        const email = "accounts@test.test"
        const password = "Password1!"
        const role = "user"

        const requestBody = { email, password, role }
        const response = await fetch(basePath + "/api/accounts/register", {
            method: 'POST',
            headers: {'Content-Type': 'application/json; charset=UTF-8'},
            body: JSON.stringify(requestBody)
        });

        // Check if the data is correctly inserted in the DB
        await connectDB()

        accounts.findOne({ email }).then((result) => {
            expect(result.email).toBe(email)
            expect(result.role).toBe(role)
            expect(result.is_verified).toBe(false)
            expect(result.last_modified_password).toBeTruthy()
        })

        // Delete the account after the test
        accounts.findOneAndDelete({ email })
    })

})
