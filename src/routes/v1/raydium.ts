import { Router } from "express";
import { raydiumControllers } from "../../controllers/index.js";
const router = Router();
router.get("/aprPools", raydiumControllers.getPoolsByApr);

export default router;
