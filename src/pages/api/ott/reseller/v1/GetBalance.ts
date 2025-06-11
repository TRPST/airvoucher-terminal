import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import crypto from 'crypto-js';

// OTT API Configuration
const OTT_CONFIG = {
  BASE_URL: 'https://test-api.ott-mobile.com/api', // Test API URL from next.config.js
  username: 'AIRVOUCHER',
  password: 'v95Hp_#kc+',
  apiKey: 'b39abd74-534c-44dc-a8ba-62a89dc8d31c',
};

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
          OTT_CONFIG.apiKey,
          ...Object.keys(params)
            .sort()
            .map((key) => params[key as keyof typeof params]),
        ].join('')
      )
      .toString();

    // Make request to actual OTT API
    const response = await axios.post(
      `${OTT_CONFIG.BASE_URL}/reseller/v1/GetBalance`,
      new URLSearchParams({ uniqueReference, hash }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${OTT_CONFIG.username}:${OTT_CONFIG.password}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Forward the response from the OTT API
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('OTT API Error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch OTT balance',
    });
  }
}
