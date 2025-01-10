import "./dotenv.js";
import connectToMongo from "./src/db/db.js";
import app from "./src/app.js";

connectToMongo()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Example app listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Can't connect to mongoDB!!! ", error);
  });

//Problems

// while logging out refresh token can not be undefined

// app.on("error", (error) => {
//   console.log("EXPRESS CONNECTION ERROR:", error);
// });

//while updating a video problem happens when same video id updated more than one time

//delete all comments and likes when video is deleted
