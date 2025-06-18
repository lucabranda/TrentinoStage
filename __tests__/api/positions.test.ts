/*import { NextRequest } from "next/server"
import { POST, GET, PUT } from '../../app/api/positions/route'

const basePath = process.env.BASE_PATH

describe('positions create api testing', () => {
    it('Should return 403 because of an invalid session token', async () => {
        const requestBody = { 
            token: 'invalid-token', 
            title: 'Application Title', 
            description: 'Application Description', 
            sector: 'Technology', 
            country: 'USA', 
            region: 'California', 
            city: 'San Francisco', 
            weekly_hours: 40 
        }

        const request = new NextRequest(basePath + '/api/positions/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })

        const response = await POST(request)

        expect(response.status).toBe(403)
    })
})


describe('positions modify api testing', () => {
    it('Should return 403 because of an invalid session token', async () => {
        const requestBody = { 
            token: 'invalid-token', 
            title: 'Application Title', 
            description: 'Application Description', 
            sector: 'Technology', 
            country: 'USA', 
            region: 'California', 
            city: 'San Francisco', 
            weekly_hours: 40 
        }

        const request = new NextRequest(basePath + '/api/positions/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })

        const response = await PUT(request)

        expect(response.status).toBe(403)
    })

})*/