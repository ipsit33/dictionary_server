const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true,
        trim: true
    },
    bookmarks: [
        {
            word: {
                type: String
            },
            def: {
                type: Array
            },
            syns: {
                type: Array
            },
            ants: {
                type: Array
            }
        }
    ],
    messages:[
        {
            name:{
                type: String,
                required: true
            },
            email:{
                type: String,
                required: true
            },
            message:{
                type: String,
                required: true
            }
        }
    ],
    tokens : [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
},
{
    timestamps: true
})

// Hashing the password
userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,10);
    }
    next();
});

// generating auth token
userSchema.methods.generateAuthToken = async function(){
    try{
        let token = jwt.sign({_id : this._id}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token: token});
        await this.save();
        return token;
    }catch(err){
        console.log(err);
    }
};

// Storing the bookmark data
userSchema.methods.addBookmark = async function (word,def,syns,ants) {
    try{
        this.bookmarks = this.bookmarks.concat({word,def,syns,ants});
        await this.save();
        return this.bookmarks;
    }catch (err){
        console.log(err);
    }
}

//storing contact messages of footer
userSchema.methods.addMessage = async function (name,email,message){
    try{
        this.messages = this.messages.concat({name,email,message});
        await this.save();
        return this.messages;
    } catch(error){
        console.log(error);
    }
}

// creating collection in atlas
const User = mongoose.model('users',userSchema);
module.exports = User;