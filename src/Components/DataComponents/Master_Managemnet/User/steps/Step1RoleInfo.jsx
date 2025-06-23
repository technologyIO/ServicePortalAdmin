import React from "react";
import { ChevronDown } from "lucide-react";

export default function Step1RoleInfo({
  userType,
  setUserType,
  selectedDealer,
  setSelectedDealer,
  dealerList,
  roles,
  selectedRole,
  setSelectedRole,
  errors,
  setErrors,
  fetchRolePermissions,
}) {
  const handleDealerChange = (e) => {
    const dealerId = e.target.value;
    if (dealerId === "") {
      setSelectedDealer(null);
    } else {
      const dealer = dealerList.find((d) => d._id === dealerId);
      setSelectedDealer(dealer);
    }
    // Clear the dealer error when a dealer is selected
    setErrors((prev) => ({ ...prev, dealer: undefined }));
  };

  return (
    <div className="h-[440px] overflow-y-auto">
      <div className="bg-white rounded-lg shadow-md p-6 border border-blue-100">
        <h2 className="text-xl font-semibold text-blue-900 mb-6">
          Role Information
        </h2>

        <div
          className={`grid grid-cols-1 ${
            userType === "Dealer" ? "lg:grid-cols-3" : "lg:grid-cols-2"
          } gap-6`}
        >
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              User Type <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              {["Skanray", "Dealer"].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value={type}
                    checked={userType === type}
                    onChange={(e) => {
                      setUserType(e.target.value);
                      if (e.target.value === "Dealer") {
                        const serviceEngineerRole = roles.find(
                          (role) => role.name === "Service Engineer"
                        );
                        if (serviceEngineerRole) {
                          setSelectedRole(serviceEngineerRole);
                          fetchRolePermissions(serviceEngineerRole.roleId);
                        }
                      } else {
                        setSelectedRole(null);
                      }
                      setSelectedDealer(null);
                      setErrors((prev) => ({ ...prev, dealer: undefined }));
                    }}
                    className="w-5 h-5 text-blue-700 border-blue-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-lg text-blue-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {userType === "Dealer" && (
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Dealer <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedDealer?._id || ""}
                  onChange={handleDealerChange}
                  className={`w-full px-4 py-3 border ${
                    errors.dealer ? "border-red-500" : "border-blue-200"
                  } rounded-lg appearance-none bg-white`}
                >
                  <option value="">Select dealer</option>
                  {dealerList.map((dealer) => (
                    <option key={dealer._id} value={dealer._id}>
                      {dealer.name} ({dealer.city}, {dealer.state})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
              </div>
              {errors.dealer && (
                <p className="mt-1 text-sm text-red-700">{errors.dealer}</p>
              )}
            </div>
          )}

          <div className="w-full">
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedRole?._id || ""}
                onChange={(e) => {
                  const selected = roles.find(
                    (role) => role._id === e.target.value
                  );
                  setSelectedRole(selected);
                  setErrors((prev) => ({ ...prev, role: undefined }));
                  if (selected) {
                    fetchRolePermissions(selected.roleId);
                  }
                }}
                className={`w-full px-4 py-3 border ${
                  errors.role ? "border-red-500" : "border-blue-200"
                } rounded-lg appearance-none bg-white`}
                disabled={userType === "Dealer"}
              >
                <option value="">
                  {userType === "Dealer" ? "Service Engineer" : "Select role"}
                </option>
                {(userType === "Dealer"
                  ? roles.filter((role) => role.name === "Service Engineer")
                  : roles
                ).map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
            </div>
            {errors.role && (
              <p className="mt-1 text-sm text-red-700">{errors.role}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
