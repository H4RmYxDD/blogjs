import express from "express";
import cors from "cors";
import postRoutes from "./routers/postsRoutes.js";
import userRoutes from "./routers/usersRoutes.js";

const PORT = 3000;
const app = express();

app.use(express.json());
app.use(cors());

app.use("/posts", postRoutes);
app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
