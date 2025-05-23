import {PrismaClient} from './prisma/generated/prisma/index.js';
const prisma = new PrismaClient();

async function checkSeatsRemaining() {
    const seats = await prisma.seatMatrix.findMany();
    for (const seat of seats) {
        if (seat.totalSeats > 0) {
            console.log(`Remaining seats for ${seat.category}: ${seat.totalSeats}`);
            return true;
        }
    }
    return false;
}

export { checkSeatsRemaining };