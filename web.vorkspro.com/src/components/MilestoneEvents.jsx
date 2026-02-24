const MilestoneEvent = ({ event }) => {
  return (
    <div
      className="px-2 py-1 rounded-md text-white text-[12px] font-medium shadow-sm"
      style={{
        backgroundColor: event.backgroundColor,
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      {event.title}
    </div>
  );
};

export default MilestoneEvent;
