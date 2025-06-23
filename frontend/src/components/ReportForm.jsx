import { useEffect, useState } from "react";
import axios from "axios";

export default function ReportForm({ reportDate, setReportId }) {
  const [services, setServices] = useState([]);
  const [serviceAmounts, setServiceAmounts] = useState({});
  const [totals, setTotals] = useState({
    advance: 0,
    udhar: 0,
    expense: 0,
  });
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch services on first load
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/services", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServices(res.data);

        // Initialize service amounts to 0
        const initialAmounts = {};
        res.data.forEach((service) => {
          initialAmounts[service.id] = 0;
        });
        setServiceAmounts(initialAmounts);
      } catch (err) {
        console.error("Error fetching services:", err);
        setMessage("❌ Failed to load services");
      }
    };

    fetchServices();
  }, []);

  // Fetch report for selected date (after services are loaded)
  useEffect(() => {
    const fetchReportByDate = async () => {
      if (!reportDate || services.length === 0) return;

      try {
        const res = await axios.get(
          `http://localhost:5000/api/reports/${reportDate}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fill totals
        setTotals({
          advance: parseFloat(res.data.advance),
          udhar: parseFloat(res.data.udhar),
          expense: parseFloat(res.data.expense),
        });

        // Fill service amounts
        const amounts = {};
        res.data.services.forEach((s) => {
          amounts[s.service_id] = parseFloat(s.amount);
        });
        setServiceAmounts(amounts);
        console.log("res.data.id", res.data.report_id);
        setMessage("✅ Loaded existing report data");
        setReportId && setReportId(res.data.report_id);


      } catch (err) {
        if (err.response?.status === 404) {
          // No report found, clear previous values
          const emptyAmounts = {};
          services.forEach((s) => {
            emptyAmounts[s.id] = 0;
          });
          setServiceAmounts(emptyAmounts);
          setTotals({ advance: 0, udhar: 0, expense: 0 });
          setMessage("ℹ️ No report found for this date");
          setReportId && setReportId(null);
        } else {
          console.error("Fetch error:", err);
          setMessage("❌ Error loading report");
        }
      }
    };

    fetchReportByDate();
  }, [reportDate, services]);

  const handleChangeAmount = (id, value) => {
    setServiceAmounts({
      ...serviceAmounts,
      [id]: parseFloat(value) || 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post(
        "http://localhost:5000/api/reports",
        {
          report_date: reportDate,
          services: Object.entries(serviceAmounts).map(([id, amount]) => ({
            service_id: parseInt(id),
            amount,
          })),
          advance: totals.advance,
          udhar: totals.udhar,
          expense: totals.expense,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ Report submitted successfully");
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("❌ Error submitting report");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">🧾 Daily Service Report</h2>
      <p className="text-sm text-gray-600 mb-4">Report Date: {reportDate}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="flex items-center gap-4">
            <label className="w-32 font-medium">{service.name}</label>
            <input
              type="number"
              min="0"
              className="flex-1 border px-4 py-2 rounded-md"
              value={serviceAmounts[service.id] || ""}
              onChange={(e) =>
                handleChangeAmount(service.id, e.target.value)
              }
              placeholder="Enter amount"
            />
          </div>
        ))}

        {/* Totals Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium mb-1">Advance</label>
            <input
              type="number"
              className="w-full border px-4 py-2 rounded-md bg-gray-100"
              value={totals.advance}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Udhar</label>
            <input
              type="number"
              className="w-full border px-4 py-2 rounded-md bg-gray-100"
              value={totals.udhar}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Expense</label>
            <input
              type="number"
              className="w-full border px-4 py-2 rounded-md bg-gray-100"
              value={totals.expense}
              readOnly
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          Submit Report
        </button>

        {message && (
          <p className="mt-4 text-sm font-medium text-green-600">{message}</p>
        )}
      </form>
    </div>
  );
}
