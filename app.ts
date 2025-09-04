import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool, testConnection } from "./database.ts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Test DB connection
testConnection();

async function main() {
  try {
    // Create students table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        age INT,
        grade VARCHAR(10)
      )
    `);
    console.log("✅ Students table ready.");

    // Insert dummy data (only once)
    await pool.query(
      `INSERT INTO students (name, age, grade) VALUES ?`,
      [
        [
          ["Alice", 20, "A"],
          ["Bob", 22, "B"],
          ["Charlie", 21, "A"],
        ],
      ]
    );
    console.log("✅ Dummy data inserted.");

    // Fetch students
    const [rows] = await pool.query("SELECT * FROM students");
    console.log("📚 Student Records:", rows);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

main();

// ---------------- API Routes ----------------

// Get all students
app.get("/api/students", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM students");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Server error");
  }
});

// Middleware for auth
function validate(req: Request, res: Response, next: NextFunction) {
  if (req.headers.authorization !== process.env.TOKEN) {
    return res.status(401).send("Unauthorized");
  }
  next();
}

// Create student
app.post("/api/students", async (req: Request, res: Response) => {
  try {
    const { name, age, grade } = req.body;
    const [result]: any = await pool.query(
      `INSERT INTO students (name, age, grade) VALUES (?, ?, ?)`,
      [name, age, grade]
    );
    res.status(201).json({ id: result.insertId, name, age, grade });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Server error");
  }
});

// Get single student
app.get("/api/students/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query(
      "SELECT * FROM students WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).send("Student not found");
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Server error");
  }
});

// Update student
app.put("/api/students/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, age, grade } = req.body;
    const [result]: any = await pool.query(
      `UPDATE students SET name = ?, age = ?, grade = ? WHERE id = ?`,
      [name, age, grade, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).send("Student not found");
    }
    res.send("Student updated successfully");
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Server error");
  }
});

// Delete student
app.delete("/api/students/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result]: any = await pool.query(
      `DELETE FROM students WHERE id = ?`,
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).send("Student not found");
    }
    res.send("Student deleted successfully");
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Server error");
  }
});

// Delete all students
app.delete("/api/students", async (req: Request, res: Response) => {
  try {
    const [result]: any = await pool.query(`DELETE FROM students`);
    res.send(`Deleted ${result.affectedRows} students`);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Server error");
  }
});

// ---------------- Server ----------------
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
