
import prisma from "../../config/prisma.js";

// Fields required for blog cards on the public website
const publicBlogListSelect = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    featuredImage: true,
    imageAlt: true,
    isFeatured: true,
    readingTime: true,
    publishedAt: true,

    author: {
        select: {
            fullName: true,
        },
    },

    category: {
        select: {
            id: true,
            name: true,
            slug: true,
        },
    },

    tags: {
        select: {
            tag: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    },
};

// Additional fields required when viewing a single blog
const publicBlogDetailSelect = {
    ...publicBlogListSelect,
    content: true,
    metaTitle: true,
    metaDescription: true,
    focusKeyword: true,
    canonicalUrl: true,
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
            select: publicBlogListSelect,
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
        select: publicBlogDetailSelect,
    });

    if (!blog) {
        throw new Error("BLOG_NOT_FOUND");
    }

    return blog;
};

// Get featured published blogs
export const getFeaturedBlogs = async (limit = 5) => {
    const where = {
        status: "PUBLISHED",
        isFeatured: true,
    };

    const [blogs, totalBlogs] = await prisma.$transaction([
        prisma.blog.findMany({
            where,
            take: limit,
            orderBy: {
                publishedAt: "desc",
            },
            select: publicBlogListSelect,
        }),

        prisma.blog.count({
            where,
        }),
    ]);

    return {
        blogs,
        totalBlogs,
    };
};
