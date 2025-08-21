import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const BASE_URL = process.env.GLOCELL_API_BASE_URL!;
const API_KEY = process.env.GLOCELL_API_KEY!;
const USERNAME = process.env.GLOCELL_API_USERNAME!;
const PASSWORD = process.env.GLOCELL_API_PASSWORD!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { meterNumber, amount, transactionType = 'Syntell' } = req.body;

  if (!meterNumber || !amount) {
    return res.status(400).json({ message: 'Meter number and amount are required.' });
  }

  // Validate environment variables
  if (!BASE_URL || !API_KEY || !USERNAME || !PASSWORD) {
    console.error('Missing required environment variables for Glocell API');
    return res.status(500).json({ message: 'API configuration error. Please contact support.' });
  }

  const amountInCents = Math.round(amount * 100);

  const glocellAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

  const params = new URLSearchParams({
    'meter-number': meterNumber,
    amount: amountInCents.toString(),
    'free-basic-electricity': 'false',
    'transaction-type': transactionType,
  });

  try {
    console.log('Glocell API Request:', {
      url: `${BASE_URL}/electricity/info?${params.toString()}`,
      headers: {
        accept: 'application/json',
        'Trade-Vend-Channel': 'API',
        apikey: API_KEY,
        authorization: `Basic ${glocellAuth}`,
      },
      params: {
        meterNumber,
        amount,
        amountInCents,
        transactionType,
      },
    });

    const response = await axios.get(`${BASE_URL}/electricity/info?${params.toString()}`, {
      headers: {
        accept: 'application/json',
        'Trade-Vend-Channel': 'API',
        apikey: API_KEY,
        authorization: `Basic ${glocellAuth}`,
      },
      timeout: 30000, // 30 second timeout
    });

    console.log('Glocell API Response:', response.data);
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Glocell Confirm Customer Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      },
    });

    // Handle specific error cases
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(502).json({
        message: 'Unable to connect to electricity service. Please try again later.',
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        message: 'Electricity service request timed out. Please try again.',
      });
    }

    // Handle 502 Bad Gateway specifically (Cloudflare error)
    if (error.response?.status === 502) {
      return res.status(502).json({
        message:
          'Electricity service is currently unavailable. The service provider is experiencing technical difficulties. Please try again later.',
      });
    }

    const status = error.response?.status || 500;
    const data = error.response?.data || {
      message: 'An error occurred while validating the meter number. Please try again.',
    };

    return res.status(status).json(data);
  }
}
