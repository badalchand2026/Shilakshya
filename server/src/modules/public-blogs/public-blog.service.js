
import prisma from "../../config/prisma.js";

// Common blog details returned to website visitors
const publicBlogInclude = {
    author: {
        select: {
            fullName: true,
        },
    },
    category: true,
    tags: {
        include: {
            tag: true,
        },
    },
};

// Get all published blogs with search and filters
export const getPublicBlogs = async (query) => {
    const {
        page = 1,
        limit = 10,
        search,
        category,
        tag,
    } = query;

    const skip = (page - 1) * limit;

    const where = {
        status: "PUBLISHED",

        ...(search && {
            OR: [
                {
                    title: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    excerpt: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        }),

        ...(category && {
            category: {
                slug: category,
            },
        }),

        ...(tag && {
            tags: {
                some: {
                    tag: {
                        slug: tag,
                    },
                },
            },
        }),
    };

    const [blogs, totalBlogs] = await prisma.$transaction([
        prisma.blog.findMany({
            where,
            skip,
            take: limit,
            orderBy: [
                { publishedAt: "desc" },
                { createdAt: "desc" },
            ],
            include: publicBlogInclude,
        }),

        prisma.blog.count({
            where,
        }),
    ]);

    const totalPages = Math.ceil(totalBlogs / limit);

    return {
        blogs,
        pagination: {
            currentPage: page,
            limit,
            totalBlogs,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};

// Get a single published blog using its slug
export const getPublicBlogBySlug = async (slug) => {
    const blog = await prisma.blog.findFirst({
        where: {
            slug,
            status: "PUBLISHED",
        },
        include: publicBlogInclude,
    });

    if (!blog) {
        throw new Error("BLOG_NOT_FOUND");
    }

    return blog;
};

// Get featured published blogs
export const getFeaturedBlogs = async (limit = 5) => {
    const blogs = await prisma.blog.findMany({
        where: {
            status: "PUBLISHED",
            isFeatured: true,
        },
        take: limit,
        orderBy: {
            publishedAt: "desc",
        },
        include: publicBlogInclude,
    });

    return {
        blogs,
        totalBlogs: blogs.length,
    };
};
