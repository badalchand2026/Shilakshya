import prisma from "../../config/prisma.js";

export const createStatistic = async (data) => {
    return await prisma.statistic.create({
        data: {
            value: data.value,
            label: data.label,
            sortOrder: data.sortOrder ?? 0,
            isPublished: data.isPublished ?? false,
        },
    });
};

export const getAllStatistics = async ({
    page = 1,
    limit = 10,
    search,
    isPublished,
    sortBy = "sortOrder",
    sortOrder = "asc",
}) => {
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
        where.OR = [
            {
                value: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                label: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    if (typeof isPublished === "boolean") {
        where.isPublished = isPublished;
    }

    const [statistics, total] = await prisma.$transaction([
        prisma.statistic.findMany({
            where,
            skip,
            take: limit,
            orderBy: [
                { [sortBy]: sortOrder },
                { createdAt: "desc" },
            ],
        }),
        prisma.statistic.count({ where }),
    ]);

    return {
        statistics,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getStatisticById = async (id) => {
    return await prisma.statistic.findUnique({
        where: { id },
    });
};

export const updateStatistic = async (id, data) => {
    return await prisma.statistic.update({
        where: { id },
        data,
    });
};

export const updateStatisticStatus = async (id, isPublished) => {
    return await prisma.statistic.update({
        where: { id },
        data: { isPublished },
    });
};

export const reorderStatistics = async (ids) => {
    return await prisma.$transaction(
        ids.map((id, index) =>
            prisma.statistic.update({
                where: { id },
                data: { sortOrder: index + 1 },
            })
        )
    );
};

export const deleteStatistic = async (id) => {
    return await prisma.statistic.delete({
        where: { id },
    });
};