// OnCallApprovalList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";

// Show a loader while fetching
function Loader() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <span className="CustomLoader"></span>
    </div>
  );
}

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export default function OnCallApproval() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCustomersWithOnCalls() {
      setLoading(true);
      try {
        // Get all onCalls (>5% discount) and group by customer
        const res = await api.get("/phone/oncall/pagecall?limit=1000");
        const rawData = Array.isArray(res.data?.data) ? res.data.data : [];

        // Filter for discount > 5%
        const filtered = rawData.filter(
          (item) =>
            typeof item.discountPercentage === "number" &&
            item.discountPercentage > 5
        );

        // Group by customer.customercodeid
        const grouped = {};
        filtered.forEach((oncall) => {
          const custId = oncall.customer?.customercodeid || "unknown";
          if (!grouped[custId]) {
            grouped[custId] = {
              customer: oncall.customer,
              oncalls: [],
            };
          }
          grouped[custId].oncalls.push(oncall);
        });

        const customerList = Object.values(grouped);
        setCustomers(customerList);
        setFilteredCustomers(customerList);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
        setFilteredCustomers([]);
      }
      setLoading(false);
    }
    fetchCustomersWithOnCalls();
  }, []);

  // Handle search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const searchFiltered = customers.filter(
      ({ customer, oncalls }) =>
        customer?.customername?.toLowerCase().includes(query) ||
        customer?.city?.toLowerCase().includes(query) ||
        oncalls.some((oncall) =>
          oncall.onCallNumber?.toLowerCase().includes(query)
        )
    );
    setFilteredCustomers(searchFiltered);
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (loading) return <Loader />;

  if (!filteredCustomers.length)
    return (
      <div className="text-center py-16 text-lg font-semibold text-gray-400">
        {searchQuery
          ? "No customers found matching your search."
          : "No on-calls with discount > 5% found."}
      </div>
    );

  return (
    <div className="p-6">
      <div className="text-2xl font-bold mb-6 text-blue-700">
        Customer OnCall Approval
      </div>

      {/* Search Section */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex gap-3 justify-center">
          <FormControl sx={{ flex: 1 }} size="sm">
            <Input
              size="sm"
              placeholder="Search customers, cities, or OnCall numbers..."
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </FormControl>
          <button
            onClick={handleSearch}
            type="button"
            className="text-white w-full px-5 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center"
          >
            Search
          </button>
        </div>
      </div>

      <table className="w-full border caption-bottom text-md bg-white rounded shadow">
        <thead>
          <tr className="bg-blue-700 text-white">
            <th className="p-3 font-bold">OnCall</th>
            <th className="p-3 font-bold">Product</th>
            <th className="p-3 font-bold">Customer Name</th>
            <th className="p-3 font-bold">City</th>
            <th className="p-3 font-bold">Status</th>
            <th className="p-3 font-bold">Discount %</th>
            <th className="p-3 font-bold">OnCall Date</th>
            <th className="p-3 font-bold">Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredCustomers.map(({ customer, oncalls }) =>
            // हर OnCall के लिए अलग row बनाएं
            oncalls.map((oncall, oncallIndex) => (
              <tr
                key={`${customer.customercodeid}-${oncall._id}-${oncallIndex}`}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-3 font-semibold capitalize">
                  {oncall?.onCallNumber || "--"}
                </td>
                <td className="p-3 font-semibold capitalize">
                  {oncall?.productGroups?.[0]?.productPartNo ||
                    oncall?.complaint?.materialdescription ||
                    "--"}
                </td>
                <td className="p-3 font-semibold capitalize">
                  {customer?.customername || "--"}
                </td>
                <td className="p-3">{customer?.city || "--"}</td>
                <td className="p-3 text-center">1</td>
                <td className="p-3 text-center">
                  {oncall?.discountPercentage || 0}%
                </td>
                <td className="p-3">
                  {moment(oncall?.createdAt).format("D MMM YYYY")}
                </td>
                <td className="p-3">
                  <button
                    className="bg-blue-700 text-white px-4 py-1 rounded font-bold hover:bg-blue-800 transition-colors"
                    onClick={() =>
                      navigate(`/on-call/customer/${customer.customercodeid}`)
                    }
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
