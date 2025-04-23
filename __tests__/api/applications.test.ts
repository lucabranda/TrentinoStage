import { NextRequest } from "next/server"
import { POST as CreatePOST } from "../../app/api/applications/create/route"
import { POST as ModifyPOST } from "../../app/api/applications/modify/route"

const basePath = process.env.BASE_PATH

describe('Applications create api testing', () => {
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

        const request = new NextRequest(basePath + '/api/applications/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })

        const response = await CreatePOST(request)

        expect(response.status).toBe(403)
    })
})


describe('Applications modify api testing', () => {
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

        const request = new NextRequest(basePath + '/api/applications/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })

        const response = await ModifyPOST(request)

        expect(response.status).toBe(403)
    })

})