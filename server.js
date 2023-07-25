const express = require("express");
const { errorHandler } = require("./middlewares/error");
const app = express();
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_URL || "http://localhost:5173",
  })
);
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);
app.set("trust proxy", 1);

app.get("/", function (req, res) {
  res.send("Hello World!");
});
app.use("/api/problems", require("./routes/problems"));

app.use(errorHandler);
app.listen(port, () => {
  console.log("runinnng");
});
