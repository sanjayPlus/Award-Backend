const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../model/Admin");
const User = require("../model/User");
const Carousel = require("../model/Carousel");
const jwtSecret = process.env.JWT_ADMIN_SECRET;
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
        return res
            .status(400)
            .json({ error: "Please provide all required fields." });
        }
        const user = await Admin.findOne({ email });
        if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
        }
        const payload = {
        user: {
            id: user._id,
        },
        };
        jwt.sign(payload, jwtSecret, { expiresIn: "1h" }, (err, token) => {
        if (err) throw err;
        res.status(200).json({ token });
        });
    } catch (error) {
        console.error("Error logging in admin:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
//remove this after creating admin
const adminRegister = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
        return res
            .status(400)
            .json({ error: "Please provide all required fields." });
        }
        const user = await Admin.findOne({ email });
        if (user) {
        return res.status(400).json({ error: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await Admin.create({
        email,
        password: hashedPassword,
        });
        const payload = {
        user: {
            id: newUser._id,
        },
        };
        jwt.sign(payload, jwtSecret, { expiresIn: "3h" }, (err, token) => {
        if (err) throw err;
        res.status(200).json({ token });
        });
    } catch (error) {
        console.error("Error registering admin:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const protected = async (req, res) => {
    try {
        if (req.user) {
          res.status(200).json({ message: "You are authorized" });
        } else {
          res.status(401).json({ message: "You are not authorized" });
        }
      } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
      }
}
const getUser = async (req, res) => {
    const { id } = req.params.id;
    try {
        const user = await User.findById(id);
        res.status(200).json(user);
    } catch (error) {
        console.error("Error getting user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const { page = 1, perPage = 10 } = req.query;
        const skip = (page - 1) * perPage;

        const users = await User.find({})
            .skip(skip)
            .limit(Number(perPage));

        res.status(200).json(users);
    } catch (error) {
        console.error("Error getting all users:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const addCarouselImage = async (req, res) => {
    const { href,name } = req.body;
    const { image } = req.file;
    try {
        const newCarousel = await Carousel.create({
            image: image,
            href:href,
            name:name
        })
        if (!newCarousel) return res.status(400).json({ message: "Image not added" });
        res.status(200).json({ message: "Image added successfully" });
    } catch (error) {
        console.error("Error adding image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
module.exports={
    adminLogin,
    adminRegister,
    protected,
    getUser,
    getAllUsers,
    addCarouselImage,

}