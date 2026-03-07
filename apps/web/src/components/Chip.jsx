import React from "react";

function Chip({ status, className }) {
  return (
    <div>
      <span
        className={`rounded-sm text-sm py-1 px-2 capitalize ${className} ${
          status === "active"
            ? "bg-green-500/10 text-green-500"
            : status === "resigned"
            ? "bg-yellow-500/10 text-yellow-500"
            : status === "terminated"
            ? "bg-red-500/10 text-red-500"
            : status == "present"
            ? "bg-blue-500/10 text-blue-500"
            : status === "absent"
            ? "bg-red-500/10 text-red-500"
            : status == "on-leave"
            ? "bg-yellow-500/10 text-yellow-500"
            : status == "over-time"
            ? "bg-green-500/10 text-green-500"
            : status == "delete"
            ? "bg-red-500/10 text-red-500"
            : status == "late-arrival"
            ? "bg-orange-500/10 text-orange-500"
            : status == "low"
            ? "bg-green-500/10 text-green-500"
            : status == "medium"
            ? "bg-yellow-500/10 text-yellow-500"
            : status == "high"
            ? "bg-red-500/10 text-red-500"
            : status == "in progress"
            ? "bg-blue-500/10 text-blue-500"
            : status == "completed" 
            ? "bg-green-500/10 text-green-500" 
            : status == "in progress" 
            ? "bg-blue-500/10 text-blue-500" 
            : status == "not started" 
            ? "bg-red-500/10 text-red-500" 
            : status == "delayed"
            ? "bg-yellow-500/10 text-yellow-500" 
            : status == 'assigned' 
            ? "bg-blue-500/10 text-blue-500"
            : status == "available" 
            ? "bg-yellow-500/10 text-yellow-500"
            : status == "due-today" 
            ? "bg-amber-500/10 text-amber-500" 
            : status == "overdue" 
            ? "bg-red-500/10 text-red-500" 
            : status == "upcoming" 
            ? "bg-blue-500/10 text-blue-500" 
            : status == "completed" 
            ? "bg-green-500/10 text-green-500" 
            : status == "critical"
            ? "bg-red-500/10 text-red-500" 
            : status == "in-progress"
            ? "bg-blue-500/10 text-blue-500" 
            : status == "resolved"
            ? "bg-green-500/10 text-green-500" :
             "bg-gray-500/10 text-gray-500"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

export default Chip;
