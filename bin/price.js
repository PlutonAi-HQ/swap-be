import { PriceServiceConnection } from "@pythnetwork/price-service-client";
export const getPrice = () => {
    const priceIds = [
        "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744", // ETH/USD price id
    ];
    const connection = new PriceServiceConnection("https://hermes.pyth.network");
    connection.subscribePriceFeedUpdates(priceIds, (priceFeed) => {
        // priceFeed here is the same as returned by getLatestPriceFeeds above.
        connection.getLatestPriceFeeds(priceIds).then((priceFeeds) => {
            var _a, _b;
            // get the price
            const price = parseInt((_b = (_a = priceFeeds === null || priceFeeds === void 0 ? void 0 : priceFeeds.at(0)) === null || _a === void 0 ? void 0 : _a.toJson().ema_price) === null || _b === void 0 ? void 0 : _b.price);
            handleSwap(price);
        });
    });
    // When using the subscription, make sure to close the WebSocket upon termination to finish the process gracefully.
    // setTimeout(() => {
    //   connection.closeWebSocket();
    // }, 60000);
};
const handleSwap = (price) => {
    console.log('price', price);
};
