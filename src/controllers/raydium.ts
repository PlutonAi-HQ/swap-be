import { RequestHandler } from "express";
import raydiumServices from "../services/raydium.js";
import { IGetPoolByAprRequest } from "../dto/raydium/index.js";
const getPoolsByApr: RequestHandler = async (req, res) => {
  try {
    const params: IGetPoolByAprRequest = {
      limit: parseInt(req.query.limit as string),
      selectValue: req.query.selectValue as IGetPoolByAprRequest["selectValue"],
      deepDetail: req.query.deepDetail === "true",
    };
    console.log("getPoolsByApr", params);
    const result = await raydiumServices.getTopPairsByApr(params);
    if (!params.deepDetail) res.status(200).send(result);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
};

const getTrendingTokens: RequestHandler = async (req, res) => {
  try {
    const result = await raydiumServices.getTrendingTokens(parseInt(req.query.limit as string), req.query.period as string);
    res.send({code: 200, message: "success", data: result});
}catch (e) {
  console.log(e); 
  res.status(500).send("Internal server error");
  }}

export default {
  getPoolsByApr,
  getTrendingTokens
};

