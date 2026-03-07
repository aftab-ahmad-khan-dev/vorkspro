import React from "react";

function Sidebar2({ isOpen, toggleSidebar }) {
  return (
    <div
      id="hs-pro-sidebar"
      className={`hs-overlay [--body-scroll:true] lg:[--overlay-backdrop:false] [--auto-close:lg] fixed inset-y-0 start-0 z-60 w-60 bg-zinc-100 dark:bg-neutral-900 transform transition-all duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:static lg:inset-0 lg:z-10 lg:block`}
      style={{ top: "3.5rem" }}
    >
      <div className="flex flex-col h-full">
        <nav className="p-3 flex-1 overflow-y-auto">
          {/* Mobile Header */}
          <div className="lg:hidden mb-3 flex justify-between items-center">
            <button className="flex items-center gap-x-1.5 py-2 px-2.5 font-medium text-xs bg-black text-white rounded-lg dark:bg-white dark:text-black">
              <svg
                className="shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z" />
              </svg>
              Ask AI
            </button>
            <button
              onClick={toggleSidebar}
              className="p-1.5 text-gray-500 dark:text-neutral-500"
            >
              <svg
                className="size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 space-y-6">
            <div>
              <span className="block ps-2.5 mb-2 font-medium text-xs uppercase text-gray-500 dark:text-neutral-500">
                Home
              </span>
              <a
                href="#"
                className="w-full flex items-center gap-x-2 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-800 dark:text-neutral-200"
              >
                Dashboard
              </a>
            </div>
            <div>
              <span className="block ps-2.5 mb-2 font-medium text-xs uppercase text-gray-500 dark:text-neutral-500">
                Pages
              </span>
              <a
                href="#"
                className="w-full flex items-center gap-x-2 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-800 dark:text-neutral-200"
              >
                Posts
              </a>
              <a
                href="#"
                className="w-full flex items-center gap-x-2 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-800 dark:text-neutral-200"
              >
                Members
              </a>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar2;
