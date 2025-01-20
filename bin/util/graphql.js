var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
export const callGraphql = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios.post('https://sui-devnet.mystenlabs.com/graphql', {
            query,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data; // Return the response data
    }
    catch (error) {
        console.error('Error making GraphQL API call:', error);
        throw new Error('Failed to make GraphQL call');
    }
});
