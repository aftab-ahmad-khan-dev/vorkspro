// Updated changeIndex method for your projectController

changeIndex: asyncHandler(async (req, res) => {
  const { id } = req.params; // milestone ID
  const { projectId } = req.query; // project ID from query
  const { fromIndex, toIndex } = req.body;

  // Import Milestone model at the top of your controller file
  const milestone = await Milestone.findById(id);

  if (!milestone) {
    return generateApiResponse(
      res,
      StatusCodes.NOT_FOUND,
      false,
      "Milestone not found"
    );
  }

  // Verify milestone belongs to the project
  if (milestone.project.toString() !== projectId) {
    return generateApiResponse(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      "Milestone does not belong to this project"
    );
  }

  // Update the milestone's sortIndex to the new position
  milestone.sortIndex = toIndex;
  await milestone.save();

  return generateApiResponse(
    res,
    StatusCodes.OK,
    true,
    `Milestone moved from position ${fromIndex} to ${toIndex}`,
    { milestone }
  );
}),