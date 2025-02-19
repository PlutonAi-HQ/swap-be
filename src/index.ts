import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import router from "./routes/index.js";
//init keypair

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json({ limit: "10mb" }));
app.get("/", async (_req, res) => {
  res.send(`Expressjs is running!`);
});

app.use("/", router);

app.listen(3001, () => {
  console.log(`REST API is listening on port: ${3000}.`);
});
