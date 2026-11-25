import prisma from "../../config/prisma.js";

const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// Create team member
export const createTeamMember = async (data) => {
    const teamMember = await prisma.teamMember.create({
        data: {
            name: data.name,
            position: data.position,
            bio: data.bio,
            skills: data.skills ?? [],
            education: data.education || null,
            imageUrl: data.imageUrl,
            imageAlt: data.imageAlt || null,
            socialLinks: data.socialLinks ?? undefined,
            sortOrder: data.sortOrder ?? 0,
            isPublished: data.isPublished ?? true,
        },
    });

    return teamMember;
};

// Get all team members (Admin)
export const getAllTeamMembers = async (query) => {
    const {
        page,
        limit,
        search,
        isPublished,
        sortBy,
        sortOrder,
    } = query;

    const where = {};

    if (search) {
        where.OR = [
            {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                position: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                bio: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    if (isPublished !== undefined) {
        where.isPublished = isPublished === "true";
    }

    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
        prisma.teamMember.findMany({
            where,
            orderBy: [
                {
                    [sortBy]: sortOrder,
                },
                {
                    createdAt: "desc",
                },
            ],
            skip,
            take: limit,
        }),

        prisma.teamMember.count({
            where,
        }),
    ]);

    return {
        items,
        pagination: {
            totalItems,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            limit,
            hasNextPage: page * limit < totalItems,
            hasPreviousPage: page > 1,
        },
    };
};

// Get team member by ID
export const getTeamMemberById = async (id) => {
    const teamMember = await prisma.teamMember.findUnique({
        where: { id },
    });

    if (!teamMember) {
        throw createError("Team member not found.", 404);
    }

    return teamMember;
};

// Update team member
export const updateTeamMember = async (id, data) => {
    const existingMember = await prisma.teamMember.findUnique({
        where: { id },
    });

    if (!existingMember) {
        throw createError("Team member not found.", 404);
    }

    const updatedMember = await prisma.teamMember.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.position !== undefined && { position: data.position }),
            ...(data.bio !== undefined && { bio: data.bio }),
            ...(data.skills !== undefined && { skills: data.skills }),
            ...(data.education !== undefined && { education: data.education }),
            ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
            ...(data.imageAlt !== undefined && { imageAlt: data.imageAlt }),
            ...(data.socialLinks !== undefined && {
                socialLinks: data.socialLinks,
            }),
            ...(data.sortOrder !== undefined && {
                sortOrder: data.sortOrder,
            }),
            ...(data.isPublished !== undefined && {
                isPublished: data.isPublished,
            }),
        },
    });

    return {
        updatedMember,
        oldImageUrl:
            data.imageUrl && data.imageUrl !== existingMember.imageUrl
                ? existingMember.imageUrl
                : null,
    };
};

// Update publish status
export const updateTeamMemberStatus = async (id, isPublished) => {
    const existingMember = await prisma.teamMember.findUnique({
        where: { id },
    });

    if (!existingMember) {
        throw createError("Team member not found.", 404);
    }

    return prisma.teamMember.update({
        where: { id },
        data: { isPublished },
    });
};

// Delete team member
export const deleteTeamMember = async (id) => {
    const existingMember = await prisma.teamMember.findUnique({
        where: { id },
    });

    if (!existingMember) {
        throw createError("Team member not found.", 404);
    }

    await prisma.teamMember.delete({
        where: { id },
    });

    return {
        id: existingMember.id,
        imageUrl: existingMember.imageUrl,
    };
};
