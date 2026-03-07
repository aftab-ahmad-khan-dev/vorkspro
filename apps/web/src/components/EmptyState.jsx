import React from "react";
import { FileX } from "lucide-react";

const EmptyState = ({ 
  icon: Icon = FileX, 
  title = "No data found", 
  subtitle = "There's nothing to display at the moment", 
  noPadding = true
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${noPadding ? "py-12" : "p-4"} px-4 text-center`}>
      <Icon className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{subtitle}</p>
    </div>
  );
};

export default EmptyState;