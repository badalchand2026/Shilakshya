
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
} from "./blog.admin.service.js";
import { createBlogSchema, updateBlogSchema } from "./blog.validation.js";



// Create Blog Controller
export const createBlogController = async (req, res) => {
  try {
    // 1. Validate request body
    const validationResult = createBlogSchema.safeParse(req.body);

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

    // 2. Get validated blog data
    const blogData = validationResult.data;

    // 3. Get logged-in admin ID
    const authorId = req.user.id;

    // 4. Call service to create the blog
    const blog = await createBlog(blogData, authorId);

    // 5. Return successful response
    return res.status(201).json({
      success: true,
      message: "Blog created successfully.",
      data: {
        blog,
      },
    });
  } catch (error) {
    console.error("Create Blog Error:", error);

    // Category does not exist
    if (error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Selected blog category was not found.",
      });
    }

    // One or more tags do not exist
    if (error.message === "TAG_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "One or more selected blog tags were not found.",
      });
    }

    // Duplicate slug
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A blog with this slug already exists.",
      });
    }

    // Unexpected server error
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the blog.",
    });
  }
};


// get all blogs

export const getAllBlogsController = async (req, res) => {
  try {
    // 1. Get query parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim();
    const status = req.query.status;
    const featuredQuery = req.query.isFeatured;

    // 2. Validate pagination
    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    // 3. Validate blog status
    if (
      status &&
      !["DRAFT", "PUBLISHED"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog status.",
      });
    }

    // 4. Validate featured filter
    if (
      featuredQuery !== undefined &&
      !["true", "false"].includes(featuredQuery)
    ) {
      return res.status(400).json({
        success: false,
        message: "isFeatured must be true or false.",
      });
    }

    // 5. Prepare filters
    const query = {
      page,
      limit,
      search,
      status,
      ...(featuredQuery !== undefined && {
        isFeatured: featuredQuery === "true",
      }),
    };

    // 6. Get blogs from service
    const result = await getAllBlogs(query);

    // 7. Return response
    return res.status(200).json({
      success: true,
      message: "Blogs retrieved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Get All Blogs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving blogs.",
    });
  }
};



//get blog by id

export const getBlogByIdController = async (req, res) => {
  try {
    // 1. Get blog ID from URL parameters
    const { id } = req.params;

    // 2. Validate blog ID
    const isValidUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!isValidUUID.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID.",
      });
    }

    // 3. Get blog from service
    const blog = await getBlogById(id);

    // 4. Return response
    return res.status(200).json({
      success: true,
      message: "Blog retrieved successfully.",
      data: {
        blog,
      },
    });
  } catch (error) {
    console.error("Get Blog By ID Error:", error);

    if (error.message === "BLOG_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving the blog.",
    });
  }
};


//update blog controller


export const updateBlogController = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate blog ID
    const isValidId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (!isValidId) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID.",
      });
    }

    // 2. Validate request body
    const validationResult = updateBlogSchema.safeParse(req.body);

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

    // 3. Update blog
    const blog = await updateBlog(id, validationResult.data);

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully.",
      data: {
        blog,
      },
    });
  } catch (error) {
    console.error("Update Blog Error:", error);

    if (error.message === "BLOG_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    if (error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    if (error.message === "TAG_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "One or more tags were not found.",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A blog with this slug already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the blog.",
    });
  }
};
