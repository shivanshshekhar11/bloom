var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema(
    {
        title: {type: String, required: true},
        content: {type: String, required: true},
        author: {type: Schema.Types.ObjectId, ref: "User", required: true},
        time: {type: Date, default: Date.now},
    }
);

postSchema.virtual("url").get(function(){
    return "/posts/" + this._id;
});

module.exports = mongoose.model("Post", postSchema);