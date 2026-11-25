import prisma from "../../config/prisma.js";

export const getPublicStatistics = async () => {
    return await prisma.statistic.findMany({
        where: {
            isPublished: true,
        },
        select: {
            id: true,
            value: true,
            label: true,
            sortOrder: true,
        },
        orderBy: [
            { sortOrder: "asc" },
            { createdAt: "asc" },
        ],
    });
};

export const getPublicStatisticById = async (id) => {
    return await prisma.statistic.findFirst({
        where: {
            id,
            isPublished: true,
        },
        select: {
            id: true,
            value: true,
            label: true,
            sortOrder: true,
        },
    });
};