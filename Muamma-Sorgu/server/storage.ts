import { users, questions, type User, type InsertUser, type Question, type InsertQuestion } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getQuestions(status?: "pending" | "approved" | "rejected"): Promise<Question[]>;
  getAllQuestions(): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestionStatus(id: number, status: "pending" | "approved" | "rejected"): Promise<Question | undefined>;
  deleteQuestion(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getQuestions(status?: "pending" | "approved" | "rejected"): Promise<Question[]> {
    if (status) {
      return await db.select().from(questions).where(eq(questions.status, status)).orderBy(desc(questions.createdAt));
    }
    return await db.select().from(questions).orderBy(desc(questions.createdAt));
  }

  async getAllQuestions(): Promise<Question[]> {
    return await db.select().from(questions).orderBy(desc(questions.createdAt));
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db.insert(questions).values(insertQuestion).returning();
    return question;
  }

  async updateQuestionStatus(id: number, status: "pending" | "approved" | "rejected"): Promise<Question | undefined> {
    const [updated] = await db.update(questions).set({ status }).where(eq(questions.id, id)).returning();
    return updated;
  }

  async deleteQuestion(id: number): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }
}

export const storage = new DatabaseStorage();
