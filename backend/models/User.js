const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Kullanıcı adı zorunludur"],
            unique: true,
            trim: true,
            minlength: [3, "Kullanıcı adı en az 3 karakter olmalıdır"],
        },
        email: {
            type: String,
            required: [true, "E-posta zorunludur"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Geçerli bir e-posta adresi giriniz"],
        },
        password: {
            type: String,
            required: [true, "Şifre zorunludur"],
            minlength: [6, "Şifre en az 6 karakter olmalıdır"],
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
    },
    { timestamps: true }
);

// Şifre kaydetmeden önce hash'le
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Şifre doğrulama metodu
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
