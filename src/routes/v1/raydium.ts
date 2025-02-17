import { Router } from "express";
import { raydiumControllers } from "../../controllers/index.js";
const router = Router();
router.get("/aprPools", raydiumControllers.getPoolsByApr);
router.get("/trendingTokens", raydiumControllers.getTrendingTokens)

export default router;
