import { getUserById } from "~/server/db/user";
import path from "path";
import fs from "fs/promises";
import { PDFDocument, rgb } from "pdf-lib";
import { uploadPdfFile } from "~/server/db/cloudinary";
import { createPdfFile } from "~/server/db/pdfFile";
import { useImageHelpers } from "~/composables/image";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { fetchImage, getContentType } = useImageHelpers()
  const { user_id } = body
  if (!user_id) {
    return sendError(
      event,
      createError({ statusCode: 401, statusMessage: "Invalid params!" })
    );
  }

  const user = await getUserById(user_id);
  if (!user) {
    return sendError(
      event,
      createError({ statusCode: 404, statusMessage: "User not found!" })
    );
  }

  try {
    const originFilePath = path.resolve("public/shahad.pdf");

    try {
      await fs.access(originFilePath);
    } catch {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: "Original PDF file not found!",
        })
      );
    }

    const existingPdfBytes = await fs.readFile(originFilePath);
    const imageBytes = await fetchImage(user.image[0].url);
    const qrCodeBytes = await fetchImage(user.qr_code[0].url);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const contentType = getContentType(user.image[0].url);

    const embeddedImage =
      contentType === "png"
        ? await pdfDoc.embedPng(imageBytes)
        : await pdfDoc.embedJpg(imageBytes);
    const embeddedQrCode = await pdfDoc.embedPng(qrCodeBytes);

    firstPage.drawImage(embeddedQrCode, {
      x: 220,
      y: 484,
      width: 60,
      height: 60,
    });
    firstPage.drawImage(embeddedImage, {
      x: 202,
      y: 667,
      width: 84,
      height: 85,
    });

    const fontSize = 15;
    firstPage.drawText(`${user.first_name} ${user.last_name}`, {
      x: 19,
      y: 637,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(user.position, {
      x: 19,
      y: 576,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(user.company_name, {
      x: 19,
      y: 517,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    const modifiedPdfBytes = await pdfDoc.save();

    const modifiedPdfPath = path.resolve(`public/modified-${user_id}.pdf`);
    await fs.writeFile(modifiedPdfPath, modifiedPdfBytes);

    const response = await uploadPdfFile(modifiedPdfPath, "pdf_files");

    await fs.unlink(modifiedPdfPath);

    const data = {
      url: response.secure_url,
      public_id: response.public_id,
      user_id,
    };

    const savedFile = await createPdfFile(data);

    return { message: "Your file generated.", savedFile };
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to modify, upload, or save file! ${error}`,
    });
  }
})
