const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Token oluştur
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Kullanıcı var mı kontrol et
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: "Bu kullanıcı adı veya e-posta zaten kayıtlı" });
        }

        const user = await User.create({ username, email, password });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Kayıt sırasında hata oluştu", error: error.message });
    }
};

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Geçersiz e-posta veya şifre" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Geçersiz e-posta veya şifre" });
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Giriş sırasında hata oluştu", error: error.message });
    }
};

// @desc    Kullanıcı profili getir
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Profil getirme hatası", error: error.message });
    }
};

module.exports = { register, login, getProfile };
