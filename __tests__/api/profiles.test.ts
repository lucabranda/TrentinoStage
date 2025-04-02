import { NextRequest } from 'next/server'
import { POST } from '../../app/api/session/create/route'
import { GET as IsCompanyGET} from '../../app/api/profiles/isCompany/route'


describe('Create profile api testing', () => {
    it('Should return 401 because of invalid token', async () => {
        const requestBody = { sessionToken: 'wrongToken' }
        const request = new NextRequest('http://localhost:3000/api/accounts/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
    
        const response = await POST(request)
    
        expect(response.status).toBe(401)
    })
})

describe('Is company api testing', () => {
    it('Should return true because the id is a company', async () => {
        const companyId = '67926cb8123b793f72cbcc05'
        const request = new NextRequest(`http://localhost:3000/api/profiles/isCompany?accountId=${companyId}`)
    
        const response = await IsCompanyGET(request)

        const jsonResponse = await response.json()

        console.log(response)
    
        expect(jsonResponse['isCompany']).toBe(true)
    })
})
