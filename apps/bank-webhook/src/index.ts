import express from "express";
import db from "@repo/db/client";

const app = express();

app.post("/", async (req, res) => {
  const paymentInformation = {
    token: req.body.token,
    userId: req.body.user_identifier,
    amount: req.body.amoun,
  };

  try {
    // Update balance in db
    await db.balance.update({
      where: {
        userId: paymentInformation.userId,
      },
      data: {
        amount: {
          // Always use increment instead of amount + amount because in case of
          // parallel requests amount will be updated wrongly
          increment: paymentInformation.amount,
        },
      },
    });

    await db.onRampTransaction.update({
      where: {
        token: paymentInformation.token,
      },
      data: {
        status: "success",
      },
    });

    // We send the 200 response to the bank , if not the bank will refund the amount
    // so super important
    res.status(200).json({
      message: "Captured",
    });
  } catch (err: any) {
    console.log(
      "Something went wrong when bank hit the express server",
      err.message
    );
    await db.onRampTransaction.update({
      where: {
        token: paymentInformation.token,
      },
      data: {
        status: "failure",
      },
    });

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// balances
// onRampTransactions
