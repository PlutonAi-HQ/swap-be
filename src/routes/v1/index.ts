import { Router } from "express";
import jupiterRouter from "./jupiter.js";

const v1Router: Router = Router();

v1Router.use("/", jupiterRouter);

export default v1Router;
