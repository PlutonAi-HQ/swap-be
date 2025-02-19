import { Router } from "express";
import { jupiterControllers } from "../../controllers/jupiter.js";
const router: Router = Router();

router.post("/jupiterLimitOrder", async (_req, res, next) => {
  jupiterControllers.limitOrder(_req, res, next);
});

router.post("/jupiterSwap", async (_req, res, next) => {
  jupiterControllers.swap(_req, res, next);
});

router.post("/cancelOrders", async (_req, res, next) => {
  jupiterControllers.cancelOrders(_req, res, next);
});

router.get("/getOrders", async (_req, res, next) => {
  jupiterControllers.getOrders(_req, res, next);
});

router.get("/balance", async (_req, res, next) => {
  jupiterControllers.balance(_req, res, next);
});

router.get("/rateLimitCheck", async (_req, res, next) => {
  jupiterControllers.rateLimitCheck(_req, res, next);
});

router.get("/allTokens", async (_req, res, next) => {
  jupiterControllers.allTokens(_req, res, next);
});

router.get("/tokensByName", async (_req, res, next) => {
  jupiterControllers.tokenByName(_req, res, next);
});

router.get("/searchToken", async (_req, res, next) => {
  jupiterControllers.searchToken(_req, res, next);
});

router.get("/searchTokenPair", async (_req, res, next) => {
  jupiterControllers.searchTokenPair(_req, res, next);
});

router.get("/getPoolInfo", async (_req, res, next) => {
  jupiterControllers.getPoolInfo(_req, res, next);
});

export default router;

// https://token.jup.ag/all
