
import prisma from "../../config/prisma.js";

export const createContactInquiry = async (data) => {
  const inquiry = await prisma.contactInquiry.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      serviceRequired: data.serviceRequired,
      projectType: data.projectType,
      projectDetails: data.projectDetails,
      privacyAccepted: data.privacyAccepted,
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
  });

  return inquiry;
};
