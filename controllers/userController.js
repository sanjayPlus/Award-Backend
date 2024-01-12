
const bcrypt = require('bcrypt');
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../helpers/emailHelper');
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
        if(!name || !email || !password || !address || !phone || !aadhaar || !blood_group) {
            return res.status(400).json({ message: "All fields are required" })
        }
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
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const foundUser = await User.findOne({ email })
        if (!foundUser) {
            return res.status(401).json({ message: "User not found" })
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
            } = req.body;
            const user = await User.findById(req.user.userId);
            if(!user) return res.status(400).json({ message: "User not found" });

            if(name) user.name = name;
            if(password) user.password = password;
            if(address) user.address = address;
            if(phone) user.phone = phone;
            if(aadhaar) user.aadhaar = aadhaar;
            if(blood_group) user.blood_group = blood_group;
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
        sendMail(email, `Your OTP is ${otp}`, "OTP Verification", `<h1>Your OTP is ${otp}</h1>`);
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

module.exports ={
    register,
    login,
    protected,
    details,
    deleteUser,
    updateUser,
    sentOTP,
    verifyOTP
}