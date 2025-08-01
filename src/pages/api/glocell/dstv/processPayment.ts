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
      message: 'Reference, account number, product ID, and vendor ID are required.' 
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
    amount: amountDue || 0, // Use the amount due from account validation
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
    const response = await axios.post(`${BASE_URL}/billpayment/sales`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        apikey: API_KEY,
        authorization: `Basic ${glocellAuth}`,
      },
    });

    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('DStv Payment Processing Error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: 'An internal server error occurred.' };
    return res.status(status).json(data);
  }
} 