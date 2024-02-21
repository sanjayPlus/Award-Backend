
const bcrypt = require('bcrypt');
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const serviceAccount = require("../firebase/firebase");
const { sendMail } = require('../helpers/emailHelper');
const Notification = require("../model/Notification");
const Feedback = require("../model/Feedback");
const register = async (req, res) => {
    try {
        
        const { name,
            email,
            password,
            address,
            phone,
            aadhaar,
            blood_group,
        } = req.body;
        //field validation
        if(!name || !email || !password || !address || !phone || !aadhaar || !blood_group) {
            return res.status(400).json({ message: "All fields are required" })
        }
        //email validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format." });
        }
        //password validation
        if (password.length < 6) {
            return res
              .status(400)
              .json({ error: "Password must be at least 6 characters long." });
          }
        //check if user already exists
        const user = await User.findOne({ email })
        if (user) {
            return res.status(401).json({ message: "User already exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            address,
            phone,
            aadhaar,
            blood_group,
        })
        newUser.save()
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '360d' })
        res.status(200).json({ token:token })

    } catch (error) {
        console.error("Error registering user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const foundUser = await User.findOne({ email })
        if (!foundUser) {
            return res.status(404).json({ message: "User not found" })
        }
        const isMatch = await bcrypt.compare(password, foundUser.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" })
        }
        const token = jwt.sign({ userId: foundUser._id }, process.env.JWT_SECRET, { expiresIn: '360d' })
        res.status(200).json({ token:token })
    } catch (error) {
        console.error("Error registering user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const protected = async (req, res) => {
    try {
     if(req.user.userId){
        res.status(200).json({ message: "User is Authenticated" })
     }else{
        res.status(400).json({ message: "User is not Authenticated" })
     }
    } catch (error) {
        console.error("Error registering user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const details = async (req, res) => {
    try {
        if(req.user.userId){
            const user = await User.findById(req.user.userId).select("-password");
            if(!user) return res.status(400).json({ message: "User not found" });
            res.status(200).json(user)
        }else{
            res.status(400).json({ message: "User is not Authenticated" })
        }
    } catch (error) {
        console.error("Error registering user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.userId);
        res.status(200).json({ message: "User deleted successfully" })
    } catch (error) {
        console.error("Error registering user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const updateUser = async (req, res) => {
        try {
            const { name,
                password,
                address,
                phone,
                aadhaar,
                blood_group,
                place,
                district,
            } = req.body;
            const user = await User.findById(req.user.userId);
            if(!user) return res.status(400).json({ message: "User not found" });

            if(name) user.name = name;
            if(password) user.password = password;
            if(address) user.address = address;
            if(phone) user.phone = phone;
            if(aadhaar) user.aadhaar = aadhaar;
            if(blood_group) user.blood_group = blood_group;
            if(place) user.place = place;
            if(district) user.district = district;
            await user.save();
            res.status(200).json({ message: "User updated successfully" });
        } catch (error) {
            console.error("Error registering user:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
}

const sentOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            return res.status(401).json({ message: "User not found" });
        }
        if(foundUser.isVerified){
            return res.status(401).json({ message: "User already verified" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        foundUser.otp = otp;
        foundUser.otpExpiry = otpExpiry;
        sendMail(email, `Your OTP is ${otp}`, "OTP Verification",
         `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: forestgreen;text-decoration:none;font-weight:600">Avard Kuda</a>
    </div>
    <p style="font-size:1.1em">Hi ${foundUser.name},</p>
    <p>Thank you for choosing <b>AVARD KUDA APP</b>. Use the following OTP to complete your Sign Up procedures. OTP is valid for 20 minutes</p>
    <h2 style="background: forestgreen;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br /><b>Avard Kuda</b></p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Avard</p>
      
    </div>
  </div>
</div>`);
        await foundUser.save();
        res.status(200).json({ message: `OTP sent to ${email}` });
    }catch (error) {
        console.error("Error registering user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const verifyOTP = async (req, res) => {
    try {
        const {email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const foundUser = await User.findOne({ otp:otp,email:email });
        if (!foundUser) {
            return res.status(401).json({ message: "Invalid OTP" });
        }
        if (foundUser.otpExpiry < Date.now()) {
            return res.status(401).json({ message: "OTP expired" });
        }
        foundUser.isVerified = true;
        foundUser.otp = undefined;
        foundUser.otpExpiry = undefined;
        await foundUser.save();
        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error("Error registering user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const forgotPassword = async (req,res) => {
    try {
        const {email} = req.body ; 
        if(!email){
            return res.status(400).json({ message: "All fields are required" });
        }
        const foundUser = await User.findOne({ email });
        if(!foundUser){
            return res.status(400).json({ message: "User not found" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        foundUser.forgotOTP =  otp;
        foundUser.forgotOTPExpiry = otpExpiry;
        sendMail(email, `Your OTP is ${otp}`, "OTP Verification",
         `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: forestgreen;text-decoration:none;font-weight:600">Avard Kuda</a>
    </div>
    <p style="font-size:1.1em">Hi ${foundUser.name},</p>
    <p>We have received a request to reset your password. Use the following OTP to reset your password. OTP is valid for 20 minutes</p>
    <h2 style="background: forestgreen;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br /><b>Avard Kuda</b></p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Avard</p>
 
    </div>
  </div>
</div>`
         );
        await foundUser.save();
        res.status(200).json({ message: `OTP sent to ${email}` });
    } catch (error) {
        console.error("Error registering user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const verifyForgotPassword = async (req,res) => {
    try {
        const {email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const foundUser = await User.findOne({ forgotOTP:otp,email:email });
        if (!foundUser) {
            return res.status(401).json({ message: "Invalid OTP" });
        }
        if (foundUser.forgotOTPExpiry < Date.now()) {
            return res.status(401).json({ message: "OTP expired" });
        }
        foundUser.forgotOTP = undefined;
        foundUser.forgotOTPExpiry = undefined;
        await foundUser.save();
        const token = jwt.sign({ userId: foundUser._id }, process.env.JWT_SECRET, { expiresIn: '360d' })
        res.status(200).json({token:token});
    } catch (error) {
        console.error("Error registering user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

//googlelogin
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
  console.log(token,"google")
    if (!token) {
      return res.status(400).json({ error: "ID token not provided." });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);

    const authUser = decodedToken;
    const user = await User.findOne({ email: authUser.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const tokenNew = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "36500d",
    });
console.log(tokenNew)
    res
      .status(200)
      .json({ token: tokenNew, user: { id: user._id, name: user.name } });
  } catch (error) {
    console.error("Error during ID card generation:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const appleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    console.log(token, "apple");

    if (!token) {
      return res.status(400).json({ error: "ID token not provided." });
    }

    // Verify the ID token using the Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Retrieve user information based on the email from the decoded token
    const user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a new JWT token for the authenticated user
    const tokenNew = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "36500d",
    });

    console.log(tokenNew);

    // Send the new token and user information in the response
    res.status(200).json({
      token: tokenNew,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error during ID token verification:", error.message);
    // Provide a more specific error message in the response
    res.status(500).json({ error: "Internal Server Error: Unable to verify ID token" });
  }
};


//fast search api
const bloodDonation1 = async (req, res) => {
    try {
        const { blood_group, district, place, name } = req.query;

        if (!blood_group || !district) {
            return res.status(400).json({ message: "Blood group and district are required" });
        }

        let query = { blood_group, district };

        if (name) {
            query.name = name;
        } else if (place) {
            query.place = place;
        } else if (name && place) {
            query = { name, place, blood_group, district };
        }

        const foundUser = await User.find(query);

        if (!foundUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Extract only the specified fields
        const filteredResponse = foundUser.map(user => ({
            blood_group: user.blood_group,
            district: user.district,
            place: user.place,
            name: user.name
        }));

        res.status(200).json(filteredResponse);
    } catch (error) {
        console.error("Error searching for user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
//slow search api
const bloodDonation2 = async (req, res) => {
    try {
        const { blood_group, district, place, name } = req.query;
        let filterData = await User.find({});
        
        if (name) {
            filterData = filterData.filter((user) => user.name === name);
        }
        if (place) {
            filterData = filterData.filter((user) => user.place === place);
        }
        if (blood_group) {
            filterData = filterData.filter((user) => user.blood_group === blood_group);
        }
        if (district) {
            filterData = filterData.filter((user) => user.district === district);
        }
        // Extract only the specified fields
        const filteredResponse = filterData.map(({ blood_group, district, place, name }) => ({
            blood_group,
            district,
            place,
            name
        }));
        

        res.status(200).json(filteredResponse);
    } catch (error) {
        console.error("Error retrieving user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const autoLogin = async (req, res) => {
  try {
    // Retrieve userId from request
    const userId = req.user.userId;

    // Find user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch data from the STORE_URL endpoint
    const response = await fetch(
      `${process.env.STORE_URL}/api/user/auto-login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: user.password, // Ensure you're not sending the actual password here for security reasons
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from STORE_URL");
    }

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error });
    }
    // Return the URL and token from the response
    res.status(200).json({ url: data.url, token: data.token });
  } catch (error) {
    console.error("Error during autoLogin:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const autoLoginMedal = async (req, res) => {
    try {
      // Retrieve userId from request
      const userId = req.user.userId;
  
      // Find user by userId
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Fetch data from the STORE_URL endpoint
      const response = await fetch(
        `${process.env.MEDAL_STORE_URL}/api/user/auto-login-medal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            password: user.password, // Ensure you're not sending the actual password here for security reasons
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch data from STORE_URL");
      }
  
      const data = await response.json();
  
      if (data.error) {
        return res.status(400).json({ error: data.error });
      }
      // Return the URL and token from the response
      res.status(200).json({ url: data.url, token: data.token });
    } catch (error) {
      console.error("Error during autoLogin:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
const storeNotificationToken = async (req, res) => {
    try {
    const { FCMToken } = req.body;
    const notification = await Notification.findOne({ token:FCMToken  }); 
    if(!notification){
      const notification = await Notification.create({ token: FCMToken, userId: req.user.userId });
      res.status(200).json({ notification });
    }else{
      res.status(200).json({ notification });
    }
    }catch(error){
      console.error("Error during token store:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
//feedback
const feedback = async (req, res) => {
    try {
        const { feedback, rating } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if(!feedback || !rating){
            return res.status(400).json({ message: "Please provide feedback and rating" });
        }
        if(rating < 1 || rating > 5){
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }
        const newFeedback = new Feedback({
            feedback,
            rating,
            userId: user._id,
            username: user.name,
            email: user.email
        });
        await newFeedback.save();
        res.status(200).json({ message: "Feedback submitted successfully" });
    }catch(error){
        console.error("Error submitting feedback:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
module.exports ={
    register,
    login,
    protected,
    details,
    deleteUser,
    updateUser,
    sentOTP,
    verifyOTP,
    forgotPassword,
    verifyForgotPassword,
    googleLogin,
    appleLogin,
    bloodDonation1,
    bloodDonation2,
    autoLogin,
    storeNotificationToken,
    feedback,
    autoLoginMedal
}