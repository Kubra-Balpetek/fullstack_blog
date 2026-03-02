const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Blog başlığı zorunludur"],
            trim: true,
        },
        content: {
            type: String,
            required: [true, "Blog içeriği zorunludur"],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Yazar bilgisi zorunludur"],
        },
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
        tags: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tag",
            },
        ],
        views: {
            type: Number,
            default: 0,
        },
        likes: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Blog'a ait yorumları virtual populate ile getir
blogSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "blog",
});

module.exports = mongoose.model("Blog", blogSchema);
