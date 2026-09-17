import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3099';

function TokenLedger() {
  // Balance lookup state
  const [lookupAccount, setLookupAccount] = useState('');
  const [balanceResult, setBalanceResult] = useState(null);

  // Mint state
  const [mintAccount, setMintAccount] = useState('');
  const [mintAmount, setMintAmount] = useState('');

  // Transfer state
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // Feedback messages
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const clearFeedback = () => {
    setMessage(null);
    setError(null);
  };

  const handleCheckBalance = async (e) => {
    e.preventDefault();
    clearFeedback();
    if (!lookupAccount.trim()) {
      setError('Please enter an account address');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/ledger/balance/${encodeURIComponent(lookupAccount.trim())}`);
      if (data.success) {
        setBalanceResult(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch balance');
      setBalanceResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();
    clearFeedback();

    if (!mintAccount.trim() || !mintAmount) {
      setError('Please provide both account address and amount to mint');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/ledger/mint`, {
        account: mintAccount.trim(),
        amount: Number(mintAmount),
      });

      if (data.success) {
        setMessage(data.message || 'Tokens minted successfully');
        if (lookupAccount.trim().toLowerCase() === mintAccount.trim().toLowerCase()) {
          setBalanceResult(data.data);
        }
        setMintAmount('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Minting failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    clearFeedback();

    if (!fromAccount.trim() || !toAccount.trim() || !transferAmount) {
      setError('Please fill in sender, recipient, and amount');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/ledger/transfer`, {
        fromAccount: fromAccount.trim(),
        toAccount: toAccount.trim(),
        amount: Number(transferAmount),
      });

      if (data.success) {
        setMessage(data.message || 'Tokens transferred successfully');
        setTransferAmount('');
        if (lookupAccount.trim().toLowerCase() === fromAccount.trim().toLowerCase()) {
          setBalanceResult((prev) => prev ? { ...prev, balance: data.data.fromBalance } : null);
        } else if (lookupAccount.trim().toLowerCase() === toAccount.trim().toLowerCase()) {
          setBalanceResult((prev) => prev ? { ...prev, balance: data.data.toBalance } : null);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Token Ledger</h1>
        <p className="text-secondary-600 mt-1">
          Manage token balances, mint supply, and transfer tokens between accounts.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Lookup Card */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Check Balance</h2>
            <form onSubmit={handleCheckBalance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Account Address</label>
                <input
                  type="text"
                  placeholder="e.g. 0x1111... or user123"
                  value={lookupAccount}
                  onChange={(e) => setLookupAccount(e.target.value)}
                  className="input px-3 py-2 border rounded-md"
                />
              </div>
              <button type="submit" disabled={loading} className="btn w-full justify-center">
                {loading ? 'Checking...' : 'Check Balance'}
              </button>
            </form>
          </div>
          {balanceResult && (
            <div className="mt-6 pt-4 border-t border-secondary-100 bg-secondary-50 p-3 rounded-md">
              <span className="block text-xs text-secondary-500 uppercase tracking-wider font-semibold">Current Balance</span>
              <span className="text-2xl font-bold text-primary-600">{balanceResult.balance} Tokens</span>
            </div>
          )}
        </div>

        {/* Mint Tokens Card */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-secondary-800 mb-4">Mint Tokens</h2>
          <form onSubmit={handleMint} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Target Account</label>
              <input
                type="text"
                placeholder="e.g. 0x1111... or user123"
                value={mintAccount}
                onChange={(e) => setMintAccount(e.target.value)}
                className="input px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Amount</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 100"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                className="input px-3 py-2 border rounded-md"
              />
            </div>
            <button type="submit" disabled={loading} className="btn w-full justify-center">
              {loading ? 'Minting...' : 'Mint Tokens'}
            </button>
          </form>
        </div>

        {/* Transfer Tokens Card */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-secondary-800 mb-4">Transfer Tokens</h2>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">From Account</label>
              <input
                type="text"
                placeholder="Sender address"
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="input px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">To Account</label>
              <input
                type="text"
                placeholder="Recipient address"
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className="input px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Amount</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 50"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="input px-3 py-2 border rounded-md"
              />
            </div>
            <button type="submit" disabled={loading} className="btn w-full justify-center">
              {loading ? 'Transferring...' : 'Transfer Tokens'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TokenLedger;
