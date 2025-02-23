import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, users_limit } = body
  if (!name && !users_limit) {
    return sendError(event, createError({ statusCode: 500, statusMessage: "Invalid params." }))
  }
  try {
    const data = {
      name, users_limit
    }
    const company = await prisma.company.create({ data })
    return {
      success: true,
      message: "Company have been created successfully.",
      company
    }
  } catch (error: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: error.statusMessage }))
  }
})
