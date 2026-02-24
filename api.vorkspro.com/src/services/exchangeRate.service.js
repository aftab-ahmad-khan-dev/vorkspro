// services/exchangeRate.service.js
import axios from "axios";

export const fetchUsdToPkrRate = async () => {
  const url = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`;

  const { data } = await axios.get(url);

  if (data.result !== "success") {
    throw new Error("Failed to fetch exchange rate");
  }

  return data.conversion_rates.PKR;
};
