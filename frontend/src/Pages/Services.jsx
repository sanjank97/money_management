import { useEffect, useState } from "react";
import axios from "axios";

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState("");
  const [editingService, setEditingService] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

 const fetchServices = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/services?all=true", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setServices(res.data);
  } catch (err) {
    console.error("Error fetching services:", err);
    setMessage("❌ Failed to load services");
  }
};
  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreate = async () => {
    if (!newService.trim()) return;
    try {
      await axios.post(
        "http://localhost:5000/api/services",
        { name: newService },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewService("");
      setMessage("✅ Service created");
      fetchServices();
    } catch (err) {
      console.error("Create error:", err);
      setMessage("❌ Failed to create service");
    }
  };

  const handleEdit = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/services/${id}`,
        { name: editValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingService(null);
      setMessage("✅ Service updated");
      fetchServices();
    } catch (err) {
      console.error("Update error:", err);
      setMessage("❌ Failed to update service");
    }
  };

  const handleToggle = async (id, enable) => {
    try {
      const url = `http://localhost:5000/api/services/${id}/${enable ? "enable" : "disable"}`;
      await axios.put(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(`✅ Service ${enable ? "enabled" : "disabled"}`);
      fetchServices();
    } catch (err) {
      console.error("Toggle error:", err);
      setMessage("❌ Failed to update status");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">⚙️ Service Management</h2>

      {/* Create new service */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="New service name"
          value={newService}
          onChange={(e) => setNewService(e.target.value)}
          className="flex-1 border px-4 py-2 rounded-md"
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          ➕ Add Service
        </button>
      </div>

      {/* Service list */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left">Service Name</th>
            <th className="py-2 px-4 text-left">Status</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr
              key={service.id}
              className={`border-t ${!service.is_active ? "bg-gray-100 text-gray-500 italic" : ""}`}
            >
              <td className="px-4 py-2">
                {editingService === service.id ? (
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                ) : (
                  service.name
                )}
              </td>
              <td className="px-4 py-2">
                {service.is_active ? "Active" : "Disabled"}
              </td>
              <td className="px-4 py-2 flex gap-2 justify-center">
                {editingService === service.id ? (
                  <button
                    onClick={() => handleEdit(service.id)}
                    className="text-green-600 font-semibold"
                  >
                    ✅ Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingService(service.id);
                      setEditValue(service.name);
                    }}
                    className="text-blue-600"
                  >
                    ✏️ Edit
                  </button>
                )}
                <button
                  onClick={() =>
                    handleToggle(service.id, !service.is_active)
                  }
                  className={service.is_active ? "text-red-600" : "text-green-600"}
                >
                  {service.is_active ? "🚫 Disable" : "✅ Enable"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {message && (
        <div className="mt-4 text-sm text-blue-600 font-medium">{message}</div>
      )}
    </div>
  );
}
