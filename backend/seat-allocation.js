import { PrismaClient } from "./prisma/generated/prisma/index.js";

const prisma = new PrismaClient();

/**
 * Generic allocation function for any category and round number.
 *
 * @param {string} category
 * @param {number} roundNumber
 */
async function allocateSeats({ category, roundNumber }) {
  console.log(
    `\n📢 Starting allocation for Category: ${category}, Round: ${roundNumber}`
  );

  // 1) Fetch students
  const students = await prisma.studentApplication.findMany({
    where: { category },
    orderBy: { categoryRank: "asc" },
  });
  console.log(`Found ${students.length} ${category} students.`);

  // 2) Fetch seat matrix including department relation
  const seatMatrix = await prisma.seatMatrix.findMany({
    where: { category, totalSeats: { gt: 0 } },
    include: { department: true },
  });

  // Build a map: deptId -> { seatsLeft, matrixId }
  const seatMap = new Map();
  seatMatrix.forEach((seat) => {
    seatMap.set(seat.departmentId, {
      seatsLeft: seat.totalSeats,
      matrixId: seat.id,
    });
  });

  // 3) Allocate per student
  for (const student of students) {
    const choices = [
      student.courseChoice1,
      student.courseChoice2,
      student.courseChoice3,
      student.courseChoice4,
      student.courseChoice5,
      student.courseChoice6,
      student.courseChoice7,
    ]
      .filter(Boolean)
      .map((c) => c.trim().toLowerCase());

    const existing = await prisma.allocatedSeat.findFirst({
      where: { studentId: student.applicationNumber },
    });

    let allocated = false;
    for (let i = 0; i < choices.length; i++) {
      const deptKey = choices[i];
      const seatInfo = seatMap.get(deptKey);

      if (!seatInfo) {
        console.warn(
          `⚠️ Choice "${deptKey}" not offered under ${category} for ${student.studentName}`
        );
        continue;
      }
      if (seatInfo.seatsLeft <= 0) {
        continue;
      }

      // If there's an existing allocation, free it if this choice is strictly better
      if (existing) {
        const prevKey = existing.allocatedCourse.trim().toLowerCase();
        const prevIndex = choices.indexOf(prevKey);

        if (prevIndex !== -1 && i >= prevIndex) {
          // New preference is same or worse than existing
          break;
        }

        // Delete the old allocation
        await prisma.allocatedSeat.delete({ where: { id: existing.id } });

        // Try to fetch the old seatInfo; if missing, log and skip freeing DB
        const oldSeatInfo = seatMap.get(prevKey);
        if (oldSeatInfo) {
          oldSeatInfo.seatsLeft++;
          await prisma.seatMatrix.update({
            where: { id: oldSeatInfo.matrixId },
            data: { totalSeats: { increment: 1 } },
          });
        } else {
          console.error(
            `❗️ Could not find seatMap entry for previous choice "${prevKey}"`
          );
        }
      }

      // Create the new allocation
      await prisma.allocatedSeat.create({
        data: {
          studentId: student.applicationNumber,
          allocatedCourse: deptKey,
          allocationRound: roundNumber,
          preferenceNumber: i + 1,
          allocatedAt: new Date(),
        },
      });

      // Decrement both local map and DB
      seatInfo.seatsLeft--;
      await prisma.seatMatrix.update({
        where: { id: seatInfo.matrixId },
        data: { totalSeats: { decrement: 1 } },
      });

      console.log(
        `✅ Allocated ${student.studentName} to ${deptKey} (Pref ${i + 1})`
      );
      allocated = true;
      break;
    }

    if (!allocated && !existing) {
      console.log(`⛔️ Could not allocate any seat for ${student.studentName}`);
    }
  }

  console.log(
    `✅ Allocation complete for Category: ${category}, Round: ${roundNumber}\n`
  );
}

export { allocateSeats };
