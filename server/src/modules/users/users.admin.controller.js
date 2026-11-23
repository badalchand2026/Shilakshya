
import { getAllUsers, getUserById, updateUserStatus, deleteUser } from "./users.admin.service.js";



// get all user

export const getAllUsersController = async (req, res) => {
  try {
    // Get query parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim();
    const role = req.query.role?.trim().toUpperCase();

    // Parse account status
    let isActive;

    if (req.query.isActive !== undefined) {
      if (!["true", "false"].includes(req.query.isActive)) {
        return res.status(400).json({
          success: false,
          message: "Invalid account status filter. Use true or false.",
        });
      }

      isActive = req.query.isActive === "true";
    }

    // Validate pagination
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

    // Validate user role
    const allowedRoles = ["ADMIN", "USER"];

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
        allowedRoles,
      });
    }

    // Fetch users
    const result = await getAllUsers({
      page,
      limit,
      search,
      role,
      isActive,
    });

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users.",
    });
  }
};


// get user by id
export const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get user by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user.",
    });
  }
};



export const updateUserStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Validate UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // Validate account status
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value.",
      });
    }

    // Prevent admin from deactivating their own account
    if (req.user.id === id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account.",
      });
    }

    const user = await updateUserStatus(id, isActive);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully.`,
      data: {
        user,
      },
    });
  } catch (error) {
    if (error.message === "LAST_ACTIVE_ADMIN") {
      return res.status(409).json({
        success: false,
        message: "Cannot deactivate the last active admin account.",
      });
    }

    console.error("Update user status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user status.",
    });
  }
};




export const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // Prevent admin from deleting their own account
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    const deletedUser = await deleteUser(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      data: {
        user: deletedUser,
      },
    });
  } catch (error) {
    if (error.message === "LAST_ACTIVE_ADMIN") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete the last active admin account.",
      });
    }

    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
    });
  }
};
