import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./config/db.js";
import { initMailer } from "./config/mailer.js";

// Routes
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import cmsRoutes from "./routes/cms.js";
import contactRoutes from "./routes/contact.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Behind a host's reverse proxy (Render, Vercel rewrites) the socket address is the proxy's,
// so without this every visitor shares one IP: one rate-limit bucket for the whole site.
// 1 = trust the single proxy in front of this server; override with TRUST_PROXY_HOPS if the chain differs.
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS ?? 1));

if (!process.env.JWT_SECRET) {
  console.warn(
    process.env.NODE_ENV === "production"
      ? "❌ JWT_SECRET is not set: admin login is disabled until it is."
      : "⚠️  JWT_SECRET is not set: using a development-only secret."
  );
}

// 1. Connect MongoDB
await connectDb();

// 2. Init SMTP Mailer
initMailer();

// 3. Security Headers (Helmet)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

// 4. CORS Policy: the site itself, and local development. CORS_ORIGINS adds others (comma separated).
// The site calls /api on its own domain (vercel.json passes it on), so browsers rarely need this.
const EXTRA_ORIGINS = (process.env.CORS_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean);
const allowedOrigin = (origin) =>
  /^https:\/\/(www\.)?makeonward\.com$/.test(origin) ||
  EXTRA_ORIGINS.includes(origin) ||
  (process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));

app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || allowedOrigin(origin)),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// 5. Body Parsers
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// 6. Brute-Force Rate Limiter for Auth
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 login attempts
  message: {
    success: false,
    error: "Too many login attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 7. Contact Form Rate Limiter (anti-spam)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 inquiries per IP per hour
  skipFailedRequests: true, // a rejected or failed submission does not use up the visitor's quota
  message: {
    success: false,
    error: "Too many messages sent. Please try again later.",
  },
});

// 8. Static uploads
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// 9. API Routes
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/change-password", loginLimiter); // it checks the current password too
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/contact", contactLimiter, contactRoutes);

// 10. Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    studio: "MakeOnward",
    database: "MongoDB Atlas",
    mailer: "SMTP",
    timestamp: new Date().toISOString(),
  });
});

// 11. 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "API endpoint not found." });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 MakeOnward Backend running on port ${PORT}`);
  console.log(`🔒 Security: Helmet + Rate Limiter + bcrypt + JWT`);
  console.log(`🍃 Database: MongoDB Atlas`);
  console.log(`📧 Mailer: SMTP`);
  console.log(`☁️  Storage: Cloudinary CDN`);
  console.log(`======================================================\n`);
});
