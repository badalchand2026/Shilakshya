
import prisma from "../../config/prisma.js";





// get all
export const getAllContactInquiries = async ({
  page = 1,
  limit = 10,
  search,
  status,
}) => {
  const skip = (page - 1) * limit;

  // Build database filters dynamically.
  const where = {};

  // Search by customer name or email.
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

  // Filter inquiries by status.
  if (status) {
    where.status = status;
  }

  // Fetch inquiries and total count together.
  const [inquiries, totalInquiries] = await prisma.$transaction([
    prisma.contactInquiry.findMany({
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
        phone: true,
        serviceRequired: true,
        projectType: true,
        status: true,
        createdAt: true,
      },
    }),

    prisma.contactInquiry.count({
      where,
    }),
  ]);

  return {
    inquiries,
    pagination: {
      currentPage: page,
      limit,
      totalInquiries,
      totalPages: Math.ceil(totalInquiries / limit),
      hasNextPage: page * limit < totalInquiries,
      hasPreviousPage: page > 1,
    },
  };
};


//get by id
export const getContactInquiryById = async (id) => {
  const inquiry = await prisma.contactInquiry.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      serviceRequired: true,
      projectType: true,
      projectDetails: true,
      privacyAccepted: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return inquiry;
};



// update contact status

export const updateContactInquiryStatus = async (id, status) => {
  const inquiry = await prisma.contactInquiry.update({
    where: { id },
    data: {
      status,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      serviceRequired: true,
      projectType: true,
      status: true,
      updatedAt: true,
    },
  });

  return inquiry;
};



// delete contact inquiry


export const deleteContactInquiry = async (id) => {
  const inquiry = await prisma.contactInquiry.delete({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
    },
  });

  return inquiry;
};
