require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/config/database");
const { initRedis } = require("./src/config/redis");

connectToDB();
initRedis();

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server runs on port ${process.env.PORT || 3000}`);
});