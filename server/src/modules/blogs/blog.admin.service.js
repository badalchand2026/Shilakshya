
import prisma from "../../config/prisma.js";

export const createBlog = async (blogData, authorId) => {
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
    authorName,
    categoryId,
    tagIds,
  } = blogData;

  // Check whether the category exists
  if (categoryId) {
    const category = await prisma.blogCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
  }

  // Check whether all tags exist
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

  // Calculate publication date
  const publishedAt =
    status === "PUBLISHED" ? new Date() : null;

  // Create blog
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
      authorName,
      authorId,
      categoryId,
      publishedAt,

      // Connect multiple tags
      tags: {
        create: tagIds.map((tagId) => ({
          tag: {
            connect: { id: tagId },
          },
        })),
      },
    },

    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true,
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
