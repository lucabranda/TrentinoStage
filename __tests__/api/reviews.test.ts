import { NextRequest} from 'next/server'
import { POST, GET, PUT } from '../../app/api/reviews/route'
import { createSessionToken } from '@/utils/session'
import { connectDB } from '@/utils/db'

import reviews from '@/utils/model/profiles'


const basePath = process.env.BASE_PATH

const accountId = '68530e39e2e1d6fa1d614aa3' // The account id of utente@ciof.fi
const companyProfileId = '68531134a059fbafab827be1' // The profile id of the company profile

describe('Reviews create api testing', () => {
    it('Should create a review with the correct data', async () => {
        // Get an authentication token
        const token = await createSessionToken(accountId) 

        const body = {
            token: token,
            reviewedProfile: companyProfileId,
            title: 'This is a test review',
            description: 'This is a test review description',
            rating: 5
        }

        
        const response = await POST(new NextRequest(basePath + '/api/reviews/', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
        }))

        console.log("Response:", response)
        expect(response.status).toBe(200)

        // Check if the review is correctly inserted in the DB
        await connectDB()

        const review = await reviews.findOne({ _id: companyProfileId, 'reviews.reviewer_id': accountId })

        expect(review).toBeTruthy()
        expect(review.reviews[0].title).toBe('This is a test review')
    })
})