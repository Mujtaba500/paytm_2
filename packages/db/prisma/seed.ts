import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { number: "111111" },
    update: {},
    create: {
      number: "111111",
      password: await bcrypt.hash("alice", 10),
      name: "alice",
      Balance: {
        create: {
          amount: 20000,
          locked: 0,
        },
      },
      onRampTransaction: {
        create: {
          startTime: new Date(),
          status: "success",
          amount: 20000,
          token: "token_1",
          provider: "Meezan Bank",
        },
      },
    },
  });

  const bob = await prisma.user.upsert({
    where: { number: "111112" },
    update: {},
    create: {
      number: "111112",
      password: await bcrypt.hash("bob", 10),
      name: "bob",
      Balance: {
        create: {
          amount: 10000,
          locked: 0,
        },
      },
      onRampTransaction: {
        create: {
          startTime: new Date(),
          status: "failure",
          amount: 25000,
          token: "token_2",
          provider: "Askari Bank",
        },
      },
    },
  });

  console.log(alice, bob);
}

main().then(async () => {
  await prisma.$disconnect();
});
