class LedgerService {
  constructor() {
    this.balances = new Map();
  }

  isValidAddress(address) {
    if (!address || typeof address !== "string") return false;
    const trimmed = address.trim();
    if (trimmed.length === 0) return false;
    return /^(0x[a-fA-F0-9]{40}|[a-zA-Z0-9_\-]{3,64})$/.test(trimmed);
  }

  isValidAmount(amount) {
    const num = Number(amount);
    return !isNaN(num) && isFinite(num) && num > 0;
  }

  getBalance(account) {
    const key = account.trim().toLowerCase();
    return this.balances.get(key) || 0;
  }

  mint(account, amount) {
    const key = account.trim().toLowerCase();
    const currentBalance = this.getBalance(key);
    const newBalance = currentBalance + Number(amount);
    this.balances.set(key, newBalance);
    return { account: key, balance: newBalance };
  }

  transfer(fromAccount, toAccount, amount) {
    const fromKey = fromAccount.trim().toLowerCase();
    const toKey = toAccount.trim().toLowerCase();
    const numAmount = Number(amount);

    const senderBalance = this.getBalance(fromKey);
    if (senderBalance < numAmount) {
      throw new Error("Insufficient balance");
    }

    const newSenderBalance = senderBalance - numAmount;
    const newReceiverBalance = this.getBalance(toKey) + numAmount;

    this.balances.set(fromKey, newSenderBalance);
    this.balances.set(toKey, newReceiverBalance);

    return {
      fromAccount: fromKey,
      toAccount: toKey,
      amount: numAmount,
      fromBalance: newSenderBalance,
      toBalance: newReceiverBalance,
    };
  }

  reset() {
    this.balances.clear();
  }
}

module.exports = new LedgerService();
