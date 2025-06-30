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

  const { meterNumber, amount } = req.body;

  if (!meterNumber || !amount) {
    return res.status(400).json({ message: 'Meter number and amount are required.' });
  }

  const amountInCents = Math.round(amount * 100);

  const glocellAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

  const params = new URLSearchParams({
    'meter-number': meterNumber,
    amount: amountInCents.toString(),
    'free-basic-electricity': 'false',
  });

  try {
    const response = await axios.get(`${BASE_URL}/electricity/info?${params.toString()}`, {
      headers: {
        accept: 'application/json',
        apikey: API_KEY,
        authorization: `Basic ${glocellAuth}`,
      },
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Glocell Confirm Customer Error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: 'An internal server error occurred.' };
    return res.status(status).json(data);
  }
}
