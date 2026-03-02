const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Etiket adı zorunludur"],
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
    },
    { timestamps: true }
);

// Kaydetmeden önce slug oluştur
tagSchema.pre("save", function () {
    if (this.isModified("name")) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    }
});

module.exports = mongoose.model("Tag", tagSchema);
