import * as React from 'react';
import { useState } from 'react';

export default function TestElectricity() {
  const [testCase, setTestCase] = useState('1');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testCases = [
    { value: '1', label: '1 - Generic Vend - 1 Credit Token' },
    { value: '2', label: '2 - Generic Vend - Credit Token with Second FBE Token' },
    { value: '3', label: '3 - FBE Basic Electricity ONLY request - No amount' },
    { value: '4', label: '4 - Prepaid Water Meter Test' },
    { value: '5', label: '5 - Smart Meter Topup where NO Token is present' },
    { value: '6', label: '6 - Minimum Vend in Meter Confirmation Response' },
    { value: '7', label: '7 - Maximum Vend in Meter Confirmation Response' },
    { value: '8', label: '8 - Partial Block Scenario' },
    { value: '9', label: '9 - Full Block Scenario' },
    { value: '10', label: '10 - Credit Token with two additional Key Change Tokens - 3 Tokens' },
    { value: '11', label: '11 - Credit Token with FBE Token with additional Key Change Tokens - 4 Tokens' },
    { value: '12', label: '12 - Tariff Details contained in Vend Responses -1 Tariff' },
    { value: '13', label: '13 - Tariff Details contained in Vend Responses - Step Tariff' },
  ];

  const runTest = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/glocell/electricity/test?testCase=${testCase}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Test failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Electricity API Test Suite</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Test Case:</label>
        <select
          value={testCase}
          onChange={(e) => setTestCase(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {testCases.map((tc) => (
            <option key={tc.value} value={tc.value}>
              {tc.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={runTest}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Running Test...' : 'Run Test'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h3 className="font-medium mb-2">Test Case {result.testCase}: {result.scenario}</h3>
          </div>

          {result.confirmMeter && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Step 1: Confirm Meter</h3>
              <div className="bg-white border rounded-md p-4">
                <h4 className="font-medium mb-2">Request:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.confirmMeter.request, null, 2)}
                </pre>
                
                <h4 className="font-medium mb-2 mt-4">Response:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.confirmMeter.response, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {result.getVoucher && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Step 2: Get Voucher</h3>
              <div className="bg-white border rounded-md p-4">
                <h4 className="font-medium mb-2">Request:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.getVoucher.request, null, 2)}
                </pre>
                
                <h4 className="font-medium mb-2 mt-4">Response:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.getVoucher.response, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {result.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
              <strong>Error:</strong> {result.error.message}
              {result.error.data && (
                <pre className="mt-2 bg-red-50 p-2 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.error.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 