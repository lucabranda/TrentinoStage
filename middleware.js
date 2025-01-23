"use server"

import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { NextResponse } from "next/server"

let locales = ['it', 'de', 'en', 'xx']
let whitelist = ['api']

// Get the preferred locale from the Accept-Language header or cookie
async function getLocale(request) {

    let headers = { 'accept-language': 'it-IT;it;q=0.5' }
    let languages = new Negotiator({ headers }).languages()
    let defaultLocale = 'it'

    return match(languages, locales, defaultLocale)
}

export async function middleware(request) {
    const { pathname } = request.nextUrl

    // Check if the pathname starts with a valid locale
    const currentLocale = locales.find(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (currentLocale) {
        return NextResponse.next()
    }

    // If no locale is found in the pathname, get the preferred locale from the Accept-Language header or the cookie
    const locale = await getLocale(request)

    // Redirect to the correct locale-prefixed URL
    request.nextUrl.pathname = `/${locale}${pathname}`

    // Return the redirect response
    return NextResponse.redirect(request.nextUrl)
}

export const config = {
    matcher: [
        // Match any path except internal paths (_next, api, etc.)
        '/((?!_next|api).*)',
    ]
}
