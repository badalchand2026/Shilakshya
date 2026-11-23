
import prisma from "../../config/prisma.js";

// Create a new blog tag
export const createBlogTag = async (data) => {
    const existingName = await prisma.blogTag.findFirst({
        where: {
            name: {
                equals: data.name,
                mode: "insensitive",
            },
        },
    });

    if (existingName) {
        throw new Error("A blog tag with this name already exists.");
    }

    const existingSlug = await prisma.blogTag.findUnique({
        where: { slug: data.slug },
    });

    if (existingSlug) {
        throw new Error("A blog tag with this slug already exists.");
    }

    return await prisma.blogTag.create({
        data: {
            name: data.name,
            slug: data.slug,
        },
    });
};

// Retrieve all blog tags
export const getAllBlogTags = async () => {
    const tags = await prisma.blogTag.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            _count: {
                select: {
                    blogs: true,
                },
            },
        },
    });

    return {
        tags,
        totalTags: tags.length,
    };
};

// Update an existing blog tag
export const updateBlogTag = async (id, data) => {
    const existingTag = await prisma.blogTag.findUnique({
        where: { id },
    });

    if (!existingTag) {
        throw new Error("Blog tag not found.");
    }

    if (data.name) {
        const duplicateName = await prisma.blogTag.findFirst({
            where: {
                name: {
                    equals: data.name,
                    mode: "insensitive",
                },
                NOT: {
                    id,
                },
            },
        });

        if (duplicateName) {
            throw new Error("A blog tag with this name already exists.");
        }
    }

    if (data.slug) {
        const duplicateSlug = await prisma.blogTag.findFirst({
            where: {
                slug: data.slug,
                NOT: {
                    id,
                },
            },
        });

        if (duplicateSlug) {
            throw new Error("A blog tag with this slug already exists.");
        }
    }

    return await prisma.blogTag.update({
        where: { id },
        data,
    });
};

// Delete a blog tag
export const deleteBlogTag = async (id) => {
    const existingTag = await prisma.blogTag.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    blogs: true,
                },
            },
        },
    });

    if (!existingTag) {
        throw new Error("Blog tag not found.");
    }

    if (existingTag._count.blogs > 0) {
        throw new Error(
            "This tag is assigned to one or more blogs and cannot be deleted."
        );
    }

    return await prisma.blogTag.delete({
        where: { id },
    });
};
