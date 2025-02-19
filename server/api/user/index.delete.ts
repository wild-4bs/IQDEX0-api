import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    // First, delete related images
    await prisma.image.deleteMany();

    // Then, delete related QR codes
    await prisma.qrCode.deleteMany();

    // Now, delete users (after related data is removed)
    const deletedUsers = await prisma.user.deleteMany();

    return {
      message: "Users and related data have been deleted successfully.",
      ok: true,
      deletedUsers
    };
  } catch (error: any) {
    if (error.statusMessage) {
      return sendError(event, createError({ statusCode: 500, statusMessage: error.statusMessage }));
    }
    return sendError(event, createError({ statusCode: 500, statusMessage: error.message }));
  }
});
