import DataTable from "../components/DataTable";
import { useGetFinanceQuery } from "../store/services/api";

export default function FinancePage() {
  const { data: finance = [], isLoading, error } = useGetFinanceQuery();

  const financeColumns = [
    { key: "type", label: "Type" },
    { key: "description", label: "Description" },
    {
      key: "amount",
      label: "Amount",
      render: (v) => `$${v?.toFixed(2) || "0.00"}`,
    },
    {
      key: "date",
      label: "Date",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
    { key: "status", label: "Status" },
  ];

  // Mock data for demo if no finance data
  const mockFinance =
    finance.length > 0
      ? finance
      : [
          {
            _id: "1",
            type: "Revenue",
            description: "Hotel Bookings",
            amount: 15000,
            date: new Date(),
            status: "Completed",
          },
          {
            _id: "2",
            type: "Revenue",
            description: "Restaurant Orders",
            amount: 5500,
            date: new Date(),
            status: "Completed",
          },
          {
            _id: "3",
            type: "Revenue",
            description: "Activity Bookings",
            amount: 3200,
            date: new Date(),
            status: "Completed",
          },
          {
            _id: "4",
            type: "Expense",
            description: "Utilities",
            amount: -1200,
            date: new Date(),
            status: "Paid",
          },
          {
            _id: "5",
            type: "Expense",
            description: "Staff Salaries",
            amount: -8000,
            date: new Date(),
            status: "Paid",
          },
        ];

  if (isLoading)
    return <div className="p-6 text-center">Loading finance data...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        Error loading finance data
      </div>
    );

  const totalRevenue = mockFinance
    .filter((f) => f.type === "Revenue")
    .reduce((sum, f) => sum + f.amount, 0);
  const totalExpense = mockFinance
    .filter((f) => f.type === "Expense")
    .reduce((sum, f) => sum + Math.abs(f.amount), 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Finance Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-red-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            ${totalExpense.toFixed(2)}
          </p>
        </div>
        <div className="bg-blue-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800">Net Profit</h3>
          <p className="text-2xl font-bold text-blue-600">
            ${(totalRevenue - totalExpense).toFixed(2)}
          </p>
        </div>
      </div>

      <DataTable
        columns={financeColumns}
        data={mockFinance}
        editable={false}
        exportFilename="finance"
      />
    </div>
  );
}
