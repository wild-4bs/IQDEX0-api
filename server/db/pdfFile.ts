import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPdfFile = async (data: any) => {
  const file = await prisma.pdfFile.create({ data });
  return file;
};

export const getPdfByUserId = async (id: any) => {
  const file = await prisma.pdfFile.findFirst({
    where: {
      user_id: id,
    },
  });
  return file;
};
