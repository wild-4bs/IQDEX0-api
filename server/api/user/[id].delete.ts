import prisma from "~/lib/prisma";
import { deleteFromCloudinary } from "~/server/db/cloudinary";
import { deleteImage } from "~/server/db/image";
import { deletePdfFile } from "~/server/db/pdfFile";
import { deleteQrCode } from "~/server/db/qrCode";

export default defineEventHandler(async (event) => {
  const params = event.context.params;
  const id = params?.id;

  if (!id) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: "User ID is required.",
      })
    );
  }

  try {
    // تحقق من وجود المستخدم قبل الحذف
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        pdf_file: true,
        image: true,
        qr_code: true,
      },
    });

    if (!user) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: "User not found.",
        })
      );
    }
    await deleteFromCloudinary(user.image[0].public_id, "image");
    await deleteFromCloudinary(user.qr_code[0].public_id, "image");
    user.pdf_file.length > 0
      ? await deleteFromCloudinary(user.pdf_file[0].public_id, "file")
      : null;
    user.pdf_file.length > 0
      ? await prisma.pdfFile.delete({
          where: { id: user.pdf_file[0].id },
        })
      : null;
    await prisma.image.delete({
      where: { id: user.image[0].id },
    });
    await prisma.qrCode.delete({
      where: { id: user.qr_code[0].id },
    });

    await prisma.user.delete({
      where: { id },
    });

    return {
      message: "User has been deleted successfully.",
    };
  } catch (error: any) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: error.message,
      })
    );
  }
});
