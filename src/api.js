// src/api.js
const BASE_URL = "http://localhost:8000/api"; // 백엔드 주소

export const fetchStatsSummary = async (start, end) => {
  try {
    const response = await fetch(
      `${BASE_URL}/stats/summary?start=${start}&end=${end}`
    );
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch summary:", error);
    return null;
  }
};

export const fetchFrequency = async (start, end) => {
  try {
    const response = await fetch(
      `${BASE_URL}/stats/frequency?start=${start}&end=${end}&limit=5`
    );
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch frequency:", error);
    return [];
  }
};

export const fetchCategoryStats = async (start, end) => {
  try {
    const response = await fetch(
      `${BASE_URL}/stats/category?start=${start}&end=${end}`
    );
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch category stats:", error);
    return [];
  }
};
