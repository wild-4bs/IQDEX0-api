import QRcode from "qrcode";
import prisma from "~/lib/prisma";
import { deleteFromCloudinary } from "./cloudinary";

export const generateQrCode = async (jsonData: Object) => {
  const qrCode = await QRcode.toDataURL(JSON.stringify(jsonData), {
    type: "image/png",
  });
  return qrCode;
};

export const createQrCode = async (data: any) => {
  const qr_code = await prisma.qrCode.create({ data });
  return qr_code;
};

export const deleteQrCode = async (id: any) => {
  try {
    const qr_code = await prisma.qrCode.findFirst({ where: { user_id: id } });
    const cldResult: any = await deleteFromCloudinary(
      qr_code?.public_id as string,
      "image"
    );
    const result = await prisma.qrCode.delete({
      where: {
        id,
      },
    });
    return { result, cldResult };
  } catch (error: any) {
    throw Error(error.statusMessage);
  }
};
