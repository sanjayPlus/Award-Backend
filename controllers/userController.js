
const bcrypt = require('bcrypt');
const User = require('../model/User');
const jwt = require('jsonwebtoken');
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

module.exports ={
    register,
    login,
    protected,
    details,
    deleteUser
}