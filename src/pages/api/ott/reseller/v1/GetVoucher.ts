import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import crypto from 'crypto-js';

// OTT API Configuration
const BASE_URL = process.env.OTT_API_BASE_URL;
const username = process.env.OTT_API_USERNAME;
const password = process.env.OTT_API_PASSWORD;
const apiKey = process.env.OTT_API_KEY;

// Debug environment variables
console.log('Environment Variables Check:', {
  BASE_URL: BASE_URL ? '✓ Set' : '✗ Missing',
  username: username ? '✓ Set' : '✗ Missing',
  password: password ? '✓ Set' : '✗ Missing',
  apiKey: apiKey ? '✓ Set' : '✗ Missing',
  usernameValue: username,
  passwordValue: password ? password.slice(0, 2) + '...' + password.slice(-2) : undefined,
  passwordLength: password?.length,
  apiKeyValue: apiKey ? apiKey.slice(0, 4) + '...' + apiKey.slice(-4) : undefined,
  apiKeyLength: apiKey?.length,
});

// Validate environment variables
if (!BASE_URL || !username || !password || !apiKey) {
  console.error('Missing environment variables:', {
    OTT_API_BASE_URL: BASE_URL,
    OTT_API_USERNAME: username,
    OTT_API_PASSWORD: password ? '***' : undefined,
    OTT_API_KEY: apiKey ? '***' : undefined,
  });
  throw new Error('Missing required environment variables for OTT API');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get parameters from request body (now JSON instead of form data)
    const { branch, cashier, mobileForSMS, till, uniqueReference, value, vendorCode } = req.body;

    // Validate required parameters
    if (!branch || !cashier || !till || !uniqueReference || !value || !vendorCode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters',
      });
    }

    // Create the exact string to hash as per OTT docs
    const paramsToHash = {
      branch,
      cashier,
      mobileForSMS: mobileForSMS || '', // Ensure empty string if not provided
      till,
      uniqueReference,
      value: String(value),
      vendorCode: String(vendorCode),
    };

    // Sort parameters alphabetically and create hash string
    const sortedKeys = Object.keys(paramsToHash).sort();
    const stringToHash =
      apiKey + sortedKeys.map((key) => paramsToHash[key as keyof typeof paramsToHash]).join('');

    // Generate hash
    const hash = crypto.SHA256(stringToHash).toString();

    // Create form data with exact parameter order
    const formData = new URLSearchParams();
    sortedKeys.forEach((key) => {
      formData.append(key, paramsToHash[key as keyof typeof paramsToHash]);
    });
    formData.append('hash', hash);

    // Create auth header exactly as per OTT docs
    const authString = `${username}:${password}`;
    const base64Auth = Buffer.from(authString).toString('base64');
    const authHeader = `Basic ${base64Auth}`;

    // Debug log (remove in production)
    console.log('Debug Info:', {
      paramsToHash,
      sortedKeys,
      stringToHash,
      hash,
      authString,
      base64Auth,
      formData: formData.toString(),
      fullRequest: {
        url: `${BASE_URL}/reseller/v1/GetVoucher`,
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        data: formData.toString(),
      },
    });

    // Make request to OTT API
    const response = await axios.post(`${BASE_URL}/reseller/v1/GetVoucher`, formData, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    });

    // Forward the response from the OTT API
    return res.status(200).json(response.data);
  } catch (error: any) {
    // Enhanced error logging
    console.error('OTT API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          ...error.config?.headers,
          Authorization: error.config?.headers?.Authorization ? '[REDACTED]' : undefined,
        },
        data: error.config?.data,
      },
    });

    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to issue OTT voucher',
      error: error.response?.data || error.message,
    });
  }
}
