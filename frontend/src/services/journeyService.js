export const getJourneyStats = async (userId) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/journey/stats?userId=${userId}`);
    return await response.json();
};

export const getPlantJourneys = async (userId) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/journey/list?userId=${userId}`);
    return await response.json();
};