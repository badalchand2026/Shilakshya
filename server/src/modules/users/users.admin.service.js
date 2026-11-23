
import prisma from "../../config/prisma.js";

export const getAllUsers = async ({
  page = 1,
  limit = 10,
  search,
  role,
  isActive,
}) => {
  // Calculate pagination offset
  const skip = (page - 1) * limit;

  // Build database filters
  const where = {};

  // Search by full name or email
  if (search) {
    where.OR = [
      {
        fullName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  // Filter by user role
  if (role) {
    where.role = role;
  }

  // Filter by account status
  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  // Fetch users and total count
  const [users, totalUsers] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      currentPage: page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      hasNextPage: page * limit < totalUsers,
      hasPreviousPage: page > 1,
    },
  };
};



export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};




// update user status

export const updateUserStatus = async (id, isActive) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    return null;
  }

  // Prevent deactivating the last active admin
  if (user.role === "ADMIN" && !isActive && user.isActive) {
    const activeAdminCount = await prisma.user.count({
      where: {
        role: "ADMIN",
        isActive: true,
      },
    });

    if (activeAdminCount <= 1) {
      throw new Error("LAST_ACTIVE_ADMIN");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};



// delete user

export const deleteUser = async (id) => {
  return await prisma.$transaction(async (tx) => {
    // Find the user
    const user = await tx.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return null;
    }

    // Prevent deleting the last active admin
    if (user.role === "ADMIN" && user.isActive) {
      const activeAdminCount = await tx.user.count({
        where: {
          role: "ADMIN",
          isActive: true,
        },
      });

      if (activeAdminCount <= 1) {
        throw new Error("LAST_ACTIVE_ADMIN");
      }
    }

    // Delete related refresh tokens
    await tx.refreshToken.deleteMany({
      where: { userId: id },
    });

    // Delete related password reset OTP records
    await tx.passwordResetOtp.deleteMany({
      where: { userId: id },
    });

    // Delete the user
    const deletedUser = await tx.user.delete({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return deletedUser;
  });
};
