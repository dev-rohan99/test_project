import React, { useState } from 'react';

function TokenLedger() {
  const [balances, setBalances] = useState({});

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

  const [balanceLoading, setBalanceLoading] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);

  const isValidAddress = (address) => {
    if (!address || typeof address !== 'string') return false;
    const trimmed = address.trim();
    if (trimmed.length === 0) return false;
    return /^(0x[a-fA-F0-9]{40}|[a-zA-Z0-9_\-]{3,64})$/.test(trimmed);
  };

  const clearFeedback = () => {
    setMessage(null);
    setError(null);
  };

  const handleCheckBalance = (e) => {
    e.preventDefault();
    clearFeedback();
    
    if (!lookupAccount.trim()) {
      setError('Please enter an account address');
      return;
    }

    if (!isValidAddress(lookupAccount)) {
      setError('Invalid account address format');
      setBalanceResult(null);
      return;
    }

    setBalanceLoading(true);
    
    setTimeout(() => {
      const key = lookupAccount.trim().toLowerCase();
      const currentBalance = balances[key] || 0;
      
      setBalanceResult({
        account: key,
        balance: currentBalance
      });
      setBalanceLoading(false);
    }, 200);
  };

  const handleMint = (e) => {
    e.preventDefault();
    clearFeedback();

    if (!mintAccount.trim() || !mintAmount) {
      setError('Please provide both account address and amount to mint');
      return;
    }

    if (!isValidAddress(mintAccount)) {
      setError('Invalid account address format');
      return;
    }

    const numAmount = Number(mintAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    setMintLoading(true);

    setTimeout(() => {
      const key = mintAccount.trim().toLowerCase();
      const currentBalance = balances[key] || 0;
      const newBalance = currentBalance + numAmount;

      const updatedBalances = { ...balances, [key]: newBalance };
      setBalances(updatedBalances);

      setMessage(`Successfully minted ${numAmount} tokens to ${key}`);

      if (lookupAccount.trim().toLowerCase() === key) {
        setBalanceResult({ account: key, balance: newBalance });
      } else {
        setLookupAccount(mintAccount.trim());
        setBalanceResult({ account: key, balance: newBalance });
      }

      setMintAmount('');
      setMintAccount('');
      setMintLoading(false);
    }, 300);
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    clearFeedback();

    if (!fromAccount.trim() || !toAccount.trim() || !transferAmount) {
      setError('Please fill in sender, recipient, and amount');
      return;
    }

    if (!isValidAddress(fromAccount) || !isValidAddress(toAccount)) {
      setError('Invalid account address format');
      return;
    }

    const fromKey = fromAccount.trim().toLowerCase();
    const toKey = toAccount.trim().toLowerCase();

    if (fromKey === toKey) {
      setError('Cannot transfer tokens to the same account');
      return;
    }

    const numAmount = Number(transferAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    const senderBalance = balances[fromKey] || 0;
    if (senderBalance < numAmount) {
      setError('Insufficient balance');
      return;
    }

    setTransferLoading(true);

    setTimeout(() => {
      const newSenderBalance = senderBalance - numAmount;
      const newReceiverBalance = (balances[toKey] || 0) + numAmount;

      const updatedBalances = {
        ...balances,
        [fromKey]: newSenderBalance,
        [toKey]: newReceiverBalance
      };
      setBalances(updatedBalances);

      setMessage(`Successfully transferred ${numAmount} tokens`);

      const currentLookupKey = lookupAccount.trim().toLowerCase();
      if (currentLookupKey === fromKey) {
        setBalanceResult({ account: fromKey, balance: newSenderBalance });
      } else if (currentLookupKey === toKey) {
        setBalanceResult({ account: toKey, balance: newReceiverBalance });
      }

      setTransferAmount('');
      setFromAccount('');
      setToAccount('');
      setTransferLoading(false);
    }, 300);
  };

  return (
    <div className="container py-10 space-y-8" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Token Ledger</h1>
        <p className="text-secondary-600 mt-1">
          Manage token balances, mint supply, and transfer tokens between accounts.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm" style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm" style={{ padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', color: '#15803d', borderRadius: '6px', marginBottom: '15px' }}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Balance Lookup Card */}
        <div className="card p-6 flex flex-col justify-between" style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px', backgroundColor: '#fff' }}>
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Check Balance</h2>
            <form onSubmit={handleCheckBalance} className="space-y-4">
              <div style={{ marginBottom: '15px' }}>
                <label className="block text-sm font-medium text-secondary-700 mb-1" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Account Address</label>
                <input
                  type="text"
                  placeholder="e.g. 0x1111... or user123"
                  value={lookupAccount}
                  onChange={(e) => setLookupAccount(e.target.value)}
                  className="input px-3 py-2 border rounded-md"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" disabled={balanceLoading} className="btn w-full justify-center" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                {balanceLoading ? 'Checking...' : 'Check Balance'}
              </button>
            </form>
          </div>
          {balanceResult && (
            <div className="mt-6 pt-4 border-t border-secondary-100 bg-secondary-50 p-3 rounded-md" style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
              <span className="block text-xs text-secondary-500 uppercase tracking-wider font-semibold" style={{ fontSize: '12px', color: '#666', display: 'block' }}>Current Balance</span>
              <span className="text-2xl font-bold text-primary-600" style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', display: 'block' }}>{balanceResult.balance} Tokens</span>
            </div>
          )}
        </div>

                {/* Mint Tokens Card */}
                <div className="card p-6" style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px' }}>
          <h2 className="text-xl font-semibold text-secondary-800 mb-4">Mint Tokens</h2>
          <form onSubmit={handleMint} className="space-y-4">
            <div style={{ marginBottom: '15px' }}>
              <label className="block text-sm font-medium text-secondary-700 mb-1" style={{ display: 'block', marginBottom: '5px' }}>Target Account</label>
              <input
                type="text"
                placeholder="e.g. 0x1111... or user123"
                value={mintAccount}
                onChange={(e) => setMintAccount(e.target.value)}
                className="input px-3 py-2 border rounded-md"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label className="block text-sm font-medium text-secondary-700 mb-1" style={{ display: 'block', marginBottom: '5px' }}>Amount</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 100"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                className="input px-3 py-2 border rounded-md"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <button type="submit" disabled={mintLoading} className="btn w-full justify-center" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {mintLoading ? 'Minting...' : 'Mint Tokens'}
            </button>
          </form>
        </div>

        {/* Transfer Tokens Card */}
        <div className="card p-6" style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px' }}>
          <h2 className="text-xl font-semibold text-secondary-800 mb-4">Transfer Tokens</h2>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div style={{ marginBottom: '10px' }}>
              <label className="block text-sm font-medium text-secondary-700 mb-1" style={{ display: 'block', marginBottom: '5px' }}>From Account</label>
              <input
                type="text"
                placeholder="Sender address"
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="input px-3 py-2 border rounded-md"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label className="block text-sm font-medium text-secondary-700 mb-1" style={{ display: 'block', marginBottom: '5px' }}>To Account</label>
              <input
                type="text"
                placeholder="Recipient address"
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className="input px-3 py-2 border rounded-md"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label className="block text-sm font-medium text-secondary-700 mb-1" style={{ display: 'block', marginBottom: '5px' }}>Amount</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 50"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="input px-3 py-2 border rounded-md"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <button type="submit" disabled={transferLoading} className="btn w-full justify-center" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {transferLoading ? 'Transferring...' : 'Transfer Tokens'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TokenLedger;
