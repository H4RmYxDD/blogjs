import express from "express";
import * as User from "../data/user.js";
import bcrypt from "bcrypt";
import jws from "jsonwebtoken";
import auth from "../util/authentication.js";

const router = express.Router();

router.get("/", (req, res) => {
  const users = User.getUsers();
  res.json(users);
});

router.get("/:id", (req, res) => {
  const user = User.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.post("/", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const existingUser = User.getUserByEmail(email);
  if (existingUser)
    return res.status(409).json({ error: "Email already registered" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = User.saveUser(name, email, hashedPassword);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const user = User.getUserById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  let { name, email, password } = req.body;

  if (!name) name = user.name;
  if (!email) email = user.email;
  if (password) {
    password = await bcrypt.hash(password, 10);
  } else {
    password = user.password;
  }

  User.updateUser(id, name, email, password);
  res.json({ message: "User updated" });
});

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: "invalid credentials" });
  }
  let user = User.getUserByEmail(email);
  if (user) {
    return res.status(400).json({ message: "email already exists" });
  }
  const salt = bcrypt.genSaltSync(12);
  const hashedPassword = bcrypt.hashSync(password, salt);
  const saved = User.saveUser(name, email, hashedPassword);
  user = User.getUserById(saved.lastInsertRowid);
  delete user.password;
  res.status(201).json(user);
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "invalid credentials" });
  }
  const user = User.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: "invalid credentials" });
  }
  if (!bcrypt.compareSync(password, user.password))
    return res.status(400).json({ message: "invalid creds" });
  const token = jwt.sign({ id: user.id, email: user.email }, "secret_key", {
    expiresIn: "30s",
  });
  res.json({ token: token });
});

router.get("/me", auth, (req, res) => {
  const user = User.getUserById(+req.userId);
  delete user.password;
  res.json(user);
});

router.patch("/:id", async (req, res) => {
  const id = +req.params.id;
  if (id != req.userId) {
    return res.status(400).json({ message: "invalid userid" });
  }
  const { name, email, password } = req.body;
  let user = User.getUserById(id);
  let hashedPassword;
  if (password) {
    const salt = bcrypt.genSaltSync();
    hashedPassword = bcrypt.hashSync(password, salt);
  }
  User.updateUser(
    id,
    name || user.name,
    email || user.email,
    hashedPassword || user.password
  );
  user = User.getUserById(id);
  delete user.password;
  res.status(200).json(user);
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const user = User.getUserById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  User.deleteUser(id);
  res.json({ message: "User deleted" });
});

export default router;
