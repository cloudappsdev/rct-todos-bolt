import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Todo } from "../types/Todo";

// const API_URL = "https://your-api.com/tasks";
const API_URL = "http://localhost:8080/api/tudus";

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (todo: Omit<Todo, "id" | "date_created" | "date_updated">) => void;
  todo?: Todo | null;
}

const initialFormState = {
  name: "",
  description: "",
  effort: "",
  pctComplete: 0,
};

export function TodoModal({ isOpen, onClose, todo }: TodoModalProps) {
  /* 
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [effort, setEffort] = useState(1);

  const [pctComplete, setPctComplete] = useState(0);
 */

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [effort, setEffort] = useState(1);

  const [pctComplete, setPctComplete] = useState(0);

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (todo) {
      setName(todo.name);
      setDescription(todo.description);
      setEffort(todo.effort);
      setPctComplete(todo.pctComplete);
    } else {
      setName("");
      setDescription("");
      setEffort(1);
      setPctComplete(0);
    }
  }, [todo, isOpen]);

  /* 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      effort,
      pct_complete: pctComplete,
      is_done: todo?.is_done || false,
    });
  };
 */

  // Generic change handler — works for all input types
  const handleChange = (e) => {
    console.log("e", "howdy", e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Build the payload — id and other server-managed fields are intentionally omitted
    const payload = {
      name: formData.name,
      description: formData.description,
      effort: Number(formData.effort),
      pctComplete: Number(formData.pctComplete),
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`, // 🔧 Add auth header if needed
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Parse error body if the API returns one, otherwise fall back to status text
        const errData = await response.json().catch(() => null);
        throw new Error(
          errData?.message ??
            `Request failed: ${response.status} ${response.statusText}`,
        );
      }

      const created = await response.json(); // The API returns the newly-created object (with its id, etc.)
      console.log("Created task:", created);

      setSuccess(true);
      setFormData(initialFormState); // Reset form after successful submission
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            {todo ? "Edit Todo" : "New Todo"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={65}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter todo name"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={65}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter description"
              />
            </div>

            <div>
              <label
                htmlFor="effort"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Effort (1-10)
              </label>
              <input
                type="number"
                id="effort"
                value={formData.effort}
                onChange={handleChange}
                min={1}
                max={10}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Effort"
              />
            </div>

            <div>
              <label
                htmlFor="pctComplete"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Percent Complete (0-100)
              </label>
              <input
                type="number"
                id="pctComplete"
                value={formData.pctComplete}
                onChange={handleChange}
                min={0}
                max={100}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Percent Complete"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isLoading ? "Saving…" : "Submit Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
