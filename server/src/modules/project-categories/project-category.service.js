
import prisma from "../../config/prisma.js";

// Create Project Category

// Create Project Category
export const createProjectCategory = async (categoryData) => {
  const { name, slug, description } = categoryData;

  // 1. Check whether category name already exists
  const existingName = await prisma.projectCategory.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existingName) {
    throw new Error("CATEGORY_NAME_EXISTS");
  }

  // 2. Check whether category slug already exists
  const existingSlug = await prisma.projectCategory.findUnique({
    where: {
      slug,
    },
  });

  if (existingSlug) {
    throw new Error("CATEGORY_SLUG_EXISTS");
  }

  // 3. Save category in database
  const category = await prisma.projectCategory.create({
    data: {
      name,
      slug,
      description,
    },
  });

  return category;
};


// Get All Project Categories
export const getAllProjectCategories = async () => {
  const categories = await prisma.projectCategory.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });

  return {
    categories,
    totalCategories: categories.length,
  };
};


// Update Project Category
export const updateProjectCategory = async (categoryId, categoryData) => {
  // 1. Check whether category exists
  const existingCategory = await prisma.projectCategory.findUnique({
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
    const duplicateName = await prisma.projectCategory.findFirst({
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
    const duplicateSlug = await prisma.projectCategory.findFirst({
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
  const updatedCategory = await prisma.projectCategory.update({
    where: {
      id: categoryId,
    },
    data: updateData,
    include: {
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });

  return updatedCategory;
};


// Delete Project Category
export const deleteProjectCategory = async (categoryId) => {
  const existingCategory = await prisma.projectCategory.findUnique({
    where: {
      id: categoryId,
    },
    include: {
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });

  if (!existingCategory) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  // Prevent deletion if projects are assigned to this category
  if (existingCategory._count.projects > 0) {
    throw new Error("CATEGORY_HAS_PROJECTS");
  }

  await prisma.projectCategory.delete({
    where: {
      id: categoryId,
    },
  });

  return existingCategory;
};
