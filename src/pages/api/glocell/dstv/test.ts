import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const BASE_URL = process.env.GLOCELL_API_BASE_URL!;
const API_KEY = process.env.GLOCELL_API_KEY!;
const USERNAME = process.env.GLOCELL_API_USERNAME!;
const PASSWORD = process.env.GLOCELL_API_PASSWORD!;

// DStv test account numbers
const DSTV_TEST_ACCOUNTS = [
  {
    accountNumber: '135520754',
    description: 'Test Account 1',
  },
  {
    accountNumber: '135609708',
    description: 'Test Account 2',
  },
  {
    accountNumber: '135609673',
    description: 'Test Account 3',
  },
];

// DStv test constants (these would normally be provided by the user)
const DSTV_PRODUCT_ID = '298';
const DSTV_VENDOR_ID = '198';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { accountIndex = '0' } = req.query;
  const accountIndexNumber = parseInt(accountIndex as string);

  if (accountIndexNumber < 0 || accountIndexNumber >= DSTV_TEST_ACCOUNTS.length) {
    return res.status(400).json({ 
      message: `Invalid account index. Please provide a number between 0 and ${DSTV_TEST_ACCOUNTS.length - 1}`,
      availableAccounts: DSTV_TEST_ACCOUNTS.map((account, index) => ({
        index,
        accountNumber: account.accountNumber,
        description: account.description,
      }))
    });
  }

  const testAccount = DSTV_TEST_ACCOUNTS[accountIndexNumber];
  const glocellAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
  const testAmount = 20000; // R200.00 in cents

  try {
    // Step 1: Account Validation
    const validateParams = new URLSearchParams({
      'account-number': testAccount.accountNumber,
      'product-id': DSTV_PRODUCT_ID,
      'vendor-id': DSTV_VENDOR_ID,
    });

    console.log(`Testing DStv Account: ${testAccount.accountNumber} (${testAccount.description})`);
    console.log(`Account Validation URL: ${BASE_URL}/billpayment/info?${validateParams.toString()}`);

    const validateResponse = await axios.get(`${BASE_URL}/billpayment/info?${validateParams.toString()}`, {
      headers: {
        accept: 'application/json',
        'Trade-Vend-Channel': 'API',
        apikey: API_KEY,
        authorization: `Basic ${glocellAuth}`,
      },
    });

    const validateData = validateResponse.data;
    console.log('Account Validation Response:', validateData);

    // Step 2: Process Payment (if validation was successful)
    if (validateData.reference) {
      const paymentBody = {
        requestId: `test-dstv-${accountIndexNumber}-${Date.now()}`,
        vendorId: parseInt(DSTV_VENDOR_ID),
        productId: parseInt(DSTV_PRODUCT_ID),
        accountNumber: parseInt(testAccount.accountNumber),
        aeonTransactionId: validateData.reference,
        amount: testAmount,
        tenderType: 'CASH',
        vendMetaData: {
          transactionRequestDateTime: new Date().toISOString(),
          transactionReference: `test-ref-dstv-${accountIndexNumber}`,
          vendorId: process.env.GLOCELL_VENDOR_ID || '000000',
          deviceId: process.env.GLOCELL_DEVICE_ID || '000000',
          consumerAccountNumber: testAccount.accountNumber,
          clientId: process.env.GLOCELL_VENDOR_ID || '000000',
          emailAddress: '',
          cellphoneNumber: '',
        },
      };

      console.log(`DStv Payment Request Body:`, paymentBody);

      const paymentResponse = await axios.post(`${BASE_URL}/billpayment/sales`, paymentBody, {
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          apikey: API_KEY,
          authorization: `Basic ${glocellAuth}`,
        },
      });

      const paymentData = paymentResponse.data;
      console.log('DStv Payment Response:', paymentData);

      return res.status(200).json({
        testAccount: testAccount,
        accountValidation: {
          request: {
            accountNumber: testAccount.accountNumber,
            productId: DSTV_PRODUCT_ID,
            vendorId: DSTV_VENDOR_ID,
          },
          response: validateData,
        },
        paymentProcessing: {
          request: paymentBody,
          response: paymentData,
        },
      });
    } else {
      return res.status(200).json({
        testAccount: testAccount,
        accountValidation: {
          request: {
            accountNumber: testAccount.accountNumber,
            productId: DSTV_PRODUCT_ID,
            vendorId: DSTV_VENDOR_ID,
          },
          response: validateData,
        },
        paymentProcessing: null,
        error: 'No reference received from account validation step',
      });
    }
  } catch (error: any) {
    console.error(`DStv Test Error:`, error.response?.data || error.message);
    
    return res.status(500).json({
      testAccount: testAccount,
      error: {
        message: error.response?.data?.message || error.message,
        status: error.response?.status || 500,
        data: error.response?.data || null,
      },
    });
  }
} 