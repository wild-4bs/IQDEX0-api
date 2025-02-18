import prisma from "~/lib/prisma"

export const createImage = async (data: any) => {
    const image = await prisma.image.create({ data })
    return image
}