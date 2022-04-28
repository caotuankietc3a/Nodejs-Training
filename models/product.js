const {Schema, model} = require('mongoose');

const productSchema = new Schema({
   title: {
      required: true,
      type: String
   },
   price: {
      required: true,
      type: Number
   },
   description: {
      required: true,
      type: String
   },
   imageUrl: {
      required: true,
      type: String
   },
   userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
   }
});

module.exports = model("Product", productSchema);
