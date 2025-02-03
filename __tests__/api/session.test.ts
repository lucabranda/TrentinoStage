import { NextRequest} from 'next/server'
import { POST as CreatePOST } from '../../app/api/session/create/route'
import { POST as DestroyPOST } from '../../app/api/session/destroy/route'
import { GET as VerifyGET } from '../../app/api/session/verify/route'


describe('Create session api testing', () => {
    it('Should return 401 because of wrong credentials', async () => {
        const requestBody = { email: 'testuser', password: 'wrongPassword' }
        const request = new NextRequest('http://localhost:3000/api/session/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })
    
        const response = await CreatePOST(request)
    
        expect(response.status).toBe(401)
    })

    it('Should return 200 because of correct credentials', async () => {
        const requestBody = { email: 'test11@example.com', password: 'Passw0rd' }
        const request = new NextRequest('http://localhost:3000/api/session/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })
    
        const response = await CreatePOST(request)

        expect(response.status).toBe(200)
    })
})

describe('Destroy session api testing', () => {
    it('Should return 401 because of wrong token', async () => {
        const request = new NextRequest('http://localhost:3000/api/session/destroy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: 'wrongToken' }),
        })
    
        const response = await DestroyPOST(request)
    
        expect(response.status).toBe(401)
    });
});

describe('Verify session api testing', () => {
    it('Should return 401 because of incorrect token', async () => {
        const token = 'wrongToken'
        const request = new NextRequest(`http://localhost:3000/api/session/verify?token=${token}`)
    
        const response = await VerifyGET(request)
    
        expect(response.status).toBe(401)
    })
})
