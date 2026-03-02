const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Kategori adı zorunludur"],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
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
categorySchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    }
    next();
});

module.exports = mongoose.model("Category", categorySchema);
