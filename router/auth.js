const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();    
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');

require('../db/conn');
const User = require('../model/UserSchema');

router.get('/',(req,res) =>{
    res.send('Hello world from server router js');
});


//using promises
// router.post('/register',(req,res) => {

//     const {name, email, pass} = req.body;

//     if(!name || !email || !pass){
//         return res.status(422).json({error: "Please fill the fields properly"});
//     }

//     User.findOne({email: email}).
//     then((userExist) => {
//         if(userExist){
//             return res.status(422).json({error: "User already exists"});
//         }

//         const user = new User({name, email, pass});
//         user.save().then(() =>{
//             res.status(201).json({message: "User registered successfully"});
//         }).catch(err => res.status(500).json({error: "Failed to registered"}));
//     }).catch((err) => {console.log(err);});


//     // console.log(name);  //gets all the data that user posts
//     // res.json({message: req.body});
// });


// Async-Await conversion for registration
router.post('/register', async (req,res) => {

    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.status(422).json({error: "Please fill the fields properly"});
    }

    try{
        const userExist = await User.findOne({email: email}); 

        if(userExist){
            return res.status(422).json({error: "User already exists"});
        }

        const user = new User({name, email, password});
        
        await user.save();

        return res.status(201).json({message: "User registered sucessfully "});

    }catch (err){
        console.log(err);
    }
    
});

// login route
router.post('/login',async (req,res) => {
    try{
        let token;
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(422).json({error: "Please fill in the fields"});
        }

        // To check whether data is present in the database or not
        const userLogin = await User.findOne({email: email});

        if(userLogin){
            // Compare the password with the stored password
            const isMatch = await bcrypt.compare(password, userLogin.password);

    
            token = await userLogin.generateAuthToken();
            // console.log(token); 

            res.cookie("jwtoken",token,{
                expires: new Date(Date.now() + 25892000000),
                httpOnly: true
            });
            

            if(!isMatch){
                return res.status(400).json({error: "Invalid Credentials !!"});
            }else{
                const token = jwt.sign({ userId: userLogin._id }, process.env.SECRET_KEY);
                return res.json({message: "User Logged in Successfully",token});
            }
        }else{
            return res.status(400).json({error: "Invalid Credentials !!"});
        }
    }catch (err){
        console.log(err);
    }
});

// Navbar email
router.get('/nav', authenticate ,(req,res) =>{
    res.send(req.rootUser);
});

//Contact page
router.get('/contactdata',authenticate,(req,res) => {
    res.send(req.rootUser);
});

// Add Bookmark of each user to atlas

router.post('/book',authenticate,async (req,res) => {
    try{
        const {word,def,syns,ants}=req.body;

        if(!word && !def && !syns && !ants){
            return res.json({error: 'Data not received'});
        }

        const user = await User.findOne({_id: req.userID});
        if(user){
            const userMark = await user.addBookmark(word,def,syns,ants) ;

            await user.save();

            res.status(201).json({message: "Bookmark added successfully"}); 
        } 
    }catch (er) {
        console.log(er);
    }
});


// Show bookmark page data
router.get('/savedwords', authenticate ,(req,res) =>{
    res.send(req.bookmark);
});

// Delete a bookmark

router.delete('/deletebook/:bookmarkId', authenticate, async (req, res) => {
    try {
      const bookmarkId = req.params.bookmarkId;
      const user = req.rootUser;
  
      // Find the user by ID and update the bookmarks array
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { bookmarks: { _id: bookmarkId } } },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: "Bookmark not found" });
      }
  
      return res.status(200).json({ message: "Bookmark deleted successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Logout and remove cookies
  router.get('/logout' ,(req,res) =>{
    res.clearCookie('jwtoken');
    res.status(200).send('User Logout');
});
  
// send contact data
router.post('/contact',authenticate, async (req,res) => {
    try{
        const {name,email,message}=req.body;
        if(!name || !email || !message){
            return res.json({error: "please fill the contact fields"});
        }

        const userContact = await User.findOne({_id: req.userID});
        if (userContact){

            const userMessage = await userContact.addMessage(name,email,message);
            await userContact.save();

            res.status(201).json({message: "Message saved successfully"});
        }
    } catch(e){
        console.log(e);
    }
});
  

module.exports = router;