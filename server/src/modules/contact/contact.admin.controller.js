import { getAllContactInquiries, getContactInquiryById, updateContactInquiryStatus, deleteContactInquiry} from "./contact.admin.service.js";




export const getAllContactInquiriesController = async (req, res) => {
  try {
    // Read query parameters.
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim();
    const status = req.query.status?.trim().toUpperCase();

    // Validate pagination.
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

    // Validate inquiry status.
    const allowedStatuses = [
      "NEW",
      "IN_PROGRESS",
      "CONTACTED",
      "COMPLETED",
      "REJECTED",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry status.",
      });
    }

    // Fetch inquiries.
    const result = await getAllContactInquiries({
      page,
      limit,
      search,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Contact inquiries retrieved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Get contact inquiries error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve contact inquiries.",
    });
  }
};



export const getContactInquiryByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact inquiry ID.",
      });
    }

    const inquiry = await getContactInquiryById(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Contact inquiry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact inquiry retrieved successfully.",
      data: {
        inquiry,
      },
    });
  } catch (error) {
    console.error("Get contact inquiry by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve contact inquiry.",
    });
  }
};




export const updateContactInquiryStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact inquiry ID.",
      });
    }

    // Validate status
    const allowedStatuses = [
      "NEW",
      "IN_PROGRESS",
      "CONTACTED",
      "COMPLETED",
      "REJECTED",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry status.",
        allowedStatuses,
      });
    }

    const inquiry = await updateContactInquiryStatus(id, status);

    return res.status(200).json({
      success: true,
      message: "Contact inquiry status updated successfully.",
      data: {
        inquiry,
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Contact inquiry not found.",
      });
    }

    console.error("Update contact inquiry status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update contact inquiry status.",
    });
  }
};



export const deleteContactInquiryController = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact inquiry ID.",
      });
    }

    const inquiry = await deleteContactInquiry(id);

    return res.status(200).json({
      success: true,
      message: "Contact inquiry deleted successfully.",
      data: {
        inquiry,
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Contact inquiry not found.",
      });
    }

    console.error("Delete contact inquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete contact inquiry.",
    });
  }
};
