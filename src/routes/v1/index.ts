import { Router } from "express";
import jupiterRouter from "./jupiter.js";
import healthRouter from "./health.js";
const v1Router: Router = Router();

v1Router.use("/", jupiterRouter);
v1Router.use("/", healthRouter);

export default v1Router;
