import mongoose from "mongoose"


const auth_tokens = new mongoose.Schema({
    user_id: String,
    generation_time: mongoose.Schema.Types.Date,
    token: String
})

export default mongoose.models.auth_tokens ?? mongoose.model("auth_tokens", auth_tokens)