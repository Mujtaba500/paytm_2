"use server";

import prisma from "@repo/db/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export const startTransaction = async (bank: string, amount: number) => {
  try {
    const session = await getServerSession(authOptions);

    // check if user exists
    if (!session?.user || !session?.user.id) {
      return {
        message: "UnAuthorized",
      };
    }

    const token = (Math.random() * 1000).toString();

    const transaction = await prisma.onRampTransaction.create({
      data: {
        userId: Number(session?.user?.id),
        token: token,
        provider: bank,
        amount: amount,
        status: "processing",
        startTime: new Date(),
      },
    });

    return {
      message: "transaction started",
      data: transaction,
    };
  } catch (error: any) {
    console.log(error.message);
    return {
      message: "Internal Server Error",
    };
  }
};
