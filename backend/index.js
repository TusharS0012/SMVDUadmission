import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "./prisma/generated/prisma/index.js";
import { allocateSeats } from "./seat-allocation.js"; // your generic allocator

dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// -------------------------
// Student Authentication
// -------------------------
app.post("/api/register", async (req, res) => {
  const { name, email, phoneNumber } = req.body;

  if (!name || !email || !phoneNumber) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if email is already registered
    const existing = await prisma.user.findFirst({
      where: { email },
    });

    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    // Generate unique application number (e.g., 8-digit random number)
    let applicationNumber;
    let exists = true;
    while (exists) {
      applicationNumber = Math.floor(
        10000000 + Math.random() * 90000000
      ).toString();
      const existingApp = await prisma.studentApplication.findUnique({
        where: { applicationNumber },
      });
      exists = !!existingApp;
    }

    await prisma.user.create({
      data: {
        name: name,
        email,
        phoneNumber,
        applicationNumber,
      },
    });

    res.status(201).json({
      message: "Registration successful.",
      applicationNumber,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, applicationNumber } = req.body;
  if (!email || !applicationNumber) {
    return res
      .status(400)
      .json({ message: "Email and application number required." });
  }
  try {
    const student = await prisma.user.findUnique({
      where: { email },
    });
    if (!student || student.email !== email) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const token = jwt.sign(
      {
        applicationNumber: student.applicationNumber,
        email: student.email,
        role: "student",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.json({ token, applicationNumber: student.applicationNumber });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Verify student JWT
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided." });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || decoded.role !== "student") {
      return res.status(403).json({ message: "Failed to authenticate token." });
    }
    req.user = decoded;
    next();
  });
};

// -------------------------
// Student Endpoints
// -------------------------
// Get /api/profile/:applicationNumber
app.get("/api/profile/:applicationNumber", async (req, res) => {
  const { applicationNumber } = req.params;

  try {
    const student = await prisma.studentApplication.findUnique({
      where: { applicationNumber },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json(student);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});
// Update /api/profile/:applicationNumber
app.post("/api/profile/:applicationNumber", async (req, res) => {
  const { applicationNumber } = req.params;
  const data = req.body;

  try {
    const updated = await prisma.studentApplication.update({
      where: { applicationNumber },
      data: {
        studentName: data.studentName,
        fatherMotherName: data.fatherMotherName,
        phoneNumber: data.phoneNumber,
        jeeCRL: Number(data.jeeCRL),
        category: data.category,
        categoryRank: data.categoryRank ? Number(data.categoryRank) : null,
        courseChoice1: data.courseChoice1,
        courseChoice2: data.courseChoice2 || null,
        courseChoice3: data.courseChoice3 || null,
        courseChoice4: data.courseChoice4 || null,
        courseChoice5: data.courseChoice5 || null,
        courseChoice6: data.courseChoice6 || null,
        courseChoice7: data.courseChoice7 || null,
        sportsMarks: data.sportsMarks ? parseFloat(data.sportsMarks) : null,
      },
    });

    res.json({ message: "Profile updated successfully", data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile." });
  }
});

app.post("/api/seat-allotment", verifyToken, async (req, res) => {
  try {
    const userId = req.user.applicationNumber;
    console.log("Looking up seat for studentId:", userId);

    const seatAllotment = await prisma.allocatedSeat.findFirst({
      where: { studentId: userId },
      orderBy: { allocationRound: "desc" },
      include: { student: true },
    });

    if (!seatAllotment) {
      console.log("No seat allotment found for:", userId);
      return res.status(404).json({ message: "Seat allotment not found." });
    }

    res.json({
      candidateName: seatAllotment.student.studentName,
      round: seatAllotment.allocationRound,
      course: seatAllotment.allocatedCourse,
      preference: seatAllotment.preferenceNumber,
      status: seatAllotment.status,
      institute: "SMVDU",
    });
  } catch (err) {
    console.error("Error fetching seat allotment:", err);
    res
      .status(500)
      .json({ message: "An error occurred fetching seat allotment." });
  }
});

app.post("/api/seat-allotment/status", verifyToken, async (req, res) => {
  const userId = req.user.applicationNumber;
  const { status } = req.body;
  if (!["LOCK", "FLOAT"].includes(status)) {
    return res.status(400).json({ message: "Invalid decision." });
  }
  try {
    const latest = await prisma.allocatedSeat.findFirst({
      where: { studentId: userId },
      orderBy: { allocationRound: "desc" },
    });
    if (!latest)
      return res.status(404).json({ message: "No allocation to update." });
    if (latest.status !== "PENDING") {
      return res.status(400).json({ message: "Decision already submitted." });
    }
    await prisma.allocatedSeat.update({
      where: { id: latest.id },
      data: { status: status },
    });
    res.json({ message: `Seat ${status}ED successfully.` });
  } catch (err) {
    console.error("Error updating seat decision:", err);
    res.status(500).json({ message: "Failed to update decision." });
  }
});

// -------------------------
// Admin Authentication
// -------------------------
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    return res.json({ token });
  }
  res.status(401).json({ message: "Invalid admin credentials." });
});

// Verify admin JWT
const verifyAdminToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided." });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized." });
    }
    req.admin = decoded;
    next();
  });
};

// -------------------------
// Admin: Run Allocation Round
// -------------------------
app.post("/api/admin/allocate-round", verifyAdminToken, async (req, res) => {
  const { roundNumber } = req.body;
  if (typeof roundNumber !== "number" || roundNumber < 1) {
    return res.status(400).json({ message: "Invalid roundNumber." });
  }
  // Only category-level allocation now
  const categories = ["OBC", "EWS", "SC", "RBA", "RLAC", "ST", "GEN"]; // running GEN last to fill the remaining seats after all categories are allocated

  try {
    for (const category of categories) {
      await allocateSeats({ category, roundNumber });
    }
    res.json({ message: `Round ${roundNumber} allocation completed.` });
  } catch (err) {
    console.error("Admin allocation error:", err);
    res.status(500).json({ message: "Allocation failed." });
  } finally {
    await prisma.$disconnect();
  }
});

// -------------------------
// Start Server
// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server up on port: ${PORT}`);
});
