export * from './accountsApi';
import { AccountsApi } from './accountsApi';
export * from './applicationsApi';
import { ApplicationsApi } from './applicationsApi';
export * from './profilesApi';
import { ProfilesApi } from './profilesApi';
export * from './sessionApi';
import { SessionApi } from './sessionApi';
import * as http from 'http';

export class HttpError extends Error {
    constructor (public response: http.IncomingMessage, public body: any, public statusCode?: number) {
        super('HTTP request failed');
        this.name = 'HttpError';
    }
}

export { type RequestFile } from '../model/models';

export const APIS = [AccountsApi, ApplicationsApi, ProfilesApi, SessionApi];
