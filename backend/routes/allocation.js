const express = require("express");
const app = express();
const prisma = require("../prisma/prisma");

app.use(express.json());
app.get("/api/allotment/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const allotment = await prisma.allotment.findUnique({
      where: { userId: userId },
      include: {
        user: true,
        college: true,
      },
    });

    if (!allotment) {
      return res.status(404).json({ message: "No allotment found" });
    }

    res.json({
      name: allotment.user.name,
      email: allotment.user.email,
      course: allotment.courseName,
      college: allotment.college.name,
      round: allotment.round,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
