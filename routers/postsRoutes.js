import express from "express";
import * as Post from "../data/post.js";

const router = express.Router();

router.get("/", (req, res) => {
  const posts = Post.getPosts();
  res.json(posts);
});

router.get("/:id", (req, res) => {
  const post = Post.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

router.post("/", (req, res) => {
  const { userId, title, content } = req.body;
  if (!userId || !title || !content)
    return res.status(400).json({ error: "Missing fields" });

  const result = Post.savePost(userId, title, content);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put("/:id", (req, res) => {
  const { userId, title, content } = req.body;
  const id = req.params.id;
  const post = Post.getPostById(id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  Post.updatePost(id, userId || post.userId, title || post.title, content || post.content);
  res.json({ message: "Post updated" });
});


router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const post = Post.getPostById(id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  Post.deletePost(id);
  res.json({ message: "Post deleted" });
});

export default router;
