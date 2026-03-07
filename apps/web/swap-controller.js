// Updated changeIndex method that swaps sortIndex values

changeIndex: asyncHandler(async (req, res) => {
  const { id } = req.params; // milestone ID
  const { projectId } = req.query; // project ID from query
  const { fromIndex, toIndex } = req.body;

  // Get all milestones for this project
  const milestones = await Milestone.find({ project: projectId });

  if (!milestones.length) {
    return generateApiResponse(
      res,
      StatusCodes.NOT_FOUND,
      false,
      "No milestones found for this project"
    );
  }

  // Find the milestone being moved
  const draggedMilestone = milestones.find(m => m._id.toString() === id);
  
  if (!draggedMilestone) {
    return generateApiResponse(
      res,
      StatusCodes.NOT_FOUND,
      false,
      "Milestone not found"
    );
  }

  // Find the milestone at the target position
  const targetMilestone = milestones.find(m => m.sortIndex === toIndex);

  if (targetMilestone) {
    // Swap sortIndex values
    const tempIndex = draggedMilestone.sortIndex;
    draggedMilestone.sortIndex = targetMilestone.sortIndex;
    targetMilestone.sortIndex = tempIndex;

    // Save both milestones
    await draggedMilestone.save();
    await targetMilestone.save();
  } else {
    // If no milestone at target position, just update the dragged milestone
    draggedMilestone.sortIndex = toIndex;
    await draggedMilestone.save();
  }

  return generateApiResponse(
    res,
    StatusCodes.OK,
    true,
    `Milestone moved from position ${fromIndex} to ${toIndex}`,
    { milestone: draggedMilestone }
  );
}),