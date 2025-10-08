import db from "./data.js";

db.prepare(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
)`).run();

export const getUsers = () => db.prepare("SELECT id, name, email FROM users").all();

export const getUserById = (id) =>
  db.prepare("SELECT id, name, email FROM users WHERE id = ?").get(id);

export const getUserByEmail = (email) =>
  db.prepare("SELECT * FROM users WHERE email = ?").get(email);

export const saveUser = (name, email, password) =>
  db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)")
    .run(name, email, password);

export const updateUser = (id, name, email, password) =>
  db.prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?")
    .run(name, email, password, id);

export const deleteUser = (id) =>
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
