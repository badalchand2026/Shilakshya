import prisma from "../../config/prisma.js";

export const createProcessStep = async (data) => {
    return await prisma.processStep.create({
        data: {
            title: data.title,
            description: data.description,
            position: data.position ?? 0,
            isPublished: data.isPublished ?? false,
        },
    });
};

export const getAllProcessSteps = async ({
    page = 1,
    limit = 10,
    search,
    isPublished,
    sortBy = "position",
    sortOrder = "asc",
}) => {
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
        where.OR = [
            {
                title: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                description: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    if (typeof isPublished === "boolean") {
        where.isPublished = isPublished;
    }

    const [processSteps, total] = await prisma.$transaction([
        prisma.processStep.findMany({
            where,
            skip,
            take: limit,
            orderBy: [
                { [sortBy]: sortOrder },
                { createdAt: "desc" },
            ],
        }),
        prisma.processStep.count({ where }),
    ]);

    return {
        processSteps,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getProcessStepById = async (id) => {
    return await prisma.processStep.findUnique({
        where: { id },
    });
};

export const updateProcessStep = async (id, data) => {
    return await prisma.processStep.update({
        where: { id },
        data,
    });
};

export const updateProcessStepStatus = async (id, isPublished) => {
    return await prisma.processStep.update({
        where: { id },
        data: { isPublished },
    });
};

export const reorderProcessSteps = async (ids) => {
    return await prisma.$transaction(
        ids.map((id, index) =>
            prisma.processStep.update({
                where: { id },
                data: {
                    position: index + 1,
                },
            })
        )
    );
};

export const deleteProcessStep = async (id) => {
    return await prisma.processStep.delete({
        where: { id },
    });
};