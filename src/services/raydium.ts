import {
  IGetPoolByAprRequest,
  PoolData,
  PoolDataResponse,
} from "../dto/raydium/index.js";
import fetch from "node-fetch";
const RAYDIUM_URL = "https://api-v3.raydium.io";
const GMGN_URL = "https://gmgn.ai";
class RaydiumService {
  async getTopPairsByApr(params: IGetPoolByAprRequest) {
    const response = await fetch(
      `${RAYDIUM_URL}/pools/info/list?poolType=concentrated&poolSortField=${params.selectValue}&sortType=desc&pageSize=${params.limit}&page=1`
    ).then((res) => {
      return res.json();
    });
    let sortedPoolsData: PoolData[] = response.data.data as PoolData[];
    const responseData: PoolDataResponse[] = sortedPoolsData.map((pool) => {
      return {
        poolId: pool.id,
        price: pool.price,
        tvl: pool.tvl,
        mintAmountA: pool.mintAmountA,
        mintAmountB: pool.mintAmountB,
        mintA: pool.mintA,
        mintB: pool.mintB,
        day: pool.day,
        week: pool.week,
        month: pool.month,
        raydiumStake: `https://raydium.io/clmm/create-position/?pool_id=${pool.id}`,
      };
    });
    return responseData;
  }


  async getTrendingTokens(limit: number, period: string) {

    const response = await fetch(`https://gmgn.ai/defi/quotation/v1/rank/sol/swaps/24h?app_lang=en&orderby=swaps&direction=desc&filters[]=renounced&filters[]=frozen`).then((res) => {
      console.log(res.json())
      return res.json()
    }).catch((err) => {
      console.error(err )
    });
    return response;
  }

  

}

const raydiumServices = new RaydiumService();
export default raydiumServices;
