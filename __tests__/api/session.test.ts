import { NextRequest} from 'next/server'
import { POST, GET, DELETE } from '../../app/api/session/route'

const basePath = process.env.BASE_PATH

let validToken: string

describe('Create session api testing', () => {
    it('Should return 401 because of wrong credentials', async () => {
        const requestBody = { email: 'testuser', password: 'wrongPassword' }
        const request = new NextRequest(basePath + '/api/session/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })
    
        const response = await POST(request)
    
        expect(response.status).toBe(401)
    })

    it('Should return 200 because of correct credentials', async () => {
        const requestBody = { email: 'utente@ciof.fi', password: 'Password1!' }
        const request = new NextRequest(basePath + '/api/session/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })
    
        const response = await POST(request)

        expect(response.status).toBe(200)

        // Save the token for later use
        const data = await response.json()

        console.log(data)

        validToken = data.token
    })
})

describe('Verify session api testing', () => {
    it('Should return 401 because of incorrect token', async () => {
        const token = 'wrongToken'
        const request = new NextRequest(basePath + `/api/session?token=${token}`)
    
        const response = await GET(request)
    
        expect(response.status).toBe(401)
    })

    it('Should return 200 because of correct token', async () => {
        const request = new NextRequest(basePath + `/api/session?token=${validToken}`)
    
        const response = await GET(request)
    
        expect(response.status).toBe(200)

        // Check if the response contains the expected data
        const data = await response.json()
        expect(data).toHaveProperty('profileId')
        expect(data.profileId).toBe('68530e39e2e1d6fa1d614aa3')
    });
})


describe('Destroy session api testing', () => {
    it('Should return 401 because of wrong token', async () => {
        const request = new NextRequest(basePath + '/api/session', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: 'wrongToken' }),
        })
    
        const response = await DELETE(request)
    
        expect(response.status).toBe(401)
    });

    it('Should destroy the session', async () => {
        const request = new NextRequest(basePath + '/api/session', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: validToken }), // Replace with a valid token
        })
        const response = await DELETE(request)
        expect(response.status).toBe(200)

        // Check if the session is destroyed
        const checkRequest = new NextRequest(basePath + '/api/session' + `?token=${validToken}`)

        const checkResponse = await GET(checkRequest)
        expect(checkResponse.status).toBe(401)
    });
});

