import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import crypto from 'crypto-js';

// OTT API Configuration
const BASE_URL = process.env.OTT_API_BASE_URL!;
const username = process.env.OTT_API_USERNAME!;
const password = process.env.OTT_API_PASSWORD!;
const apiKey = process.env.OTT_API_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { uniqueReference } = req.body;

    // Generate hash for authentication
    const params: { uniqueReference: string } = { uniqueReference };
    const hash = crypto
      .SHA256(
        [
          apiKey,
          ...Object.keys(params)
            .sort()
            .map((key) => params[key as keyof typeof params]),
        ].join('')
      )
      .toString();

    // Make request to actual OTT API
    const response = await axios.post(
      `${BASE_URL}/reseller/v1/GetBalance`,
      new URLSearchParams({ uniqueReference, hash }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Forward the response from the OTT API
    return res.status(200).json(response.data);
  } catch (error: any) {
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch OTT balance',
    });
  }
}
