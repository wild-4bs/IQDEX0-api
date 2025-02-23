import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
    const params = event.context.params
    const id = params?.id
    try {
        const result = prisma.user.delete({
            where: { id }
        })
        return {
            
        }
    } catch (error: any) {

    }
})
