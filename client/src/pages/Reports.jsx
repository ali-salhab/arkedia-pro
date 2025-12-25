import DataTable from "../components/DataTable";
import { useGetReportsQuery } from "../store/services/api";

export default function ReportsPage() {
  const { data: reports = [], isLoading, error } = useGetReportsQuery();

  const reportColumns = [
    { key: "name", label: "Report Name" },
    { key: "type", label: "Type" },
    { key: "period", label: "Period" },
    {
      key: "generatedAt",
      label: "Generated",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
    { key: "status", label: "Status" },
  ];

  // Mock data for demo if no reports data
  const mockReports =
    reports.length > 0
      ? reports
      : [
          {
            _id: "1",
            name: "Monthly Bookings Report",
            type: "Bookings",
            period: "December 2025",
            generatedAt: new Date(),
            status: "Ready",
          },
          {
            _id: "2",
            name: "Revenue Summary Q4",
            type: "Finance",
            period: "Q4 2025",
            generatedAt: new Date(),
            status: "Ready",
          },
          {
            _id: "3",
            name: "Occupancy Rate Analysis",
            type: "Analytics",
            period: "November 2025",
            generatedAt: new Date(),
            status: "Ready",
          },
          {
            _id: "4",
            name: "Customer Satisfaction",
            type: "Feedback",
            period: "H2 2025",
            generatedAt: new Date(),
            status: "Processing",
          },
        ];

  if (isLoading)
    return <div className="p-6 text-center">Loading reports...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">Error loading reports</div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-indigo-100 rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-indigo-800">Total Reports</h3>
          <p className="text-2xl font-bold text-indigo-600">
            {mockReports.length}
          </p>
        </div>
        <div className="bg-green-100 rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-green-800">Ready</h3>
          <p className="text-2xl font-bold text-green-600">
            {mockReports.filter((r) => r.status === "Ready").length}
          </p>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-yellow-800">Processing</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {mockReports.filter((r) => r.status === "Processing").length}
          </p>
        </div>
        <div className="bg-purple-100 rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-purple-800">This Month</h3>
          <p className="text-2xl font-bold text-purple-600">2</p>
        </div>
      </div>

      <DataTable
        columns={reportColumns}
        data={mockReports}
        editable={false}
        exportFilename="reports"
      />
    </div>
  );
}
