
import {
  createProjectCategory,
  getAllProjectCategories,
  updateProjectCategory,
  deleteProjectCategory,
} from "./project-category.service.js";

import {
  createProjectCategorySchema,
  updateProjectCategorySchema,
} from "./project-category.validation.js";


// Create Project Category Controller
export const createProjectCategoryController = async (req, res) => {
  try {
    // 1. Validate request body
    const validationResult = createProjectCategorySchema.safeParse(req.body);

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
    const category = await createProjectCategory(categoryData);

    // 4. Return successful response
    return res.status(201).json({
      success: true,
      message: "Project category created successfully.",
      data: {
        category,
      },
    });
  } catch (error) {
    console.error("Create Project Category Error:", error);

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
      message: "Something went wrong while creating the project category.",
    });
  }
};


// Get All Project Categories Controller
export const getAllProjectCategoriesController = async (req, res) => {
  try {
    // 1. Get categories from service
    const result = await getAllProjectCategories();

    // 2. Return successful response
    return res.status(200).json({
      success: true,
      message: "Project categories retrieved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Get All Project Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving project categories.",
    });
  }
};


// Update Project Category Controller
export const updateProjectCategoryController = async (req, res) => {
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
    const validationResult = updateProjectCategorySchema.safeParse(req.body);

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
    const category = await updateProjectCategory(
      id,
      validationResult.data
    );

    // 5. Return successful response
    return res.status(200).json({
      success: true,
      message: "Project category updated successfully.",
      data: {
        category,
      },
    });
  } catch (error) {
    console.error("Update Project Category Error:", error);

    if (error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Project category not found.",
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
      message: "Something went wrong while updating the project category.",
    });
  }
};


// Delete Project Category Controller
export const deleteProjectCategoryController = async (req, res) => {
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

    const category = await deleteProjectCategory(id);

    return res.status(200).json({
      success: true,
      message: "Project category deleted successfully.",
      data: {
        category,
      },
    });
  } catch (error) {
    console.error("Delete Project Category Error:", error);

    if (error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Project category not found.",
      });
    }

    if (error.message === "CATEGORY_HAS_PROJECTS") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete this category because projects are assigned to it.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the project category.",
    });
  }
};
