
import { prisma } from "./lib/prisma";

async function main() {
    try {
        console.log("Connecting to DB...");
        const count = await prisma.user.count();
        console.log(`User count: ${count}`);
        const users = await prisma.user.findMany({ take: 1 });
        console.log("First user:", users[0]);
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
