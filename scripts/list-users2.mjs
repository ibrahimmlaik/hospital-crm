import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const users = await p.user.findMany({
    select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
    }
});

console.log('=== ALL USERS IN DATABASE ===');
console.log(`Total: ${users.length} account(s)\n`);

for (const u of users) {
    console.log(`Name:   ${u.name}`);
    console.log(`Email:  ${u.email}`);
    console.log(`Role:   ${u.role}`);
    console.log(`Status: ${u.status}`);
    console.log(`ID:     ${u.id}`);
    console.log('---');
}

await p.$disconnect();
