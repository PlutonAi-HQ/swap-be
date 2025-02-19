import { Router } from "express";
import v1Router from "./v1/index.js";
import healthRouter from "./v1/health.js";
import raydiumRouter from "./v1/raydium.js";
import healthCheck from "./health.js";
const router: Router = Router();

router.use("/", healthCheck);
router.use("/api/v1", v1Router);
router.use("/api/v1", raydiumRouter);
router.use("/api/v1", healthRouter);

export default router;
