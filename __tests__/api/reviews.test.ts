import { NextRequest} from 'next/server'
import { POST as CreatePOST } from '../../app/api/session/create/route'
import { POST as DestroyPOST } from '../../app/api/session/destroy/route'
import { GET as VerifyGET } from '../../app/api/session/verify/route'

const basePath = process.env.BASE_PATH

describe('Reviews create api testing', () => {
    it('Should return 401 because of wrong credentials', async () => {
        const requestBody = { email: 'testuser', password: 'wrongPassword' }
        const request = new NextRequest(basePath + '/api/reviews/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })
    
        const response = await CreatePOST(request)
    
        expect(response.status).toBe(401)
    })
})