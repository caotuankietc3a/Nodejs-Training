const {Schema, model} = require('mongoose');

const orderSchema = new Schema({
   items: [{
      productId: {
         type: Schema.Types.ObjectId,
         required: true,
         ref: "Product"
      },
      quantity: {
         type: Number,
         required: true
      }
   }],
   userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
   }
});

orderSchema.methods.addOrder = async function (user) {
   await user.updateOne({$set: {"cart.items": []}});
   return await this.save();
}

module.exports = model("Order", orderSchema);
