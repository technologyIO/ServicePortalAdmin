import React, { useEffect, useState } from "react";
import axios from "axios";

const MobileComponents = ({ watch, setValue, register }) => {
  const [mobileComponents, setMobileComponents] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:5000/role/mobilecomponents")
      .then((response) => {
        setMobileComponents(response.data);
        const initialSelection = {};
        response.data.forEach((item) => {
          initialSelection[item._id] = false;
        });
        setSelectedComponents(initialSelection);
      })
      .catch((error) => {
        console.error("Error fetching mobile components:", error);
      });
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectAllMobileComponents = () => {
    const allSelected = {};
    mobileComponents.forEach((comp) => {
      allSelected[comp._id] = true;
    });
    setSelectedComponents(allSelected);
  };

  const deselectAllMobileComponents = () => {
    const noneSelected = {};
    mobileComponents.forEach((comp) => {
      noneSelected[comp._id] = false;
    });
    setSelectedComponents(noneSelected);
  };

  return (
    <div className="md:col-span-2">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Mobile Components Access <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={selectAllMobileComponents}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={deselectAllMobileComponents}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Components List */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 border border-gray-200 rounded p-2">
        {mobileComponents.map((component) => (
          <div
            key={component._id}
            className="py-3 px-2 hover:bg-blue-50 transition"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedComponents[component._id] || false}
                onChange={() => handleCheckboxChange(component._id)}
                className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <p className="text-sm text-gray-700">{component.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Rendered Separately */}
      {mobileComponents
        .filter((comp) => selectedComponents[comp._id])
        .map((component) => (
          <div
            key={component._id}
            className="bg-gray-50 p-3 rounded-md mb-2"
          >

            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-blue-800">
                Permissions for: {component.name}
              </h3>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => {
                    ["read", "write", "edit", "delete"].forEach((perm) =>
                      setValue(`mobilePermissions.${component._id}.${perm}`, true)
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
                      setValue(`mobilePermissions.${component._id}.${perm}`, false)
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
                    id={`mobile-${permission}-${component._id}`}
                    {...register(
                      `mobilePermissions.${component._id}.${permission}`
                    )}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`mobile-${permission}-${component._id}`}
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

export default MobileComponents;
