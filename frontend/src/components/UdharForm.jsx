import { useEffect, useState } from "react";
import axios from "axios";

export default function UdharForm({ reportDate, reportId, triggerRefresh  }) {
 const [entries, setEntries] = useState([{ name: "", amount: "" }]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");


  console.log("rreportId", reportId);
  // 🔄 Fetch existing advance entries when reportId is available
  useEffect(() => {
     if (!reportId) {
    setEntries([{ name: "", amount: "" }]);
    setMessage("ℹ️ No advance data available for this date.");
    return;
  }
    const fetchAdvanceEntries = async () => {
      if (!reportId) return;

      try {
        const res = await axios.get(`http://localhost:5000/api/udhar/${reportId}`, {
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
          setMessage("ℹ️ Loaded previous udhar entries.");
        }
      } catch (err) {
        console.error("Failed to load udhar entries:", err);
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

    const token = localStorage.getItem("token");

    try {
      await axios.post("http://localhost:5000/api/udhar", {
        report_date: reportDate,
        entries,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage("✅ Udhar entries submitted successfully");
      triggerRefresh();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to submit udhar entries");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-semibold mb-4">🧾 Udhar Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Name"
              className="flex-1 border px-4 py-2 rounded-md"
              value={entry.name}
              onChange={(e) => handleChange(index, "name", e.target.value)}
              
            />
            <input
              type="number"
              placeholder="Amount"
              className="w-40 border px-4 py-2 rounded-md"
              value={entry.amount}
              onChange={(e) => handleChange(index, "amount", e.target.value)}
              
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
            Submit Udhar
          </button>
        </div>

        {message && (
          <p className="mt-4 text-sm text-green-600">{message}</p>
        )}
      </form>
    </div>
  );
}
