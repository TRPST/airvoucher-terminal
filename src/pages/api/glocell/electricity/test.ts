import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const BASE_URL = process.env.GLOCELL_API_BASE_URL!;
const API_KEY = process.env.GLOCELL_API_KEY!;
const USERNAME = process.env.GLOCELL_API_USERNAME!;
const PASSWORD = process.env.GLOCELL_API_PASSWORD!;

// Test cases from compliance pack
const TEST_CASES = [
  {
    testCase: 1,
    scenario: "Generic Vend - 1 Credit Token",
    meterNumber: "00000100000",
    transactionType: "Syntell",
    amount: 20000, // R200.00 in cents
  },
  {
    testCase: 2,
    scenario: "Generic Vend - Credit Token with Second FBE Token",
    meterNumber: "00001100000",
    transactionType: "Syntell",
    amount: 20000,
  },
  {
    testCase: 3,
    scenario: "FBE Basic Electricity ONLY request - No amount",
    meterNumber: "00000100100",
    transactionType: "Syntell",
    amount: 0,
    freeBasicElectricity: true,
  },
  {
    testCase: 4,
    scenario: "Prepaid Water Meter Test",
    meterNumber: "00000100200",
    transactionType: "MeterMan",
    amount: 20000,
  },
  {
    testCase: 5,
    scenario: "Smart Meter Topup where NO Token is present",
    meterNumber: "00000100300",
    transactionType: "EkurhuleniDirectIMS",
    amount: 20000,
  },
  {
    testCase: 6,
    scenario: "Minimum Vend in Meter Confirmation Response",
    meterNumber: "00000100400",
    transactionType: "Syntell",
    amount: 500, // R5.00 in cents
  },
  {
    testCase: 7,
    scenario: "Maximum Vend in Meter Confirmation Response",
    meterNumber: "00000100500",
    transactionType: "Syntell",
    amount: 3000000, // R30,000.00 in cents
  },
  {
    testCase: 8,
    scenario: "Partial Block Scenario",
    meterNumber: "00000100600",
    transactionType: "N/A",
    amount: 20000,
  },
  {
    testCase: 9,
    scenario: "Full Block Scenario",
    meterNumber: "00000100700",
    transactionType: "N/A",
    amount: 10000, // R100.00 in cents
  },
  {
    testCase: 10,
    scenario: "Credit Token with two additional Key Change Tokens - 3 Tokens",
    meterNumber: "00000100800",
    transactionType: "Syntell",
    amount: 20000,
  },
  {
    testCase: 11,
    scenario: "Credit Token with FBE Token with additional Key Change Tokens - 4 Tokens",
    meterNumber: "00000100900",
    transactionType: "Syntell",
    amount: 20000,
  },
  {
    testCase: 12,
    scenario: "Tariff Details contained in Vend Responses -1 Tariff",
    meterNumber: "00000101000",
    transactionType: "Syntell",
    amount: 20000,
  },
  {
    testCase: 13,
    scenario: "Tariff Details contained in Vend Responses - Step Tariff",
    meterNumber: "00000101100",
    transactionType: "Syntell",
    amount: 20000,
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { testCase } = req.query;
  const testCaseNumber = parseInt(testCase as string);

  if (!testCaseNumber || testCaseNumber < 1 || testCaseNumber > TEST_CASES.length) {
    return res.status(400).json({ 
      message: `Invalid test case. Please provide a number between 1 and ${TEST_CASES.length}`,
      availableTestCases: TEST_CASES.map(tc => ({
        testCase: tc.testCase,
        scenario: tc.scenario,
        meterNumber: tc.meterNumber,
        transactionType: tc.transactionType,
        amount: tc.amount,
      }))
    });
  }

  const testCaseData = TEST_CASES[testCaseNumber - 1];
  const glocellAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

  try {
    // Step 1: Confirm Meter
    const confirmParams = new URLSearchParams({
      'meter-number': testCaseData.meterNumber,
      'transaction-type': testCaseData.transactionType,
    });

    if (testCaseData.freeBasicElectricity) {
      confirmParams.append('free-basic-electricity', 'true');
    } else {
      confirmParams.append('amount', testCaseData.amount.toString());
      confirmParams.append('free-basic-electricity', 'false');
    }

    console.log(`Testing Case ${testCaseNumber}: ${testCaseData.scenario}`);
    console.log(`Confirm Meter URL: ${BASE_URL}/electricity/info?${confirmParams.toString()}`);

    const confirmResponse = await axios.get(`${BASE_URL}/electricity/info?${confirmParams.toString()}`, {
      headers: {
        accept: 'application/json',
        apikey: API_KEY,
        authorization: `Basic ${glocellAuth}`,
      },
    });

    const confirmData = confirmResponse.data;
    console.log('Confirm Meter Response:', confirmData);

    // Step 2: Get Voucher (if confirm was successful)
    if (confirmData.reference) {
      const vendBody = {
        requestId: `test-${testCaseNumber}-${Date.now()}`,
        reference: confirmData.reference,
        vendMetaData: {
          transactionRequestDateTime: new Date().toISOString(),
          transactionReference: `test-ref-${testCaseNumber}`,
          vendorId: process.env.GLOCELL_VENDOR_ID || '000000',
          deviceId: process.env.GLOCELL_DEVICE_ID || '000000',
          consumerAccountNumber: testCaseData.meterNumber,
        },
      };

      console.log(`Get Voucher Request Body:`, vendBody);

      const vendResponse = await axios.post(`${BASE_URL}/electricity/sales`, vendBody, {
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          apikey: API_KEY,
          authorization: `Basic ${glocellAuth}`,
        },
      });

      const vendData = vendResponse.data;
      console.log('Get Voucher Response:', vendData);

      return res.status(200).json({
        testCase: testCaseNumber,
        scenario: testCaseData.scenario,
        confirmMeter: {
          request: {
            meterNumber: testCaseData.meterNumber,
            transactionType: testCaseData.transactionType,
            amount: testCaseData.amount,
            freeBasicElectricity: testCaseData.freeBasicElectricity || false,
          },
          response: confirmData,
        },
        getVoucher: {
          request: vendBody,
          response: vendData,
        },
      });
    } else {
      return res.status(200).json({
        testCase: testCaseNumber,
        scenario: testCaseData.scenario,
        confirmMeter: {
          request: {
            meterNumber: testCaseData.meterNumber,
            transactionType: testCaseData.transactionType,
            amount: testCaseData.amount,
            freeBasicElectricity: testCaseData.freeBasicElectricity || false,
          },
          response: confirmData,
        },
        getVoucher: null,
        error: 'No reference received from confirm meter step',
      });
    }
  } catch (error: any) {
    console.error(`Test Case ${testCaseNumber} Error:`, error.response?.data || error.message);
    
    return res.status(500).json({
      testCase: testCaseNumber,
      scenario: testCaseData.scenario,
      error: {
        message: error.response?.data?.message || error.message,
        status: error.response?.status || 500,
        data: error.response?.data || null,
      },
    });
  }
} 