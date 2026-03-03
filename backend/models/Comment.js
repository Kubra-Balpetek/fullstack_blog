const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, "Yorum içeriği zorunludur"],
            trim: true,
        },
        blog: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
            required: [true, "Blog referansı zorunludur"],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Kullanıcı referansı zorunludur"],
        },
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
