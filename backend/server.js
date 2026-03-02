const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Ortam değişkenlerini yükle
dotenv.config();

// Veritabanı bağlantısı
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/tags", require("./routes/tagRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));

// Ana sayfa
app.get("/", (req, res) => {
    res.json({ message: "Fullstack Blog API çalışıyor!" });
});

// Hata yakalama middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Sunucu hatası!", error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
