import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize database
  const db = new Database("agro.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'customer',
      name TEXT,
      phone TEXT,
      location TEXT,
      otp TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );

    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      image_data TEXT,
      diagnosis TEXT,
      crop_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Seed initial users if they don't exist
  const adminEmail = "rupesh@rdgaro.com";
  const adminPass = "123456789";
  
  const adminExists = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
  if (!adminExists) {
    console.log("Seeding admin user...");
    db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)")
      .run(adminEmail, adminPass, "admin", "System Admin");
  } else {
    // Ensure admin has the correct password and role
    db.prepare("UPDATE users SET password = ?, role = 'admin' WHERE email = ?")
      .run(adminPass, adminEmail);
  }
  
  const farmer1Email = "farmer@rdagro.com";
  const farmer1Pass = "123456789";
  const farmer1Exists = db.prepare("SELECT id FROM users WHERE email = ?").get(farmer1Email);
  if (!farmer1Exists) {
    db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)")
      .run(farmer1Email, farmer1Pass, "farmer", "RD Farmer");
  } else {
    // Update password for existing farmer
    db.prepare("UPDATE users SET password = ?, role = 'farmer' WHERE email = ?").run(farmer1Pass, farmer1Email);
  }

  const farmer2Email = "farmer@example.com";
  const farmer2Pass = "farmer123";
  const farmer2Exists = db.prepare("SELECT id FROM users WHERE email = ?").get(farmer2Email);
  if (!farmer2Exists) {
    db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)")
      .run(farmer2Email, farmer2Pass, "farmer", "John Farmer");
  } else {
    // Ensure existing farmer has the correct role
    db.prepare("UPDATE users SET role = 'farmer' WHERE email = ?").run(farmer2Email);
  }

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "RDAGRO Backend is running" });
  });

  // Auth API
  app.post("/api/auth/register", (req, res) => {
    const { email, password, name, phone, location, otp } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (email, password, name, phone, location, otp, role) VALUES (?, ?, ?, ?, ?, ?, 'customer')")
        .run(email, password, name, phone, location, otp);
      const user = db.prepare("SELECT id, email, role, name, phone, location, otp FROM users WHERE id = ?")
        .get(info.lastInsertRowid);
      res.json(user);
    } catch (error: any) {
      if (error.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ error: "Email already exists" });
      } else {
        res.status(500).json({ error: "Registration failed" });
      }
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    try {
      // Fallback for hardcoded admin if DB is weird
      if (email === adminEmail && password === adminPass) {
        let user = db.prepare("SELECT id, email, role, name, phone, location FROM users WHERE email = ?").get(email) as any;
        if (!user) {
          // If for some reason the seed failed, create it now
          db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)")
            .run(adminEmail, adminPass, "admin", "System Admin");
          user = db.prepare("SELECT id, email, role, name, phone, location FROM users WHERE email = ?").get(email);
        }
        return res.json(user);
      }

      const user = db.prepare("SELECT id, email, role, name, phone, location FROM users WHERE email = ? AND password = ?")
        .get(email, password) as any;
      
      if (user) {
        db.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);
        res.json(user);
      } else {
        console.log("Invalid credentials for", email);
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Update Role API
  app.post("/api/auth/update-role", (req, res) => {
    const { userId, role } = req.body;
    try {
      db.prepare("UPDATE users SET role = ? WHERE id = ?")
        .run(role, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  // Update Profile API
  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { name, phone, location } = req.body;
    try {
      db.prepare("UPDATE users SET name = ?, phone = ?, location = ? WHERE id = ?")
        .run(name, phone, location, id);
      const user = db.prepare("SELECT id, email, role, name, phone, location FROM users WHERE id = ?")
        .get(id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  // Admin API: Update Credentials
  app.put("/api/admin/update-credentials", (req, res) => {
    const { id, email, password } = req.body;
    try {
      // Check if the user is actually an admin
      const user = db.prepare("SELECT role FROM users WHERE id = ?").get(id) as any;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      db.prepare("UPDATE users SET email = ?, password = ? WHERE id = ?")
        .run(email, password, id);
      
      const updatedUser = db.prepare("SELECT id, email, role, name, phone, location FROM users WHERE id = ?")
        .get(id);
      res.json(updatedUser);
    } catch (error: any) {
      if (error.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ error: "Email already exists" });
      } else {
        res.status(500).json({ error: "Update failed" });
      }
    }
  });

  // Example API: Get scans (filtered by user if not admin)
  app.get("/api/scans", (req, res) => {
    const { userId, role } = req.query;
    try {
      let scans;
      if (role === 'admin') {
        scans = db.prepare(`
          SELECT s.*, u.name as user_name 
          FROM scans s 
          JOIN users u ON s.user_id = u.id 
          ORDER BY s.created_at DESC
        `).all();
      } else {
        scans = db.prepare("SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 20")
          .all(userId);
      }
      res.json(scans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scans" });
    }
  });

  // Admin API: Get Stats
  app.get("/api/admin/stats", (req, res) => {
    try {
      const totalScans = db.prepare("SELECT COUNT(*) as count FROM scans").get() as any;
      const totalFarmers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'farmer'").get() as any;
      const totalCustomers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get() as any;
      const recentUsers = db.prepare("SELECT * FROM users WHERE role != 'admin' ORDER BY created_at DESC LIMIT 10").all();
      
      res.json({
        totalScans: totalScans.count,
        totalFarmers: totalFarmers.count,
        totalCustomers: totalCustomers.count,
        recentUsers
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Admin API: Get All Users
  app.get("/api/admin/users", (req, res) => {
    try {
      const users = db.prepare("SELECT id, email, name, phone, location, otp, created_at, last_login, role FROM users WHERE role != 'admin' ORDER BY created_at DESC").all();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Admin API: Get All Scans
  app.get("/api/admin/scans", (req, res) => {
    try {
      const scans = db.prepare(`
        SELECT s.*, u.email as user_email, u.name as user_name 
        FROM scans s 
        LEFT JOIN users u ON s.user_id = u.id 
        ORDER BY s.created_at DESC
      `).all();
      res.json(scans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scans" });
    }
  });

  // Example API: Save a scan
  app.post("/api/scans", (req, res) => {
    const { user_id, image_data, diagnosis, crop_type } = req.body;
    try {
      const info = db.prepare("INSERT INTO scans (user_id, image_data, diagnosis, crop_type) VALUES (?, ?, ?, ?)")
        .run(user_id, image_data, diagnosis, crop_type);
      res.json({ id: info.lastInsertRowid, success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save scan" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
