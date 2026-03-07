// Example usage of EmptyState component

import React from "react";
import EmptyState from "@/components/EmptyState";
import { 
  Users, 
  Briefcase, 
  FileText, 
  Calendar, 
  MessageSquare,
  Search,
  Database,
  Inbox
} from "lucide-react";

// Example 1: Default usage
const DefaultExample = () => (
  <EmptyState />
);

// Example 2: Custom icon and messages
const CustomExample = () => (
  <EmptyState 
    icon={Users}
    title="No employees found"
    subtitle="Start by adding your first team member to get started"
  />
);

// Example 3: Different scenarios
const ProjectsEmpty = () => (
  <EmptyState 
    icon={Briefcase}
    title="No projects yet"
    subtitle="Create your first project to start tracking progress and milestones"
  />
);

const DocumentsEmpty = () => (
  <EmptyState 
    icon={FileText}
    title="No documents uploaded"
    subtitle="Upload documents to share them with your team"
  />
);

const EventsEmpty = () => (
  <EmptyState 
    icon={Calendar}
    title="No upcoming events"
    subtitle="Schedule meetings and events to keep your team organized"
  />
);

const MessagesEmpty = () => (
  <EmptyState 
    icon={MessageSquare}
    title="No messages"
    subtitle="Start a conversation with your team members"
  />
);

const SearchEmpty = () => (
  <EmptyState 
    icon={Search}
    title="No results found"
    subtitle="Try adjusting your search criteria or browse all items"
  />
);

const DataEmpty = () => (
  <EmptyState 
    icon={Database}
    title="No data available"
    subtitle="Data will appear here once it's been processed"
  />
);

const InboxEmpty = () => (
  <EmptyState 
    icon={Inbox}
    title="Inbox is empty"
    subtitle="You're all caught up! New notifications will appear here"
  />
);

export {
  DefaultExample,
  CustomExample,
  ProjectsEmpty,
  DocumentsEmpty,
  EventsEmpty,
  MessagesEmpty,
  SearchEmpty,
  DataEmpty,
  InboxEmpty
};