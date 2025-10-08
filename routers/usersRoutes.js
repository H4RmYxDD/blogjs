import express from "express";
import * as User from "../data/user.js";
import bcrypt from "bcrypt";

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

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const user = User.getUserById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  User.deleteUser(id);
  res.json({ message: "User deleted" });
});

export default router;
