import axios from "axios";
import { getPdfByUserId } from "@/server/db/pdfFile";
import { getUserById } from "@/server/db/user";
import nodemailer from "nodemailer";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { user_id } = body;
    if (!user_id) {
      return sendError(
        event,
        createError({
          statusCode: 401,
          statusMessage: "Invalid params!",
        })
      );
    }

    const user = await getUserById(user_id);
    if (!user) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: "User not found!",
        })
      );
    }
    const pdfFile = await getPdfByUserId(user_id);
    if (!pdfFile) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: "Pdf file not found!",
        })
      );
    }

    const pdfResponse = await axios.get(pdfFile.url, {
      responseType: "arraybuffer",
    });

    const pdfBuffer = Buffer.from(pdfResponse.data, "binary");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "amer11wild@gmail.com",
        pass: "brba uudy eokf foeh",
      },
      pool: true,
      connectionTimeout: 2 * 60 * 1000,
      greetingTimeout: 30 * 1000,
      socketTimeout: 2 * 60 * 1000,
    });

    const mailOptions = {
      from: "amer11wild@gmail.com",
      to: user.email,
      subject: "Your PDF document",
      text: "Dear user, please find your PDF document attached.",
      attachments: [
        {
          filename: "document.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return { message: "Email sent successfully!" };
  } catch (error: any) {
    console.error("Error:", error);
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: `Failed to send email! Error: ${error.message}`,
      })
    );
  }
});
