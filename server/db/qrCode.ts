import QRcode from "qrcode";
import prisma from "~/lib/prisma";

export const generateQrCode = async (jsonData: Object) => {
  const qrCode = await QRcode.toDataURL(JSON.stringify(jsonData), {
    type: "image/png",
  });
  return qrCode;
};

export const createQrCode = async (data: any) => {
  const qr_code = await prisma.qrCode.create({ data })
  return qr_code
}