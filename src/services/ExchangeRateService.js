export const fetchUsdToTwdRate = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }
    const data = await response.json();
    return data.rates.TWD;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    // Fallback rate if API fails
    return 31.5;
  }
};
