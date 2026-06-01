const mongoose=require('mongoose')

const blacklistTokenSchema = new mongoose.Schema({
    token:{
        type:String,
        required:[true, "token is requied to be in blacklist"]
    }
},{
    timestamps: true  //when token gets blacklisted
})

const tokenBlacklistModel = mongoose.model("blacklistTokens",blacklistTokenSchema)

module.exports=tokenBlacklistModel