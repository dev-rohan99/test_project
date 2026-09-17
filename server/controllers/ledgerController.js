const ledgerService = require("../services/ledgerService");

exports.mintTokens = (req, res) => {
  const { account, amount } = req.body;

  if (!account || amount === undefined || amount === null) {
    return res.status(400).json({
      success: false,
      message: "Account and amount are required",
    });
  }

  if (!ledgerService.isValidAddress(account)) {
    return res.status(400).json({
      success: false,
      message: "Invalid account address format",
    });
  }

  if (!ledgerService.isValidAmount(amount)) {
    return res.status(400).json({
      success: false,
      message: "Amount must be a positive number",
    });
  }

  const result = ledgerService.mint(account, amount);
  return res.status(201).json({
    success: true,
    message: `Successfully minted ${amount} tokens`,
    data: result,
  });
};

exports.transferTokens = (req, res) => {
  const { fromAccount, toAccount, amount } = req.body;

  if (!fromAccount || !toAccount || amount === undefined || amount === null) {
    return res.status(400).json({
      success: false,
      message: "fromAccount, toAccount, and amount are required",
    });
  }

  if (!ledgerService.isValidAddress(fromAccount)) {
    return res.status(400).json({
      success: false,
      message: "Invalid sender account address format",
    });
  }

  if (!ledgerService.isValidAddress(toAccount)) {
    return res.status(400).json({
      success: false,
      message: "Invalid recipient account address format",
    });
  }

  if (fromAccount.trim().toLowerCase() === toAccount.trim().toLowerCase()) {
    return res.status(400).json({
      success: false,
      message: "Cannot transfer tokens to the same account",
    });
  }

  if (!ledgerService.isValidAmount(amount)) {
    return res.status(400).json({
      success: false,
      message: "Amount must be a positive number",
    });
  }

  try {
    const result = ledgerService.transfer(fromAccount, toAccount, amount);
    return res.status(200).json({
      success: true,
      message: `Successfully transferred ${amount} tokens`,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Transfer failed",
    });
  }
};

exports.getBalance = (req, res) => {
  const { account } = req.params;

  if (!account || !ledgerService.isValidAddress(account)) {
    return res.status(400).json({
      success: false,
      message: "Invalid account address format",
    });
  }

  const balance = ledgerService.getBalance(account);
  return res.status(200).json({
    success: true,
    data: {
      account: account.trim().toLowerCase(),
      balance,
    },
  });
};
