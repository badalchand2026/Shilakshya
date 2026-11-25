import prisma from "../../config/prisma.js";

export const getPublicProcessSteps = async () => {
    return await prisma.processStep.findMany({
        where: {
            isPublished: true,
        },
        select: {
            id: true,
            title: true,
            description: true,
            position: true,
        },
        orderBy: [
            { position: "asc" },
            { createdAt: "asc" },
        ],
    });
};

export const getPublicProcessStepById = async (id) => {
    return await prisma.processStep.findFirst({
        where: {
            id,
            isPublished: true,
        },
        select: {
            id: true,
            title: true,
            description: true,
            position: true,
        },
    });
};