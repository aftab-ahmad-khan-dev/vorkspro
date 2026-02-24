// src/pages/ToDoList.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Bell,
  Circle,
  Square,
  Calendar,
  Edit3,
  Star,
  Trash2,
  CheckSquare,
  Search,
  Download,
  History,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import GlobalDialog from "@/models/GlobalDialog";
import CreateDialog from "@/models/todo/CreateDialog";
import Confirmation from "@/models/Confirmation";
import StatCard from "@/components/Stats";
import Chip from "@/components/Chip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomTooltip from "@/components/Tooltip";
import { useTabs } from "@/context/TabsContext";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/interceptor/interceptor";
import EmptyState from "@/components/EmptyState";

export default function ToDoList() {
  const [allTodos, setAllTodos] = useState([]);
  const [previousTodos, setPreviousTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previousLoading, setPreviousLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [quickInput, setQuickInput] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_APP_BASE_URL + "todo";
  const todayKey = new Date().toDateString();
  const { actions } = useTabs()
  const isSuperAdmin = actions?.isSuperAdmin || false

  const hasPermission = (moduleName, requiredAction) => {
    if (isSuperAdmin) return true;

    return actions?.modulePermissions?.some(
      (modules) => {
        const currentModule = modules.module == moduleName
        if (currentModule == true) {
          return modules.actions.includes(requiredAction)
        }
      }
    );
  };

  // Fetch all todos
  const fetchAllTodos = async () => {
    setLoading(true);
    try {
      const data = await apiGet('todo/get-all');
      if (data.isSuccess) {
        setAllTodos(data?.filteredData?.todos || []);
      } else {
        toast.error(data.message || "Failed to load tasks");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch previous todos (completed + overdue)
  const fetchPreviousTodos = async () => {
    if (activeTab !== "Previous") return;
    setPreviousLoading(true);
    try {
      const data = await apiGet('todo/get-previous');
      if (data.isSuccess) {
        setPreviousTodos(data?.filteredData?.todos || []);
      } else {
        toast.error("Failed to load previous tasks");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setPreviousLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTodos();
  }, []);

  useEffect(() => {
    if (activeTab === "Previous") {
      fetchPreviousTodos();
    }
  }, [activeTab]);

  const handleQuickAdd = async (e) => {
    if (e.key === "Enter" && quickInput.trim()) {
      try {
        const data = await apiPost('todo/create', { title: quickInput.trim() });
        if (data.isSuccess) {
          setAllTodos((prev) => [data.todo, ...prev]);
          setQuickInput("");
          toast.success("Task added!");
        }
      } catch (err) {
        toast.error("Failed to add task");
      }
    }
  };

  const toggleComplete = async (todo) => {
    try {
      await apiPatch(`todo/update/${todo._id}`, { isCompleted: !todo.isCompleted });
      setAllTodos((prev) =>
        prev.map((t) =>
          t._id === todo._id ? { ...t, isCompleted: !t.isCompleted } : t
        )
      );
      if (activeTab === "Previous") fetchPreviousTodos();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  // const toggleImportant = async (todo) => {
  //   try {
  //     await fetch(`${baseUrl}/update/${todo._id}`, {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ isImportant: !todo.isImportant }),
  //     });
  //     setAllTodos((prev) =>
  //       prev.map((t) =>
  //         t._id === todo._id ? { ...t, isImportant: !t.isImportant } : t
  //       )
  //     );
  //   } catch (err) {
  //     toast.error("Update failed");
  //   }
  // };

  const handleEdit = (todo) => {
    setSelectedTodo(todo);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = (todo) => {
    setSelectedTodo(todo);
    setOpenConfirmDialog(true);
  };

  function createRipple(event) {
    const button = event.currentTarget;

    const ripple = document.createElement("span");
    const size = Math.max(button.clientWidth, button.clientHeight);
    const rect = button.getBoundingClientRect();

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

    ripple.className = "ripple-effect";

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 500);
  }

  const confirmDelete = async () => {
    try {
      const data = await apiDelete(`todo/delete/${selectedTodo._id}`);
      if (data.isSuccess) {
        toast.success("Task deleted");
        setAllTodos((prev) => prev.filter((t) => t._id !== selectedTodo._id));
        if (activeTab === "Previous") fetchPreviousTodos();
      }
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setOpenConfirmDialog(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No due date";

    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();


    const datePart = isToday
      ? "Today"
      : d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric", // ALWAYS show year
      });

    const timePart = d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${datePart} at ${timePart}`;
  };

  // Replace this entire useMemo block
  const filteredAndSortedTodos = useMemo(() => {
    let list = activeTab === "Previous" ? previousTodos : allTodos;

    // 1. Apply search filter
    if (searchTerm) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Apply tab filters
    if (activeTab === "Today") {
      list = list.filter(
        (t) => t.dueDate && new Date(t.dueDate).toDateString() === todayKey
      );
    } else if (activeTab === "Upcoming") {
      const now = new Date();
      list = list.filter((t) => t.dueDate && new Date(t.dueDate) > now);
    } else if (activeTab === "Important") {
      list = list.filter((t) => t.isImportant);
    } else if (activeTab === "Completed") {
      list = list.filter((t) => t.isCompleted);
    }
    // "All" and "Previous" keep full list (after search)

    // 3. Sort logic
    return [...list].sort((a, b) => {
      // Priority order: high > medium > low
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const prioA = priorityOrder[a.priority?.toLowerCase()] || 0;
      const prioB = priorityOrder[b.priority?.toLowerCase()] || 0;

      // First: dueDate (null = no due date → push to bottom)
      const dateA = a.dueDate ? new Date(a.dueDate) : null;
      const dateB = b.dueDate ? new Date(b.dueDate) : null;

      if (!dateA && !dateB) {
        // Both have no due date → sort by priority
        if (prioA !== prioB) return prioB - prioA;
        return 0;
      }
      if (!dateA) return 1; // a has no date → push down
      if (!dateB) return -1; // b has no date → push down

      // Both have dates
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB; // earliest first
      }

      // Same due date → sort by priority
      if (prioA !== prioB) {
        return prioB - prioA; // high first
      }

      return 0;
    });
  }, [allTodos, previousTodos, activeTab, searchTerm, todayKey]);

  const stats = useMemo(
    () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return {
        today: allTodos.filter((t) => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          return dueDate >= today && dueDate < tomorrow;
        }).length,
        upcoming: allTodos.filter((t) => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          return dueDate > now;
        }).length,
        completed: allTodos.filter((t) => t.isCompleted).length,
        important: allTodos.filter((t) => t.isImportant).length,
      };
    },
    [allTodos]
  );

  const activeReminders = allTodos
    .filter((t) => t.isRemainderSet && !t.isCompleted)
    .slice(0, 3);

  const TaskCard = ({ todo }) => {
    const muted = todo.isCompleted ? "opacity-30" : "";
    return (
      <div className="rounded-xl border border-[var(--border)] bg-border/20 p-5 hover:shadow-sm transition">
        <div className="flex flex-col gap-4 md:grid md:grid-cols-[32px_1fr_auto] md:items-start">
          <button
            onClick={(e) => {
              createRipple(e);
              toggleComplete(todo);
            }}
            className={`
    relative overflow-hidden
    flex items-center justify-center
    w-7 h-7 rounded-md 
    transition-all duration-100
    ${todo.isCompleted ? "bg-[var(--button)]/20 " : ""}
  `}
          >
            {/* Icon */}
            {todo.isCompleted ? (
              <CheckSquare
                size={16}
                className="text-[var(--button)] cursor-pointer"
              />
            ) : (
              <Square size={16} className="text-gray-400 cursor-pointer" />
            )}
          </button>

          <div className={`space-y-3 ${muted}`}>
            <div className="flex items-start gap-3">
              {todo.isImportant && (
                <button disabled={todo.isCompleted}>
                  <Star
                    size={20}
                    fill="currentColor"
                    className="text-yellow-500"
                  />
                </button>
              )}

              <div className="flex-1">
                <h3
                  className={`font-semibold text-foreground text-lg ${todo.isCompleted ? "line-through" : ""
                    }`}
                >
                  {todo.title}
                </h3>
                {/* {todo.description && ( */}
                <p
                  className={`${todo?.isImportant ? "-ml-7" : ""
                    }  text-sm text-[var(--muted-foreground)] mt-1 ${todo.isCompleted ? "line-through" : ""
                    }`}
                >
                  {todo.description || "No description provided"}
                </p>
                {/* )} */}
                <div className="flex -ml-7 flex-wrap gap-2 mt-3">
                  {todo.category && (
                    <Chip
                      className={
                        "bg-transparent border border-[var(--border)] text-xs"
                      }
                      status={todo.category}
                    />
                  )}
                  {todo.tags?.map((tag) => (
                    <Chip key={tag} status={tag} />
                  ))}
                </div>
                <div className="flex flex-wrap -ml-7 items-center gap-4 text-sm mt-3">
                  {todo.dueDate && (
                    <span className="flex items-center gap-2 text-[var(--muted-foreground)]">
                      <Calendar size={16} />
                      {formatDate(todo.dueDate)}
                    </span>
                  )}
                  {todo.isRemainderSet && (
                    <span className="flex items-center gap-2 text-orange-600">
                      <Bell size={16} />
                      Reminder set
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Chip status={todo.priority} />
            <div className="flex gap-2">
              {hasPermission("My To-Do Hub", "Edit Records") && (
                <CustomTooltip tooltipContent={!todo.isCompleted ? "Update Todo" : "Not Available"}>
                  <button
                    onClick={() => !todo.isCompleted && handleEdit(todo)}
                    disabled={todo.isCompleted}
                    className={`p-2 rounded-lg disabled:text-green-500 transition ${todo.isCompleted
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-green-500/10 text-green-600 cursor-pointer"
                      }`}
                  >
                    <Edit3 size={17} />
                  </button>
                </CustomTooltip>
              )}

              {hasPermission("My To-Do Hub", "Delete Records") && (
                <CustomTooltip tooltipContent="Delete Todo">
                  <button
                    onClick={() => handleDelete(todo)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-600 transition cursor-pointer"
                  >
                    <Trash2 size={17} />
                  </button>
                </CustomTooltip>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isLoading = activeTab === "Previous" ? previousLoading : loading;

  return (
    <div className="min-h-screen w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl text-foreground font-bold">
            My To-Do & Reminders
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Stay organized and never miss a task
          </p>
        </div>
        {hasPermission("My To-Do Hub", "Create Records") && (
          <Button
            onClick={() => {
              setEditMode(false);
              setSelectedTodo(null);
              setOpenDialog(true);
            }}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Plus size={19} className="mr-2" /> Add Task
          </Button>
        )}
      </div>

      {/* Quick Add */}
      {hasPermission("My To-Do Hub", "Create Records") && (
        <div className="border border-[var(--border)] rounded-xl p-5 mb-8 ">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 border border-[var(--border)] rounded-lg px-4 py-3 bg-background">
              <Plus size={19} className="text-gray-500" />
              <input
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                onKeyDown={handleQuickAdd}
                placeholder="Quick add task... (Press Enter)"
                className="flex-1 text-foreground outline-none bg-transparent placeholder:text-[var(--muted-foreground)]"
              />
            </div>
            <Button
              className={"mt-2"}
              onClick={() =>
                quickInput.trim() && handleQuickAdd({ key: "Enter" })
              }
            >
              Add Task
            </Button>
          </div>
        </div>
      )}


      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard
          title="Due Today"
          isLoading={loading}
          value={stats.today}
          valueClass="text-orange-600"
        />
        <StatCard
          title="Upcoming"
          isLoading={loading}
          value={stats.upcoming}
          valueClass="text-blue-600"
        />
        <StatCard
          title="Completed"
          isLoading={loading}
          value={stats.completed}
          valueClass="text-green-600"
        />
        <StatCard
          title="Important"
          isLoading={loading}
          value={stats.important}
          valueClass="text-yellow-600"
        />
      </div>

      {/* Tabs + Search */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="sm:grid hidden grid-cols-6 w-full max-w-lg rounded-2xl bg-border/50 p-1">
              <TabsTrigger
                value="Previous"
                className="rounded-xl flex items-center gap-1"
              >
                <History size={16} />
                Previous
              </TabsTrigger>
              {["All", "Today", "Upcoming", "Important", "Completed"].map(
                (tab) => (
                  <TabsTrigger key={tab} value={tab} className="rounded-xl">
                    {tab === "Important" ? "Starred" : tab}
                  </TabsTrigger>
                )
              )}
            </TabsList>

            <div className="sm:hidden flex text-[var(--foreground)] w-46 mb-3">
              <Select
                className="w-full"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <SelectTrigger className="w-full border rounded-lg px-3 py-2 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Today">Today</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Important">Important</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Tabs>

          <div className="flex gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-initial">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full text-foreground lg:w-64"
              />
            </div>
            {hasPermission("My To-Do Hub", "Export Data") && (
              <Button className="border-button">
                <Download size={17} className="mr-2" /> Export
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-border/20 p-6 animate-pulse"
            >
              <div className="h-6 bg-border rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-border rounded w-1/2"></div>
            </div>
          ))
        ) : filteredAndSortedTodos.length === 0 ? (
          // <div className=" text-center py-16 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--muted-foreground)]">
          //   {activeTab === "Previous" ? (
          //     <History className="mx-auto mb-4 opacity-50" size={48} />
          //   ) : (
          //     <CheckSquare className="mx-auto mb-4 opacity-50" size={48} />
          //   )}
          //   <p className="text-lg font-medium">
          //     {activeTab === "Previous"
          //       ? "No previous tasks"
          //       : "No tasks found"}
          //   </p>
          //   <p className="text-sm mt-2">
          //     {activeTab === "Previous"
          //       ? "Completed and overdue tasks will appear here"
          //       : "Try creating a task or changing filters"}
          //   </p>
          // </div>
          <EmptyState icon={activeTab == 'Previous' ? History : CheckSquare} title={activeTab == 'Previous' ? "No previous tasks" : "No tasks found"} subtitle="Try creating a task or changing filters"></EmptyState>
        ) : (
          filteredAndSortedTodos.map((todo) => (
            <TaskCard key={todo._id} todo={todo} />
          ))
        )}
      </div>

      {/* Dialogs */}
      <GlobalDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        label={editMode ? "Edit Task" : "Create New Task"}
      >
        <CreateDialog
          todo={editMode ? selectedTodo : null}
          onSuccess={(newTodo) => {
            setOpenDialog(false);
            if (editMode) {
              setAllTodos((prev) =>
                prev.map((t) => (t._id === newTodo._id ? newTodo : t))
              );
              if (activeTab === "Previous") fetchPreviousTodos();
            } else {
              setAllTodos((prev) => [newTodo, ...prev]);
            }
          }}
        />
      </GlobalDialog>

      <Confirmation
        open={openConfirmDialog}
        title="Delete Task"
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={confirmDelete}
        name={selectedTodo?.title || ""}
      />
    </div>
  );
}
