
import prisma from "../../config/prisma.js";

// Get all published team members
export const getPublicTeamMembers = async () => {
    const teamMembers = await prisma.teamMember.findMany({
        where: {
            isPublished: true,
        },

        select: {
            id: true,
            name: true,
            position: true,
            bio: true,
            skills: true,
            education: true,
            imageUrl: true,
            imageAlt: true,
            socialLinks: true,
            sortOrder: true,
        },

        orderBy: [
            {
                sortOrder: "asc",
            },
            {
                createdAt: "desc",
            },
        ],
    });

    return teamMembers;
};

// Get one published team member by ID
export const getPublicTeamMemberById = async (id) => {
    const teamMember = await prisma.teamMember.findFirst({
        where: {
            id,
            isPublished: true,
        },

        select: {
            id: true,
            name: true,
            position: true,
            bio: true,
            skills: true,
            education: true,
            imageUrl: true,
            imageAlt: true,
            socialLinks: true,
            sortOrder: true,
        },
    });

    if (!teamMember) {
        const error = new Error("Team member not found.");
        error.statusCode = 404;
        throw error;
    }

    return teamMember;
};
