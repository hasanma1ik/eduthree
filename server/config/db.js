const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(
      `Connected To MongoDB DATABASE ${mongoose.connection.host}`.bgCyan.white
    );
    
  } catch (error) {
    console.log(`error in connection DB ${error}`.bgRed.white);
  }
};

module.exports = connectDB;



// mongodb+srv://hasanmalik7:Chelseafc7551@cluster7.nkm984z.mongodb.net/react-native
