var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema(
    {
        username: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        status: {type: String, enum:["user","member","admin"], default:"user", required: true},
        firstName: {type: String, required: true},
        lastName: {type: String}
    }
);

userSchema.virtual("url").get(function(){
    return "/users/" + this.username;
});

module.exports = mongoose.model("User", userSchema);