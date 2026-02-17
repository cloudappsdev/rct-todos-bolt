import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, X } from "lucide-react";
import { TodoModal } from "./components/TodoModal";
import type { Todo } from "./types/Todo";

type SortField = "name" | "effort" | "pct_complete" | "date_updated";
type SortDirection = "asc" | "desc";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [sortField, setSortField] = useState<SortField>("date_updated");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/tudus");
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTodos = [...todos].sort((a, b) => {
    let aVal: string | number = a[sortField];
    let bVal: string | number = b[sortField];

    if (sortField === "date_updated") {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleToggleDone = async (todo: Todo) => {
    const { error } = await supabase
      .from("todos")
      .update({
        is_done: !todo.is_done,
        date_updated: new Date().toISOString(),
      })
      .eq("id", todo.id);

    if (error) {
      console.error("Error updating todo:", error);
    } else {
      fetchTodos();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);
    } else {
      fetchTodos();
    }
  };

  const handleSubmit = async (
    todoData: Omit<Todo, "id" | "date_created" | "date_updated">,
  ) => {
    if (editingTodo) {
      const { error } = await supabase
        .from("todos")
        .update({
          ...todoData,
          date_updated: new Date().toISOString(),
        })
        .eq("id", editingTodo.id);

      if (error) {
        console.error("Error updating todo:", error);
      }
    } else {
      const { error } = await supabase.from("todos").insert([
        {
          ...todoData,
          date_created: new Date().toISOString(),
          date_updated: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error creating todo:", error);
      }
    }

    setIsModalOpen(false);
    setEditingTodo(null);
    fetchTodos();
  };

  const handleNewTodo = () => {
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const SortButton = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
    >
      {label}
      <div className="flex flex-col">
        <ArrowUp
          size={14}
          className={`-mb-1 ${sortField === field && sortDirection === "asc" ? "text-blue-600" : "text-gray-400"}`}
        />
        <ArrowDown
          size={14}
          className={
            sortField === field && sortDirection === "desc"
              ? "text-blue-600"
              : "text-gray-400"
          }
        />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {loading && <h1>Loading!</h1>}
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Todo Manager
          </h1>
          <button
            onClick={handleNewTodo}
            className="px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-sm"
          >
            New
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-4 bg-gray-50 border-b border-gray-200 font-medium">
            <div className="flex items-center">
              <span className="text-sm font-semibold text-gray-700">
                Actions
              </span>
            </div>
            <div>
              <SortButton field="name" label="Details" />
            </div>
            <div className="text-center">
              <SortButton field="effort" label="Effort" />
            </div>
            <div className="text-center">
              <SortButton field="pct_complete" label="% Complete" />
            </div>
            <div>
              <SortButton field="date_updated" label="Last Updated" />
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {sortedTodos.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No todos yet. Click "New" to create your first todo!
              </div>
            ) : (
              sortedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-4 hover:bg-gray-50 transition-colors items-start"
                >
                  <div className="flex flex-col gap-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={todo.is_done}
                        onChange={() => handleToggleDone(todo)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Done</span>
                    </label>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <X size={14} />
                      Delete
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {todo.name}
                      </h3>
                      <div
                        className={`w-5 h-5 rounded-full ${
                          todo.is_done ? "bg-black" : "bg-green-500"
                        }`}
                        title={todo.is_done ? "Completed" : "In Progress"}
                      />
                    </div>
                    <p className="text-gray-600">
                      {todo.description || "No description"}
                    </p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleEditTodo(todo)}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="text-center pt-1">
                    <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                      {todo.effort}
                    </span>
                  </div>

                  <div className="text-center pt-1">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-gray-800">
                        {todo.pct_complete}%
                      </span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${todo.pct_complete}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      {formatDateTime(todo.date_updated)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <TodoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTodo(null);
        }}
        onSubmit={handleSubmit}
        todo={editingTodo}
      />
    </div>
  );
}

export default App;
