import mongoose from "mongoose"

const profiles = new mongoose.Schema({
    name: String,
    surname: String,
    birth_date: mongoose.Schema.Types.Date,
    address: {
        country: String,
        region: String,
        city: String,
        postal_code: String,
        street: String,
        address: String
    },
    bio: String,
    identifier: String,
    sector: [String],
    website: String,
    is_company: Boolean,
    reviews: [{
        reviewer_id: String,
        title: String,
        review: String,
        rating: Number,
        creation_time: Date,
        edited: Boolean
    }]
})

export default mongoose.models.profiles ?? mongoose.model("profiles", profiles)