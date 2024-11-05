import { MongoClient } from 'mongodb';
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd()
loadEnvConfig(projectDir)


export class DBClient { 
    private client: MongoClient;
    constructor() {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI environment variable is not defined")
        }
        if (!process.env.DB_NAME) {
            throw new Error("DB_NAME environment variable is not defined")
        }
        this.client = new MongoClient(process.env.MONGODB_URI)
        this.client.connect()
    }
    
    public selectCollection(collection: string) {
        return this.client.db(process.env.DB_NAME).collection(collection)
    }
}