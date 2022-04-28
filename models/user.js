const {Schema, model} = require('mongoose');
const userSchema = new Schema({
   name: {
      type: String,
      required: true
   },
   email: {
      type: String,
      required: true
   },
   password: {
      type: String,
      required: true
   },
   resetToken: String,
   resetTokenExpiration: Date,
   cart: {
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
      }]
   }
});

userSchema.methods.addToCArt = async function (product) {
   // Becareful of Typeof product._id and pro.productId !!! Objects do not compare in js.
   try {
      const productsInCart = this.cart.items.findIndex(pro => product._id.toString() === pro.productId.toString());
      let updatedCart = [...this.cart.items];
      if (productsInCart !== -1) {
         updatedCart[productsInCart].quantity += 1;
      } else {
         updatedCart.push({
            productId: product._id,
            quantity: 1
         });
      }

      this.cart.items = updatedCart;
      return await this.save();
   } catch (err) {
      console.error(err);
   }
}

userSchema.methods.deleteFromCart = async function (productId) {
   try {
      return await this.updateOne({
         $pull: {
            "cart.items": {"productId": productId}
         }
      });
   } catch (err) {
      console.error(err);
   }
}

module.exports = model("User", userSchema);
