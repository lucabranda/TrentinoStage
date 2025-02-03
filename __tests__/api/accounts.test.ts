import { NextRequest, NextResponse } from 'next/server'
import { POST } from '../../app/api/session/create/route'


describe('Register api testing', () => {
    it('Should return 401 because of invalid email and password format', async () => {
        const requestBody = { email: 'testuser', password: 'wrongPassword' }
        const request = new NextRequest('http://localhost:3000/api/accounts/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
    
        const response = await POST(request)
    
        expect(response.status).toBe(401)
    })

    it('Should return 401 because of email already in use', async () => {
        const requestBody = { email: 'utente@ciof.fi', password: 'Passw0rd' }
        const request = new NextRequest('http://localhost:3000/api/accounts/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })

        const response = await POST(request)
        expect(response.status).toBe(401)

    })
})
