
import prisma from "../../config/prisma.js";

export const createBlog = async (blogData, authorId) => {
  // 1. Get the authenticated admin
  const author = await prisma.user.findUnique({
    where: { id: authorId },
    select: {
      id: true,
      fullName: true,
    },
  });

  if (!author) {
    throw new Error("AUTHOR_NOT_FOUND");
  }

  // 2. Extract blog data
  const {
    title,
    slug,
    excerpt,
    featuredImage,
    imageAlt,
    content,
    metaTitle,
    metaDescription,
    focusKeyword,
    canonicalUrl,
    status,
    isFeatured,
    readingTime,
    categoryId,
    tagIds = [],
  } = blogData;

  // 3. Check whether the category exists
  if (categoryId) {
    const category = await prisma.blogCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
  }

  // 4. Check whether all selected tags exist
  if (tagIds.length > 0) {
    const existingTags = await prisma.blogTag.findMany({
      where: {
        id: {
          in: tagIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingTags.length !== tagIds.length) {
      throw new Error("TAG_NOT_FOUND");
    }
  }

  // 5. Set publication date
  const publishedAt =
    status === "PUBLISHED" ? new Date() : null;

  // 6. Create blog
  const blog = await prisma.blog.create({
    data: {
      title,
      slug,
      excerpt,
      featuredImage,
      imageAlt,

      ...(content !== undefined && content !== null
        ? { content }
        : {}),

      metaTitle,
      metaDescription,
      focusKeyword,
      canonicalUrl,

      status,
      isFeatured,
      readingTime,

      // Automatically use the authenticated admin's details
      authorId: author.id,
      authorName: author.fullName,

      categoryId,
      publishedAt,

      // Connect selected tags
      tags: {
        create: tagIds.map((tagId) => ({
          tag: {
            connect: {
              id: tagId,
            },
          },
        })),
      },
    },

    include: {
      author: {
        select: {
          id: true,
          fullName: true,
        },
      },
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  return blog;
};



// get all blogs


export const getAllBlogs = async (query) => {
  // 1. Extract query parameters
  const {
    page = 1,
    limit = 10,
    search,
    status,
    isFeatured,
  } = query;

  // 2. Calculate pagination
  const skip = (page - 1) * limit;

  // 3. Build search and filter conditions
  const where = {
    ...(status && {
      status,
    }),

    ...(isFeatured !== undefined && {
      isFeatured,
    }),

    ...(search && {
      OR: [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          slug: {
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
  };

  // 4. Get blogs and total count
  const [blogs, totalBlogs] = await prisma.$transaction([
    prisma.blog.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    }),

    prisma.blog.count({
      where,
    }),
  ]);

  // 5. Calculate pagination information
  const totalPages = Math.ceil(totalBlogs / limit);

  // 6. Return result
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






// get single blog
export const getBlogById = async (blogId) => {
  // 1. Find blog by ID
  const blog = await prisma.blog.findUnique({
    where: {
      id: blogId,
    },

    include: {
      author: {
        select: {
          id: true,
          fullName: true,
        },
      },

      category: true,

      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  // 2. Check whether blog exists
  if (!blog) {
    throw new Error("BLOG_NOT_FOUND");
  }

  // 3. Return blog
  return blog;
};



// update blog
export const updateBlog = async (blogId, blogData) => {
  // 1. Check whether the blog exists
  const existingBlog = await prisma.blog.findUnique({
    where: {
      id: blogId,
    },
  });

  if (!existingBlog) {
    throw new Error("BLOG_NOT_FOUND");
  }

  // 2. Extract submitted fields
  const {
    title,
    slug,
    excerpt,
    featuredImage,
    imageAlt,
    content,
    metaTitle,
    metaDescription,
    focusKeyword,
    canonicalUrl,
    status,
    isFeatured,
    readingTime,
    categoryId,
    tagIds,
  } = blogData;

  // 3. Check whether the category exists
  if (categoryId) {
    const category = await prisma.blogCategory.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
  }

  // 4. Check whether all submitted tags exist
  if (tagIds && tagIds.length > 0) {
    const existingTags = await prisma.blogTag.findMany({
      where: {
        id: {
          in: tagIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingTags.length !== tagIds.length) {
      throw new Error("TAG_NOT_FOUND");
    }
  }

  // 5. Prepare update data
  const updateData = {
    ...(title !== undefined && { title }),
    ...(slug !== undefined && { slug }),
    ...(excerpt !== undefined && { excerpt }),
    ...(featuredImage !== undefined && { featuredImage }),
    ...(imageAlt !== undefined && { imageAlt }),
    ...(content !== undefined && { content }),
    ...(metaTitle !== undefined && { metaTitle }),
    ...(metaDescription !== undefined && { metaDescription }),
    ...(focusKeyword !== undefined && { focusKeyword }),
    ...(canonicalUrl !== undefined && { canonicalUrl }),
    ...(status !== undefined && { status }),
    ...(isFeatured !== undefined && { isFeatured }),
    ...(readingTime !== undefined && { readingTime }),
    ...(categoryId !== undefined && { categoryId }),
  };

  // 6. Handle publication date
  if (status === "PUBLISHED" && existingBlog.status !== "PUBLISHED") {
    updateData.publishedAt = new Date();
  }

  if (status === "DRAFT") {
    updateData.publishedAt = null;
  }

  // 7. Update blog
  const updatedBlog = await prisma.blog.update({
    where: {
      id: blogId,
    },

    data: {
      ...updateData,

      // Update tags only when tagIds is submitted
      ...(tagIds !== undefined && {
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId) => ({
            tag: {
              connect: {
                id: tagId,
              },
            },
          })),
        },
      }),
    },

    include: {
      author: {
        select: {
          id: true,
          fullName: true,
        },
      },
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  return updatedBlog;
};
