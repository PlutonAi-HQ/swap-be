import { Router } from "express";
import jupiterRouter from "./jupiter.js";
import healthRouter from "./health.js";
import raydiumRouter from "./raydium.js";
const v1Router: Router = Router();

v1Router.use("/", jupiterRouter);
v1Router.use("/", healthRouter);
v1Router.use("/raydium", raydiumRouter);

export default v1Router;
