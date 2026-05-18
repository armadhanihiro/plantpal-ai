import { getPlantAdvice } from "../utils/plantAdvice";
export async function askPlantAI(question) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const result = getPlantAdvice(question);
            resolve(result);
        }, 1000);
    });
}