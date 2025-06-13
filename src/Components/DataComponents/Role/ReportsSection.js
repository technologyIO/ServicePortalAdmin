import React, { useEffect, useState } from "react";
import axios from "axios";

const ReportsSection = ({ watch, setValue, register }) => {
  const [reports, setReports] = useState([]);
  const [selectedReports, setSelectedReports] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:5000/role/reports")
      .then((res) => {
        setReports(res.data);
        const initialState = {};
        res.data.forEach((report) => {
          initialState[report._id] = false;
        });
        setSelectedReports(initialState);
      })
      .catch((err) => {
        console.error("Failed to fetch reports:", err);
      });
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedReports((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectAllReports = () => {
    const allSelected = {};
    reports.forEach((report) => {
      allSelected[report._id] = true;
    });
    setSelectedReports(allSelected);
  };

  const deselectAllReports = () => {
    const noneSelected = {};
    reports.forEach((report) => {
      noneSelected[report._id] = false;
    });
    setSelectedReports(noneSelected);
  };

  return (
    <div className="md:col-span-2">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Select Reports <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={selectAllReports}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={deselectAllReports}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Report Checkboxes */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 border border-gray-200 rounded p-2">
        {reports.map((report) => (
          <div key={report._id} className="py-3 px-2 hover:bg-blue-50 transition">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedReports[report._id] || false}
                onChange={() => handleCheckboxChange(report._id)}
                className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <p className="text-sm text-gray-700">{report.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Section Outside */}
      {reports
        .filter((report) => selectedReports[report._id])
        .map((report) => (
          <div
            key={report._id}
            className="bg-gray-50 p-3 rounded-md mb-2"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-blue-800">
                Permissions for: {report.name}
              </h3>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => {
                    ["read", "write", "edit", "delete"].forEach((perm) =>
                      setValue(`reportPermissions.${report._id}.${perm}`, true)
                    );
                  }}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    ["read", "write", "edit", "delete"].forEach((perm) =>
                      setValue(`reportPermissions.${report._id}.${perm}`, false)
                    );
                  }}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                >
                  None
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {["read", "write", "edit", "delete"].map((permission) => (
                <div key={permission} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`report-${permission}-${report._id}`}
                    {...register(`reportPermissions.${report._id}.${permission}`)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`report-${permission}-${report._id}`}
                    className="ml-1 text-sm text-gray-700"
                  >
                    {permission.charAt(0).toUpperCase() + permission.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default ReportsSection;
