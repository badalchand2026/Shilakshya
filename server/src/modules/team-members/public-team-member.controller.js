
import {
    getPublicTeamMembers,
    getPublicTeamMemberById,
} from "./public-team-member.service.js";

// Get all published team members
export const getPublicTeamMembersController = async (req, res, next) => {
    try {
        const teamMembers = await getPublicTeamMembers();

        return res.status(200).json({
            success: true,
            message: "Team members retrieved successfully.",
            data: {
                teamMembers,
                total: teamMembers.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get one published team member by ID
export const getPublicTeamMemberByIdController = async (
    req,
    res,
    next
) => {
    try {
        const teamMember = await getPublicTeamMemberById(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Team member retrieved successfully.",
            data: {
                teamMember,
            },
        });
    } catch (error) {
        next(error);
    }
};
