"use server";

import { getServerSession } from "next-auth";
import prisma from "@repo/db/client";
import { authOptions } from "../auth";

export async function p2pTransfer(to: string, amount: number) {
  const session = await getServerSession(authOptions);
  const from = session?.user?.id;

  if (!from) {
    return {
      message: "Error while sending",
    };
  }

  const toUser = await prisma.user.findFirst({
    where: {
      number: to,
    },
  });

  if (!toUser) {
    return {
      message: "User not found",
    };
  }

  //
  await prisma.$transaction(async (tx) => {
    // Lock the balance row for user (FOR UPDATE)
    // Multiple parallel requests trying to modify the same resource
    await tx.$queryRaw`SELECT * FROM "balance" WHERE "userId" = ${Number(from)} FOR UPDATE`;

    // Another solution:
    // isolationLevel: "serializable" on transaction
    // If a transatio is under way, another read/write on the same row will throw an error
    const fromBalance = await tx.balance.findUnique({
      where: {
        userId: Number(from),
      },
    });

    if (!fromBalance || fromBalance.amount < amount) {
      return {
        message: "You have insufficient funds",
      };
    }

    await tx.balance.update({
      where: { userId: Number(from) },
      data: { amount: { decrement: amount } },
    });

    await tx.balance.update({
      where: { userId: toUser.id },
      data: {
        amount: {
          decrement: amount,
        },
      },
    });
  });
}
