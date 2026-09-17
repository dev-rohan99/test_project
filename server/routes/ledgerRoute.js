const express = require("express");
const {
  mintTokens,
  transferTokens,
  getBalance,
} = require("../controllers/ledgerController");

const router = express.Router();

router.post("/mint", mintTokens);
router.post("/transfer", transferTokens);
router.get("/balance/:account", getBalance);

module.exports = router;
