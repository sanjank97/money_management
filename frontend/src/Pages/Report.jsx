import { useState } from "react";
import ReportForm from "../components/ReportForm";
import AdvanceForm from "../components/AdvanceForm";
import ExpenseForm from "../components/ExpenseForm";
import UdharForm from "../components/UdharForm";

export default function Report() {
  const today = new Date().toISOString().split("T")[0];
  const [reportDate, setReportDate] = useState(today);
  const [reportId, setReportId] = useState(null); // store when available

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📅 Daily Report</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Report Date:
        </label>
        <input
          type="date"
          className="border px-4 py-2 rounded-md w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          max={today}
          value={reportDate}
          onChange={(e) => {
            setReportDate(e.target.value);
            setReportId(null); // clear old ID
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div>
          <ReportForm reportDate={reportDate} setReportId={setReportId} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <AdvanceForm reportDate={reportDate} reportId={reportId} />
          <UdharForm reportDate={reportDate} reportId={reportId} />
          <ExpenseForm reportDate={reportDate} reportId={reportId} />
        </div>
      </div>
    </div>
  );
}
