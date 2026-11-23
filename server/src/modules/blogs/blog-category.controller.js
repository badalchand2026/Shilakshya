
import {
  createBlogCategory,
  getAllBlogCategories,
  updateBlogCategory,
  deleteBlogCategory
} from "./blog-category.service.js";


import {
  createBlogCategorySchema,
  updateBlogCategorySchema,
} from "./blog-category.validation.js";


// Create Blog Category Controller
export const createBlogCategoryController = async (req, res) => {
  try {
    // 1. Validate request body
    const validationResult = createBlogCategorySchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: validationResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // 2. Get validated category data
    const categoryData = validationResult.data;

    // 3. Call service to create category
    const category = await createBlogCategory(categoryData);

    // 4. Return successful response
    return res.status(201).json({
      success: true,
      message: "Blog category created successfully.",
      data: {
        category,
      },
    });
  } catch (error) {
    console.error("Create Blog Category Error:", error);

    // Duplicate category name
    if (error.message === "CATEGORY_NAME_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists.",
      });
    }

    // Duplicate category slug
    if (
      error.message === "CATEGORY_SLUG_EXISTS" ||
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "A category with this slug already exists.",
      });
    }

    // Unexpected server error
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the blog category.",
    });
  }
};




 // Get All Blog Categories Controller
export const getAllBlogCategoriesController = async (req, res) => {
  try {
    // 1. Get categories from service
    const result = await getAllBlogCategories();

    // 2. Return successful response
    return res.status(200).json({
      success: true,
      message: "Blog categories retrieved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Get All Blog Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving blog categories.",
    });
  }
};




 // Update Blog Category Controller
export const updateBlogCategoryController = async (req, res) => {
  try {
    // 1. Get category ID from URL
    const { id } = req.params;

    // 2. Validate category ID
    const isValidUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (!isValidUUID) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    // 3. Validate request body
    const validationResult = updateBlogCategorySchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: validationResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // 4. Update category
    const category = await updateBlogCategory(
      id,
      validationResult.data
    );

    // 5. Return successful response
    return res.status(200).json({
      success: true,
      message: "Blog category updated successfully.",
      data: {
        category,
      },
    });
  } catch (error) {
    console.error("Update Blog Category Error:", error);

    if (error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Blog category not found.",
      });
    }

    if (error.message === "CATEGORY_NAME_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists.",
      });
    }

    if (
      error.message === "CATEGORY_SLUG_EXISTS" ||
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "A category with this slug already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the category.",
    });
  }
};





 // Delete Blog Category Controller
export const deleteBlogCategoryController = async (req, res) => {
  try {
    const { id } = req.params;

    const isValidUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (!isValidUUID) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    const category = await deleteBlogCategory(id);

    return res.status(200).json({
      success: true,
      message: "Blog category deleted successfully.",
      data: { category },
    });
  } catch (error) {
    console.error("Delete Blog Category Error:", error);

    if (error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Blog category not found.",
      });
    }

    if (error.message === "CATEGORY_HAS_BLOGS") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete this category because blogs are assigned to it.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the category.",
    });
  }
};
