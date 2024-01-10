const router = require('express').Router();

router.get('/',async (req,res)=>{
    res.send("hi")
})
router.get('/hello',async (req,res)=>{
    res.send("hello")
})
module.exports = router;