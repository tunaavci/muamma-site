import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth } from "./auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const { hashPassword } = setupAuth(app);

  // Seed Admin User
  const admin = await storage.getUserByUsername("admin");
  if (!admin) {
    const hashedPassword = await hashPassword("admin123");
    await storage.createUser({ username: "admin", password: hashedPassword });
    console.log("Admin user seeded: admin / admin123");
  }

  // Auth Routes
  app.post(api.auth.login.path, (req, res, next) => {
    // Basic validation before passport
    const result = api.auth.login.input.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }
    next();
  }, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.status(200).json({ message: "Logged in successfully" });
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Questions Routes

  // Public: List approved questions
  app.get(api.questions.listPublic.path, async (req, res) => {
    const questions = await storage.getQuestions("approved");
    res.json(questions);
  });

  // Admin: List all questions
  app.get(api.questions.listAll.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const questions = await storage.getAllQuestions();
    res.json(questions);
  });

  // Public: Create question
  app.post(api.questions.create.path, async (req, res) => {
    try {
      const input = api.questions.create.input.parse(req.body);
      const question = await storage.createQuestion(input);
      res.status(201).json(question);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Admin: Update status
  app.patch(api.questions.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!["pending", "approved", "rejected"].includes(status)) {
       return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await storage.updateQuestionStatus(id, status);
    if (!updated) return res.status(404).json({ message: "Question not found" });
    res.json(updated);
  });

  // Admin: Delete question
  app.delete(api.questions.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const id = parseInt(req.params.id);
    await storage.deleteQuestion(id);
    res.status(204).end();
  });
  
  // Need to import passport here to use it in closure, but better to just use req.isAuthenticated()
  // Note: Passport is attached to req by the middleware setup in setupAuth

  return httpServer;
}

import passport from "passport";
