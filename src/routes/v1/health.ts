import { Router } from "express";

const healthRouter: Router = Router();

healthRouter.get("/health", (req, res) => {
  res.json({ message: "API V1 OK" });
});

export default healthRouter;
