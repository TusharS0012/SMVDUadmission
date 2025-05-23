// seed.js
import { PrismaClient } from "./prisma/generated/prisma/index.js";
import fs from "fs";
import csv from "csv-parser";

const prisma = new PrismaClient();

async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

async function main() {
  console.log("🔄 Cleaning up existing data...");
  await prisma.allocatedSeat.deleteMany();
  await prisma.seatMatrix.deleteMany();
  await prisma.originalSeatMatrix.deleteMany();
  await prisma.studentApplication.deleteMany();
  await prisma.department.deleteMany();

  console.log("📥 Reading CSV files...");
  const departments = await readCSV("./data/departments.csv");
  const seatMatrices = await readCSV("./data/seatMatrix.csv");
  const studentApplications = await readCSV("./data/studentApplications.csv");

  console.log("🛠 Inserting Departments...");
  for (const dept of departments) {
    const id = dept.id.trim();
    const name = dept.name.trim();
    await prisma.department.create({
      data: { id, name },
    });
  }

  console.log("🪑 Inserting Seat Matrix & Original Seat Matrix...");
  for (const seat of seatMatrices) {
    const departmentId = seat.departmentId.trim();
    const category = seat.category.trim().toUpperCase();
    const totalSeats = parseInt(seat.totalSeats.trim(), 10) || 0;

    await prisma.seatMatrix.create({
      data: { departmentId, category, totalSeats },
    });
    await prisma.originalSeatMatrix.create({
      data: { departmentId, category, totalSeats },
    });
  }

  console.log("👨‍🎓 Validating Student Applications...");

  // Log any missing phone numbers
  studentApplications.forEach((entry, index) => {
    if (!entry.phoneNumber || entry.phoneNumber.trim() === "") {
      console.error(`❌ Missing phone number at index ${index}:`, entry);
    }
  });

  // Optional: halt execution if any phone number is missing
  const hasMissingPhone = studentApplications.some(
    (entry) => !entry.phoneNumber || entry.phoneNumber.trim() === ""
  );

  if (hasMissingPhone) {
    throw new Error(
      "❌ Validation failed: one or more entries are missing phone numbers."
    );
  }

  console.log("👨‍🎓 Inserting Student Applications...");

  await prisma.studentApplication.createMany({
    data: studentApplications.map((student) => {
      const t = (v) => (v?.trim() ? v.trim() : null);

      return {
        applicationNumber: student.applicationNumber.trim(),
        studentName: student.studentName.trim(),
        fatherMotherName: t(student.fatherMotherName),
        phoneNumber: t(student.phoneNumber),
        email: t(student.email),
        jeeCRL: parseInt(student.jeeCRL.trim(), 10),
        category: student.category.trim().toUpperCase(),
        categoryRank: student.categoryRank?.trim()
          ? parseInt(student.categoryRank.trim(), 10)
          : null,

        courseChoice1: t(student.courseChoice1),
        courseChoice2: t(student.courseChoice2),
        courseChoice3: t(student.courseChoice3),
        courseChoice4: t(student.courseChoice4),
        courseChoice5: t(student.courseChoice5),
        courseChoice6: t(student.courseChoice6),
        courseChoice7: t(student.courseChoice7),

        sportsMarks: student.sportsMarks?.trim()
          ? parseFloat(student.sportsMarks.trim())
          : null,

        createdAt: new Date(),
      };
    }),
  });

  console.log("✅ Seed data created from CSV!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
