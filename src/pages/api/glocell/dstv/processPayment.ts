import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = process.env.GLOCELL_API_BASE_URL!;
const API_KEY = process.env.GLOCELL_API_KEY!;
const USERNAME = process.env.GLOCELL_API_USERNAME!;
const PASSWORD = process.env.GLOCELL_API_PASSWORD!;
const VENDOR_ID = process.env.GLOCELL_VENDOR_ID || '000000';
const DEVICE_ID = process.env.GLOCELL_DEVICE_ID || '000000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { reference, accountNumber, productId, vendorId, amountDue } = req.body;

  if (!reference || !accountNumber || !productId || !vendorId) {
    return res.status(400).json({
      message: 'Reference, account number, product ID, and vendor ID are required.',
    });
  }

  // Validate that numeric fields can be parsed as integers
  if (isNaN(parseInt(accountNumber)) || isNaN(parseInt(productId)) || isNaN(parseInt(vendorId))) {
    return res.status(400).json({
      message: 'Account number, product ID, and vendor ID must be valid numbers.',
    });
  }

  // Validate amount if provided
  if (amountDue && isNaN(parseInt(amountDue.toString()))) {
    return res.status(400).json({
      message: 'Amount due must be a valid number.',
    });
  }

  const glocellAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
  const requestId = uuidv4();

  const requestBody = {
    requestId: requestId,
    vendorId: parseInt(vendorId),
    productId: parseInt(productId),
    accountNumber: parseInt(accountNumber),
    aeonTransactionId: reference, // Use the reference from account validation
    amount: parseInt(amountDue?.toString() || '0'), // Ensure amount is an integer
    tenderType: 'CASH',
    vendMetaData: {
      transactionRequestDateTime: new Date().toISOString(),
      transactionReference: requestId,
      vendorId: VENDOR_ID,
      deviceId: DEVICE_ID,
      consumerAccountNumber: accountNumber,
      clientId: VENDOR_ID,
      emailAddress: '',
      cellphoneNumber: '',
    },
  };

  try {
    console.log('DStv Payment Request Body:', requestBody);
    console.log('DStv Payment Request Headers:', {
      'Content-Type': 'application/json',
      accept: 'application/json',
      'Trade-Vend-Channel': 'API',
      apikey: API_KEY,
      authorization: `Basic ${glocellAuth}`,
    });

    const response = await axios.post(`${BASE_URL}/billpayment/sales`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        'Trade-Vend-Channel': 'API',
        apikey: API_KEY,
        authorization: `Basic ${glocellAuth}`,
      },
    });

    console.log('DStv Payment Response:', response.data);
    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('DStv Payment Processing Error:', error.response?.data || error.message);
    console.error('DStv Payment Error Status:', error.response?.status);
    console.error('DStv Payment Error Headers:', error.response?.headers);
    console.error('DStv Payment Request Body that failed:', requestBody);
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: 'An internal server error occurred.' };
    return res.status(status).json(data);
  }
} 