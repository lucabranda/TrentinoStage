import mongoose from "mongoose"

const accounts = new mongoose.Schema({
    email: String,
    password: String,
    profile_id: String,
    is_verified: Boolean,
    last_modified_password: mongoose.Schema.Types.Date,
    role: String
})

export default mongoose.models.accounts ?? mongoose.model("accounts", accounts)