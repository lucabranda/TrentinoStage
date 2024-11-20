import mongoose from "mongoose"

const invite_tokens = new mongoose.Schema({
    profile_id: String,
    expires_at: mongoose.Schema.Types.Date,
    token: String,
    is_used: Boolean,
    role: String
})

export default mongoose.models.invite_tokens ?? mongoose.model("invite_tokens", invite_tokens)