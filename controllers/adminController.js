const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../model/Admin");
const User = require("../model/User");
const Carousel = require("../model/Carousel");
const Gallery = require("../model/Gallery");
const Ads = require("../model/Ads");
const Offer = require("../model/Offer");
const Calender = require("../model/Calender");
const Notification = require("../model/Notification");
const NotificationList = require("../model/NotificationList");
const Directory = require("../model/Directory");
const serviceAccount = require("../firebase/firebase");
const jwtSecret = process.env.JWT_ADMIN_SECRET;
const Cache = require('../helpers/Cache');
const Feedback = require("../model/Feedback");
const Reason = require("../model/Reason");
const DailyQuote = require("../model/DailyQuote");
const Seminar = require("../model/Seminar");
const Career = require('../model/Career');
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
        const cacheData = await Gallery.find({}).sort({_id:-1});
        Cache.set("gallery", cacheData, cacheTime);
        res.status(200).json({ message: "Image added successfully" });
    } catch (error) {
        console.error("Error adding image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getGallery = async (req, res) => {
    try {
        const cacheData = Cache.get("gallery");
        if (cacheData){
            return res.status(200).json(cacheData);
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
        const cacheData = await Carousel.find({}).sort({_id:-1})
        Cache.set("gallery", cacheData, cacheTime)
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
        const cacheData = await Ads.find({}).sort({_id:-1});
        Cache.set("ads", cacheData, cacheTime)
        res.status(200).json({ message: "Image added successfully" });
    } catch (error) {
        console.error("Error adding image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


const getAds = async(req,res)=>{
    try {
        const cacheData = Cache.get("ads")
        if (cacheData){
            return res.status(200).json(cacheData)
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
        const cacheData = await Ads.find({}).sort({_id:-1});
        Cache.set("ads",cacheData, cacheTime)
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
        console.log(newOffer)
        if (!newOffer) return res.status(400).json({ message: "Image not added" });
        const cacheData = await Offer.find({}).sort({_id:-1});
        Cache.set("offer", cacheData, cacheTime);
        res.status(200).json({ message: "Image added successfully" });
    } catch (error) {
        console.error("Error adding Image:", error.message)
        res.status(500).json({ message: "Internal Server Error" })

    }
}
const getOffer = async (req, res) => {
    try {
        const cacheData = Cache.get("offer")
        if(cacheData){
            return res.status(200).json(cacheData)
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
        const  cacheData = await Offer.find({}).sort({_id:-1});
        Cache.set("offer", cacheData, cacheTime);
        res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error adding image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const  sentNotificationToAllUsers = async (req, res)=> {
    try {
        const { title, url } = req.body;
        const imageObj = req.file;

        // Retrieve all tokens from the Notification model
        const allTokens = await Notification.find().distinct('token');
        if (allTokens.length === 0) {
            throw new Error('No tokens found');
        }

        // Build the payload
        const payload = {
            registration_ids: allTokens,
            notification: {
                body: title,
                title: "Avard Kuda",
                android_channel_id: "avardkuda",
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

        res.status(200).json({data: notifications, currentPage: page, totalPages: Math.ceil(await NotificationList.countDocuments() / limit) });
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
const addCalenderEvent = async (req, res) => {
    try {
        const { title, description,date  } = req.body;
        console.log(req.body);
          req.body.image = req.file;
        let imageObj = req.body.image;
        if (!date || !title || !description) {
        return res
            .status(400)
            .json({ error: "Please provide all required fields." });
        }

        const calendar = await Calender.create({
        date,
        title,
        description,
        image: `${process.env.DOMAIN}/calendarImage/${imageObj.filename}`,
        })
        console.log(calendar);
        res.status(201).json(calendar);
    } catch (error) {
        console.error("Error adding calendar event:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getCalenderEvents = async (req, res) => {
   try {
       const date = req.query.date;
       console.log(typeof(date))
       const events = await Calender.find({date:date});
       res.status(200).json(events);

   } catch (error) {
     console.error("Error getting calendar events:", error.message);
     res.status(500).json({ error: "Internal Server Error" });
   } 
}
const deleteCalenderEvent = async (req, res) => {
    try {
        const calendar = await Calender.findOneAndDelete({_id:req.params.id});
        if (!calendar) {
        return res.status(404).json({ error: "Calendar not found" });
        }
        
        res.status(200).json({ msg: "calendar removed" });
    } catch (error) {
        console.error("Error getting calendar events:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getFeedback = async (req, res) => {
    try {
        const { page, perPage } = req.query;
        const skip = (page - 1) * perPage; // Calculate the skip value
        const feedback = await Feedback.find().skip(skip).limit(perPage);
        res.status(200).json({
            data: feedback,
            currentPage: page,
            totalPages: Math.ceil(await Feedback.countDocuments() / perPage),
        });
    } catch (error) {
        console.error("Error getting feedback:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteFeedback = async (req, res) => {
    try {
        const feedbackId = req.params.id; // Get the feedback ID from the request parameters
        const deletedFeedback = await Feedback.findByIdAndDelete(feedbackId);

        if (!deletedFeedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Error deleting feedback:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const getReason = async (req, res) => {
    try {
        const { page, perPage } = req.query;
        const skip = (page - 1) * perPage; // Calculate the skip value
        const reason = await Reason.find().skip(skip).limit(perPage);
        res.status(200).json(reason);
    } catch (error) {
        console.error("Error getting feedback:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const deleteReason = async (req, res) => {
    try {
        const reasonId = req.params.id; // Get the feedback ID from the request parameters
        const deletedReason = await Reason.findByIdAndDelete(reasonId);
        if(!deletedReason){
            return res.status(404).json({ error: 'Reason not found' });
        }
        res.status(200).json({message:"Reason deleted successfully"}); // No content (successful deletion)
    } catch (error) {
        console.error('Error deleting reason:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const addDirectory = async (req, res) => {
    try {
      const { name, email, phone, address ,category} = req.body;
      const directory = await Directory.create({
        name,
        email,
        phone,
        address,
        category
      });
      res.status(201).json(directory);
    } catch (error) {
      console.error("Error adding directory:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
      
  }
  const getDirectory = async (req, res) => {
    try {
      const directory = await Directory.find();
      res.status(200).json(directory);
    } catch (error) {
      console.error("Error getting directory:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  const deleteDirectory = async (req, res) => {
    try {
      const directory = await Directory.findByIdAndDelete(req.params.id);
      if (!directory) {
        return res.status(404).json({ error: "Directory not found" });
      }
      res.status(200).json({ message: "Directory deleted successfully" });
    } catch (error) {
      console.error("Error deleting directory:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  const addSeminar = async (req, res) => {
    try {
      const { subject, description, date, location,  link, seminarType } = req.body;
    
       let imageObj = req.file;
      if (!subject || !description || !date || !location || !link || !seminarType) {
        return res.status(400).json({ error: "Please provide all required fields." });
      }
      const seminar = await Seminar.create({
        subject,
        description,
        date,
        location,
        photo: `${process.env.DOMAIN}/seminarImage/${imageObj.filename}`,
        link,
        seminarType
      });
      res.status(201).json(seminar);
    } catch (error) {
       console.error("Error adding seminar:", error.message);
      res.status(500).json({ error: "Internal Server Error" }); 
    }
    }
    
    const getSeminar = async (req, res) => {
        try {
            const seminar = await Seminar.find();
            res.status(200).json(seminar);
        } catch (error) {
            console.error("Error getting seminar:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    
    const deleteSeminar = async (req, res) => {
        try {
            const seminar = await Seminar.findByIdAndDelete(req.params.id);
            if (!seminar) {
                return res.status(404).json({ error: "Seminar not found" });
            }
            res.status(200).json({ message: "Seminar deleted successfully" });
        }catch (error) {
            console.error("Error deleting seminar:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
  const addDailyQuote = async (req, res) => {
    try {
      const { quote, date, href } = req.body;
      const image = req.file;
      const dailyQuote = await DailyQuote.create({
        quote,
        date,
        href,
        image: `${process.env.DOMAIN}/quoteImage/${image.filename}`
      });
      res.status(200).json(dailyQuote);
    }catch(error){
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
  };
  const getDailyQuote = async (req, res) => {
    try {
      const dailyQuote = await DailyQuote.find();
      res.status(200).json(dailyQuote);
    }
    catch(error){
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
  }
  const getQuoteWithDate = async (req, res) => {
    try {
      const dailyQuote = await DailyQuote.find({ date: req.params.date });
      res.status(200).json(dailyQuote);
    }
    catch(error){
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
  }
  const deleteDailyQuote = async (req, res) => {
    try {
      const dailyQuote = await DailyQuote.findByIdAndDelete(req.params.id);
      if (!dailyQuote) {
        return res.status(404).json({ error: "DailyQuote not found" });
      }
      res.status(200).json({ message: "DailyQuote deleted successfully" });
    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  }
  const addCareer =async (req,res)=>{
    const { jobrole,description,location,package, phone,address} = req.body;
            req.body.image = req.file;
            let imgObj = req.body.image;
    try {
          const career = await Career.create({
           jobrole,
           description,
           location,
            package,
            phone,
            address, 
            image: `${process.env.DOMAIN}/careerImage/${imgObj.filename}`,
          })
          career.save();

          res.status(200).json(career);
    } catch (error) {
        res.status(500).json({error:"internal server error"});
    }
  }  
      const getCareer = async(req,res)=>{
        try {
            const career = await Career.find()
            res.status(200).json(career)
        } catch (error) {
            console.error("Error getting career:", error.message);
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
      const deleteCareer = async(req,res)=>{
        try {
            const career = await Career.findByIdAndDelete(req.params.id);
            if(!career){
              return res.status(500).json({ error: 'career not found' })
            }
            return res.status(200).json({ message: 'career deleted successfully' })
        } catch (error) {
            console.error("Error deleting career:", error.message);
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
    sentNotificationToAllUsers,
    getNotifications,
    deleteNotification,
    addCalenderEvent,
    getCalenderEvents,
    deleteCalenderEvent,
    getFeedback,
    deleteFeedback,
    getReason,
    deleteReason,
    addDirectory,
    getDirectory,
    deleteDirectory,
    addSeminar,
    getSeminar,
    deleteSeminar,
    addDailyQuote,
    getDailyQuote,
    getQuoteWithDate,
    deleteDailyQuote,
    addCareer, 
    getCareer,
    deleteCareer
}