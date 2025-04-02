import mongoose from "mongoose"

const available_positions = new mongoose.Schema({
    issuer_id: String,
    title: String,
    description: String,
    sector: String,
    location: {
        country: String,
        region: String,
        city: String
    },
    weekly_hours: Number,
    applied_users: [{
        user_id: String,
        application_time: Date
    }],
    chosen_user: String,
    creation_time: Date
})

export default mongoose.models.available_positions ?? mongoose.model("available_positions", available_positions)