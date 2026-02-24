import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function CreateBugDialog() {
  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg space-y-4">
      {/* Bug Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Bug Title</label>
        <Input
          type="text"
          placeholder="Brief description of the issue"
          className="w-full border border-gray-300 rounded-md p-2 text-gray-500"
        />
      </div>

      {/* Project */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Project</label>
        <Select>
          <SelectTrigger className="w-full border border-gray-300 rounded-md p-2 text-gray-500">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="project1">Project 1</SelectItem>
            <SelectItem value="project2">Project 2</SelectItem>
            <SelectItem value="project3">Project 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Severity and Bug Type */}
      <div className="flex space-x-4">
        <div className="space-y-2 w-1/2">
          <label className="text-sm font-medium text-gray-700">Severity</label>
          <Select>
            <SelectTrigger className="w-full border border-gray-300 rounded-md p-2 text-gray-500">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 w-1/2">
          <label className="text-sm font-medium text-gray-700">Bug Type</label>
          <Select>
            <SelectTrigger className="w-full border border-gray-300 rounded-md p-2 text-gray-500">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="crash">Crash</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Steps to Reproduce */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Steps to Reproduce</label>
        <Textarea
          placeholder="1. Go to...\n2. Click on...\n3. Observe..."
          className="w-full border border-gray-300 rounded-md p-2 text-gray-500 h-24"
        />
      </div>

      {/* Expected Behavior */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Expected Behavior</label>
        <Textarea
          placeholder="What should happen..."
          className="w-full border border-gray-300 rounded-md p-2 text-gray-500 h-24"
        />
      </div>

      {/* Actual Behavior */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Actual Behavior</label>
        <Textarea
          placeholder="What actually happens..."
          className="w-full border border-gray-300 rounded-md p-2 text-gray-500 h-24"
        />
      </div>

      {/* Assign To */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Assign To</label>
        <Select>
          <SelectTrigger className="w-full border border-gray-300 rounded-md p-2 text-gray-500">
            <SelectValue placeholder="Assign to developer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dev1">Developer 1</SelectItem>
            <SelectItem value="dev2">Developer 2</SelectItem>
            <SelectItem value="dev3">Developer 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md">
          Cancel
        </Button>
        <Button className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Report Bug
        </Button>
      </div>
    </div>
  );
}

export default CreateBugDialog;