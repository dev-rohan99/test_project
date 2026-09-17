const ledgerService = require("../server/services/ledgerService");
const {
  mintTokens,
  transferTokens,
  getBalance,
} = require("../server/controllers/ledgerController");

function createMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("Token Ledger Backend Tests", () => {
  beforeEach(() => {
    ledgerService.reset();
  });

  describe("1. Mint Tokens", () => {
    it("should successfully mint tokens to a valid account", () => {
      const req = {
        body: {
          account: "0x1111111111111111111111111111111111111111",
          amount: 100,
        },
      };
      const res = createMockRes();

      mintTokens(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: {
            account: "0x1111111111111111111111111111111111111111",
            balance: 100,
          },
        })
      );
    });

    it("should reject minting when account or amount is missing", () => {
      const req = { body: { account: "0x1111111111111111111111111111111111111111" } };
      const res = createMockRes();

      mintTokens(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Account and amount are required",
        })
      );
    });
  });

  describe("2. Balance Lookup", () => {
    it("should return balance of 0 for unminted account", () => {
      const req = { params: { account: "0x2222222222222222222222222222222222222222" } };
      const res = createMockRes();

      getBalance(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          account: "0x2222222222222222222222222222222222222222",
          balance: 0,
        },
      });
    });

    it("should return updated balance after minting", () => {
      ledgerService.mint("0x1111111111111111111111111111111111111111", 350);

      const req = { params: { account: "0x1111111111111111111111111111111111111111" } };
      const res = createMockRes();

      getBalance(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          account: "0x1111111111111111111111111111111111111111",
          balance: 350,
        },
      });
    });
  });

  describe("3. Transfer Tokens", () => {
    it("should transfer tokens between two accounts successfully", () => {
      const accountA = "0x1111111111111111111111111111111111111111";
      const accountB = "0x2222222222222222222222222222222222222222";

      ledgerService.mint(accountA, 500);

      const req = {
        body: {
          fromAccount: accountA,
          toAccount: accountB,
          amount: 200,
        },
      };
      const res = createMockRes();

      transferTokens(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: {
            fromAccount: accountA,
            toAccount: accountB,
            amount: 200,
            fromBalance: 300,
            toBalance: 200,
          },
        })
      );
    });
  });

  describe("4. Insufficient Balance Handling", () => {
    it("should reject transfer when sender has insufficient balance", () => {
      const accountA = "0x1111111111111111111111111111111111111111";
      const accountB = "0x2222222222222222222222222222222222222222";

      ledgerService.mint(accountA, 50);

      const req = {
        body: {
          fromAccount: accountA,
          toAccount: accountB,
          amount: 100,
        },
      };
      const res = createMockRes();

      transferTokens(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Insufficient balance",
      });
    });
  });

  describe("5. Invalid Input Validation", () => {
    it("should reject negative amount on mint", () => {
      const req = {
        body: {
          account: "0x1111111111111111111111111111111111111111",
          amount: -50,
        },
      };
      const res = createMockRes();

      mintTokens(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Amount must be a positive number",
        })
      );
    });

    it("should reject zero amount on transfer", () => {
      const accountA = "0x1111111111111111111111111111111111111111";
      const accountB = "0x2222222222222222222222222222222222222222";
      ledgerService.mint(accountA, 100);

      const req = {
        body: {
          fromAccount: accountA,
          toAccount: accountB,
          amount: 0,
        },
      };
      const res = createMockRes();

      transferTokens(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Amount must be a positive number",
        })
      );
    });

    it("should reject invalid account address format", () => {
      const req = {
        body: {
          account: "invalid address format!!",
          amount: 50,
        },
      };
      const res = createMockRes();

      mintTokens(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid account address format",
        })
      );
    });
  });
});
