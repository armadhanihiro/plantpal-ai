const API_URL = import.meta.env.VITE_API_URL;

export const getJourneyStats = async (userId) => {
    const response = await fetch(`${API_URL}/api/journey/stats?userId=${userId}`);
    return await response.json();
};

export const getPlantJourneys = async (userId) => {
    const response = await fetch(`${API_URL}/api/journey/list?userId=${userId}`);
    return await response.json();
};

export async function getJourneyDetail(id){
    const response = await fetch(`${API_URL}/api/journey/${id}`);
    return response.json();
}