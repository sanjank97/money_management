import { useEffect, useState } from "react";
import axios from "axios";

export default function AdvanceForm({ reportDate, reportId }) {
  const [entries, setEntries] = useState([{ name: "", amount: "" }]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");


  console.log("rreportId", reportId);
  // 🔄 Fetch existing advance entries when reportId is available
  useEffect(() => {
    const fetchAdvanceEntries = async () => {
      if (!reportId) return;

      try {
        const res = await axios.get(`http://localhost:5000/api/advance/${reportId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.entries?.length > 0) {
          const formatted = res.data.entries.map((e) => ({
            name: e.name,
            amount: parseFloat(e.amount),
          }));
          setEntries(formatted);
          setMessage("ℹ️ Loaded previous advance entries.");
        }
      } catch (err) {
        console.error("Failed to load advance entries:", err);
        setMessage("❌ Failed to load previous data");
      }
    };

    fetchAdvanceEntries();
  }, [reportId]);

  const handleChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = field === "amount" ? parseFloat(value) || "" : value;
    setEntries(updated);
  };

  const handleAddEntry = () => {
    setEntries([...entries, { name: "", amount: "" }]);
  };

  const handleRemoveEntry = (index) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post(
        "http://localhost:5000/api/advance",
        {
          report_date: reportDate,
          entries,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("✅ Advance entries submitted successfully");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to submit advance entries");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">💸 Advance Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Name"
              className="flex-1 border px-4 py-2 rounded-md"
              value={entry.name}
              onChange={(e) => handleChange(index, "name", e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              className="w-40 border px-4 py-2 rounded-md"
              value={entry.amount}
              onChange={(e) => handleChange(index, "amount", e.target.value)}
              required
            />
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveEntry(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✖
              </button>
            )}
          </div>
        ))}

        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={handleAddEntry}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            ➕ Add More
          </button>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Submit Advance
          </button>
        </div>

        {message && (
          <p className="mt-4 text-sm text-blue-600">{message}</p>
        )}
      </form>
    </div>
  );
}
