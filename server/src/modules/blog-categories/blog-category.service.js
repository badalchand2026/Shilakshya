
import prisma from "../../config/prisma.js";

// Create Blog Category
export const createBlogCategory = async (categoryData) => {
  const { name, slug, description } = categoryData;

  // Check whether category name already exists
  const existingCategory = await prisma.blogCategory.findFirst({
    where: {
      OR: [
        { name: { equals: name, mode: "insensitive" } },
        { slug },
      ],
    },
  });

  if (existingCategory) {
    if (existingCategory.slug === slug) {
      throw new Error("CATEGORY_SLUG_EXISTS");
    }

    throw new Error("CATEGORY_NAME_EXISTS");
  }

  // Save category in database
  const category = await prisma.blogCategory.create({
    data: {
      name,
      slug,
      description,
    },
  });

  return category;
};




// Get All Blog Categories
export const getAllBlogCategories = async () => {
  const categories = await prisma.blogCategory.findMany({
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
    categories,
    totalCategories: categories.length,
  };
};



 // Update Blog Category
export const updateBlogCategory = async (categoryId, categoryData) => {
  // 1. Check whether category exists
  const existingCategory = await prisma.blogCategory.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!existingCategory) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  const { name, slug, description } = categoryData;

  // 2. Check for duplicate category name
  if (name !== undefined) {
    const duplicateName = await prisma.blogCategory.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        NOT: {
          id: categoryId,
        },
      },
    });

    if (duplicateName) {
      throw new Error("CATEGORY_NAME_EXISTS");
    }
  }

  // 3. Check for duplicate category slug
  if (slug !== undefined) {
    const duplicateSlug = await prisma.blogCategory.findFirst({
      where: {
        slug,
        NOT: {
          id: categoryId,
        },
      },
    });

    if (duplicateSlug) {
      throw new Error("CATEGORY_SLUG_EXISTS");
    }
  }

  // 4. Prepare fields for update
  const updateData = {
    ...(name !== undefined && { name }),
    ...(slug !== undefined && { slug }),
    ...(description !== undefined && { description }),
  };

  // 5. Update category in database
  const updatedCategory = await prisma.blogCategory.update({
    where: {
      id: categoryId,
    },
    data: updateData,
    include: {
      _count: {
        select: {
          blogs: true,
        },
      },
    },
  });

  return updatedCategory;
};




// Delete Blog Category
export const deleteBlogCategory = async (categoryId) => {
  const existingCategory = await prisma.blogCategory.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: {
          blogs: true,
        },
      },
    },
  });

  if (!existingCategory) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  if (existingCategory._count.blogs > 0) {
    throw new Error("CATEGORY_HAS_BLOGS");
  }

  await prisma.blogCategory.delete({
    where: { id: categoryId },
  });

  return existingCategory;
};
