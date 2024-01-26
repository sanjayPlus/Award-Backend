const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../model/Admin");
const User = require("../model/User");
const Carousel = require("../model/Carousel");
const Gallery = require("../model/Gallery");
const Ads = require("../model/Ads");
const Offer = require("../model/Offer");
const Notification = require("../model/Notification");
const NotificationList = require("../model/NotificationList");
const serviceAccount = require("../firebase/firebase");
const jwtSecret = process.env.JWT_ADMIN_SECRET;
const Cache = require('../helpers/Cache');
const cacheTime = 600
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
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        console.error("Error getting user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const { page, perPage, search } = req.query;
        const skip = (page - 1) * perPage;
        const searchQuery = req.query.search; // Assuming you're using Express and 'search' is a query parameter

        let users = [];
        if (search !== "") {
            const searchRegex = new RegExp(searchQuery, 'i'); // 'i' flag for case-insensitive search

            // Use $regex operator for searching
            users = await User.find({ name: { $regex: searchRegex } })
                .skip(skip)
                .limit(Number(perPage));
        } else {
            users = await User.find({})
                .skip(skip)
                .limit(Number(perPage));
        }

        res.status(200).json({
            data: users,
            currentPage: page,
            totalPages: Math.ceil(await User.countDocuments() / perPage),
        });
    } catch (error) {
        console.error("Error getting all users:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User deleted successfully" });
    }catch(error){
        console.error("Error deleting user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addCarouselImage = async (req, res) => {
    const { href, name } = req.body;
    const image = req.file;
    try {
        const newCarousel = await Carousel.create({
            image: `${process.env.DOMAIN}/carouselImage/${image.filename}`,
            href: href,
            name: name
        })
        if (!newCarousel) return res.status(400).json({ message: "Image not added" });
        const  cacheData = await Carousel.find({}).sort({_id:-1});//cache setting
        Cache.set("carousel", cacheData,cacheTime);
        res.status(200).json({ message: "Image added successfully" });
    } catch (error) {
        console.error("Error adding image:", error.message);
        res.status(500).json({ error: "Internal Server Error"});
    }
}
const getCarousel = async (req, res) => {
    try {
         const cachedData = Cache.get("carousel");//cache getting
       if (cachedData) {
       return res.status(200).json(cachedData);
       }
        const carousel = await Carousel.find({}).sort({_id:-1});
          Cache.set("carousel", carousel ,cacheTime);
        res.status(200).json(carousel);
    } catch (error) {
        console.error("Error adding image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const deleteCarousel = async (req, res) => {
    const { id } = req.body;
    try {
        const carousel = await Carousel.findByIdAndDelete(id);
        if (!carousel) return res.status(400).json({ message: "Image not deleted" });
        const  cacheData =  await Carousel.find({}).sort({_id:-1});
        Cache.set("carousel", cacheData ,cacheTime);
        res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error adding image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const addGalleryImage = async (req, res) => {
    try {
        const image = req.file;
        const { href, name, description } = req.body;
        const newGallery = await Gallery.create({
            image: `${process.env.DOMAIN}/galleryImage/${image.filename}`,
            href: href,
            name: name,
            description: description
        })
        if (!newGallery) return res.status(400).json({ message: "Image not added" });
        const cacheDate = await Gallery.find({}).sort({_id:-1});
        Cache.set("gallery", cacheDate, cacheTime);
        res.status(200).json({ message: "Image added successfully" });
    } catch (error) {
        console.error("Error adding image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getGallery = async (req, res) => {
    try {
        const cacheDate = Cache.get("gallery");
        if (cacheDate){
            return res.status(200).json(cacheDate);
        }
        const gallery = await Gallery.find({}).sort({_id:-1});
        Cache.set("gallery", gallery, cacheTime)
        res.status(200).json(gallery);
    } catch (error) {
        console.error("Error adding image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteGallery = async (req, res) => {
    const { id } = req.body;
    try {
        const gallery = await Gallery.findByIdAndDelete(id);
        if (!gallery) return res.status(400).json({ message: "Image not deleted" });
        const cacheDate = await Carousel.find({}).sort({_id:-1})
        Cache.set("gallery", cacheDate, cacheTime)
        res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error adding image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
//ads
const addAdsImage = async (req, res) => {
    try {
        const image = req.file;
        const { href, name, description } = req.body;
        const newAds = await Ads.create({
            image: `${process.env.DOMAIN}/adsImage/${image.filename}`,
            href: href,
            name: name,
            description: description
        })
        if (!newAds) return res.status(400).json({ message: "Image not added" });
        const cacheDate = await Ads.find({}).sort({_id:-1});
        Cache.set("ads", cacheDate, cacheTime)
        res.status(200).json({ message: "Image added successfully" });
    } catch (error) {
        console.error("Error adding image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


const getAds = async(req,res)=>{
    try {
        const cacheDate = Cache.get("ads")
        if (cacheDate){
            return res.status(200).json(cacheDate)
        }
        const ads = await Ads.find({}).set({_id:-1});
        Cache.set("ads",ads,cacheTime)
        res.status(200).json(ads);
    } catch (error) {
        console.error("Error adding image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const deleteAds = async (req, res) => {
    const { id } = req.body;
    try {
        const ads = await Ads.findByIdAndDelete(id);
        if (!ads) return res.status(400).json({ message: "Image not deleted" });
        const cacheDate = await Ads.find({}).sort({_id:-1});
        Cache.set("ads",cacheDate, cacheTime)
        res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error adding image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
//offers
const addOfferImage = async (req, res) => {
    try {
        const image = req.file;
        const { href, name, description } = req.body;
        const newOffer = await Offer.create({
            image: `${process.env.DOMAIN}/offerImage/${image.filename}`,
            href: href,
            name: name,
            description
        })
        if (!newOffer) return res.status(400).json({ message: "Image not added" });
        const cacheDate = await Offer.find({}).sort({_id:-1});
        Cache.set("offer", cacheDate, cacheTime);
        res.status(200).json({ message: "Image added successfully" });
    } catch (error) {
        console.error("Error adding Image:", error.message)
        res.status(500).json({ message: "Internal Server Error" })

    }
}
const getOffer = async (req, res) => {
    try {
        const cacheDate = Cache.get("offer")
        if(cacheDate){
            return res.status(200).json(cacheDate)
        }
        const offer = await Offer.find({}).sort({_id:-1});
        Cache.set("offer",offer,cacheTime)
        res.status(200).json(offer);
    } catch (error) {
        console.error("Error adding image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const deleteOffer = async (req, res) => {
    const { id } = req.body;
    try {
        const offer = await Offer.findByIdAndDelete(id);
        if (!offer) return res.status(400).json({ message: "Image not deleted" });
        Cache.set(offer, cacheDate, cacheTime);
        res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error adding image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
async function sendNotificationsToAllDevices(req, res) {
    try {
        const { title, url } = req.body;
        const imageObj = req.file;

        // Retrieve all tokens from the Notification model
        const allTokens = await Notification.find().distinct('token');
        if (!allTokens) {
            throw new Error('No tokens found');
        }
        
        // Build the payload
        const payload = {
            registration_ids: allTokens,
            notification: {
                body: title,
                title: "Avard Kuda",
                android_channel_id: "intuc"
            },
            data: {
                url: url,
            },
        };

        // Add image property to data if imageObj exists
        if (imageObj) {
            payload.notification.image = `${process.env.DOMAIN}/OneImage/${imageObj.filename}`;
        }

        console.log(JSON.stringify(payload));

        const result = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await result.json();

        // Check for errors in the HTTP response
        if (!result.ok) {
            throw new Error(`FCM request failed with status ${result.status}: ${data}`);
        }

        const date = new Date().toString().trim("T");

        // Use Promise.all to await both the fetch and the creation of NotificationList concurrently
        await Promise.all([
            NotificationList.create({ title: title, image: imageObj ? `${process.env.DOMAIN}/OneImage/${imageObj.filename}` : null, url: url, date: date }),
            res.status(200).json({ message: 'Notification sent successfully', data }),
        ]);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const getNotifications = async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skipIndex = (page - 1) * limit;

    try {
        const notifications = await NotificationList.find()
            .sort({ _id: -1 }) // Sorting in descending order
            .limit(limit)
            .skip(skipIndex)
            .exec();

        res.status(200).json(notifications);
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const notification = await NotificationList.findOneAndDelete({_id:req.params.id});
        if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
        }
        
        res.status(200).json({ msg: "notification removed" });
    } catch (error) {
        console.error("Error deleting notification:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
module.exports = {
    adminLogin,
    adminRegister,
    protected,
    getUser,
    getAllUsers,
    deleteUser,
    addCarouselImage,
    getCarousel,
    deleteCarousel,
    addGalleryImage,
    getGallery,
    deleteGallery,
    addAdsImage,
    getAds,
    deleteAds,
    addOfferImage,
    getOffer,
    deleteOffer,
    sentNoficationToAllUsers,
    getnotification,
    deleteNotification
}