const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const userAuth = require("../middleware/userAuth");
const adminAuth = require("../middleware/adminAuth");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../controllers/emailController");
const Payment = require("../models/Payment");

const jwtSecret = process.env.JWT_SECRET;

router.get("/checkout/:amount/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const { userId } = jwt.verify(token, jwtSecret);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!req.params.amount) {
      return res.status(404).json({ message: "Amount not found" });
    }
    if (!user.name || !user.phoneNumber) {
      return res
        .status(404)
        .json({ message: "Name or phone number not found" });
    }

    const merchantTransactionId = crypto.randomBytes(16).toString("hex");
    const data = {
      merchantId: process.env.MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: "MUID" + Date.now(),
      name: user.name,
      amount: req.params.amount * 100,
      redirectUrl:
        process.env.PHONEPAY_REDIRECT_URL +
        "/api/payment/status/" +
        merchantTransactionId +
        "/" +
        process.env.MERCHANT_ID +
        "/" +
        req.params.amount +
        "/" +
        token,
      redirectMode: "GET",
      mobileNumber: user.phoneNumber, // corrected property name 'phone' to 'phoneNumber'
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    const string = payloadMain + "/pg/v1/pay" + process.env.PHONEPAY_API_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const prod_URL = process.env.PHONEPAY_API_URL + "/pg/v1/pay";
    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    const response = await axios(options);
    return res
      .status(200)
      .json({ url: response.data.data.instrumentResponse.redirectInfo.url });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

router.get(
  "/status/:transactionId/:merchantId/:amount/:token",
  async (req, res) => {
    const merchantTransactionId = req.params.transactionId;
    const merchantId = req.params.merchantId;
    const amount = req.params.amount;
    const token = req.params.token;
    const { userId } = jwt.verify(token, jwtSecret);
    const user = await User.findById(userId);

    const keyIndex = 1;
    const string =
      `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
      process.env.PHONEPAY_API_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const options = {
      method: "GET",
      url: `${process.env.PHONEPAY_API_URL}/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": `${merchantId}`,
      },
    };

    // CHECK PAYMENT TATUS
    axios
      .request(options)
      .then(async (response) => {
        
        if (response.data.success === true) {
          if (response.data.data.state === "COMPLETED") {
            const { name, email, phoneNumber } = user;
            const paymentAmount = response.data.data.amount / 100;

            const payment = await Payment.findOne({ merchantTransactionId });
            if (payment) {
              return res.status(404).json({ message: "Payment Already done" });
            }
            const payments = await Payment.create({
              userId,
              merchantId,
              merchantTransactionId,
              amount: paymentAmount,
              date: new Date().toLocaleDateString(),
              body: response.data.data,
              name,
              email,
              phone: phoneNumber,
              
            });
            user.payments.push({
              paymentId: payments._id,
              merchantId,
              merchantTransactionId,
              amount: paymentAmount,
              date: new Date().toLocaleDateString(),
            });
            await user.save();

            const htmlContent = sendMail(
              email,
              "Payment Successful",
              "Payment Successful",
              `<div>
              <h1 style="text-align:center">Payment Successful</h1>
              <br>
              <p>Dear ${name},</p>
              <br>
              <p>Thankyou for your Contribution to Avard Bhavan</p>
              <p>Your Payment Details</p>
              <br>
              <p>Your transaction Id is ${merchantTransactionId}</p>
              <p>Email ${name}</p>
              <p>Amount ${amount}</p>
              <p>Email ${email}</p>
              <p>Phone ${phoneNumber}</p>
                  <br>
              </div>`
            );

            const url = `${process.env.PHONEPAY_REDIRECT_URL}/api/payment/success`;
            return res.redirect(url);
          } else {
            const url = `${process.env.PHONEPAY_REDIRECT_URL}/api/payment/failure`;
            return res.redirect(url);
          }
        } else {
          const url = `${process.env.PHONEPAY_REDIRECT_URL}/api/payment/failure`;
          return res.redirect(url);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
);


router.get("/success", (req, res) => {
  res.redirect("https://intucthrissur.com");
});
router.get("/failure", (req, res) => {
  res.send("Payment Failed");
});
router.get("/payment-details/:page/:limit", adminAuth, async (req, res) => {
  const page = parseInt(req.params.page);
  const limit = parseInt(req.params.limit);

  try {
    const totalCount = await Payment.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const payments = await Payment.find().skip(skip).limit(limit).exec();

    res.status(200).json({
      data: payments,
      page,
      totalPages,
      totalPayments: totalCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;