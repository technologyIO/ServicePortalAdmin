"use client";
import {
  ChevronDown,
  Search,
  Check,
  Building,
  Shield,
  Users,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Custom Dropdown Component
const CustomDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  searchable = false,
  displayKey = "name",
  valueKey = "_id",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = searchable
    ? options.filter((option) =>
        option[displayKey].toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedOption = options.find((opt) => opt[valueKey] === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-between hover:bg-white hover:shadow-md ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
            : isOpen
            ? "border-blue-500 bg-white shadow-lg ring-4 ring-blue-100"
            : "border-gray-200 hover:border-blue-300"
        }`}
      >
        <div className="flex items-center flex-1">
          {Icon && <Icon className="w-5 h-5 text-blue-500 mr-3" />}
          <span
            className={
              selectedOption ? "text-gray-900 font-medium" : "text-gray-500"
            }
          >
            {selectedOption ? selectedOption[displayKey] : placeholder}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {selectedOption && (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
              isOpen ? "rotate-180 text-blue-500" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu - Now positioned outside the card */}
      {isOpen && (
        <div
          className="fixed z-50 mt-2"
          style={{
            width: dropdownRef.current?.clientWidth,
            left: dropdownRef.current?.getBoundingClientRect().left,
            top:
              dropdownRef.current?.getBoundingClientRect().bottom +
              window.scrollY,
          }}
        >
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {searchable && (
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option[valueKey]}
                    onClick={() => handleSelect(option)}
                    className={`px-4 py-3 cursor-pointer transition-all duration-200 flex items-center justify-between hover:bg-blue-50 hover:text-blue-700 ${
                      selectedOption?.[valueKey] === option[valueKey]
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-center">
                      {Icon && <Icon className="w-4 h-4 mr-3 opacity-60" />}
                      <span>{option[displayKey]}</span>
                      {option.city && option.state && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({option.city}, {option.state})
                        </span>
                      )}
                    </div>
                    {selectedOption?.[valueKey] === option[valueKey] && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  const handleDealerChange = (dealer) => {
    setSelectedDealer(dealer);
    setErrors((prev) => ({ ...prev, dealer: undefined }));
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setErrors((prev) => ({ ...prev, role: undefined }));
    if (role) {
      fetchRolePermissions(role.roleId);
    }
  };

  // Filter roles based on type
  const skanrayRoles = roles.filter((role) => role.roleType === "skanray");
  const dealerRoles = roles.filter((role) => role.roleType === "dealer");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-8xl mx-auto ">
        {/* Main Form Card - Removed overflow-hidden */}
        <div className="bg-white rounded-3xl shadow-2xl border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 border-b border-gray-100">
            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-2">
                Access Control & Permissions
              </h2>
              <p className="text-gray-600">
                Configure user access and role permissions
              </p>
            </div>
          </div>

          <div className="p-8">
            {/* User Type Selection */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-800 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-600" />
                User Type <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {["Skanray", "Dealer"].map((type) => (
                  <label
                    key={type}
                    className={`relative flex items-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
                      userType === type
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl ring-2 ring-blue-200"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    <input
                      type="radio"
                      name="userType"
                      value={type}
                      checked={userType === type}
                      onChange={(e) => {
                        setUserType(e.target.value);
                        setSelectedRole(null);
                        setSelectedDealer(null);
                        setErrors((prev) => ({
                          ...prev,
                          dealer: undefined,
                          role: undefined,
                        }));
                      }}
                      className="sr-only"
                    />

                    {/* Custom Radio Button */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-300 ${
                        userType === type
                          ? "border-blue-500 bg-blue-500 shadow-lg scale-110"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {userType === type && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                      )}
                    </div>

                    <div className="flex items-center flex-1">
                      <div
                        className={`w-14 h-14 rounded-2xl mr-4 flex items-center justify-center transition-all duration-300 ${
                          userType === type
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg scale-105"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {type === "Skanray" ? (
                          <Building
                            className={`w-7 h-7 ${
                              userType === type ? "text-white" : "text-gray-500"
                            }`}
                          />
                        ) : (
                          <Shield
                            className={`w-7 h-7 ${
                              userType === type ? "text-white" : "text-gray-500"
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-xl font-bold transition-colors duration-300 block ${
                            userType === type
                              ? "text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {type}
                        </span>
                        <p
                          className={`text-sm transition-colors duration-300 ${
                            userType === type
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          {type === "Skanray"
                            ? "Internal company user with full access"
                            : "External dealer partner with limited access"}
                        </p>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {userType === type && (
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <Check
                            className="w-5 h-5 text-white"
                            strokeWidth={3}
                          />
                        </div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic Fields Based on User Type */}
            <div
              className={`grid grid-cols-1 gap-8 ${
                userType === "Dealer"
                  ? "lg:grid-cols-2"
                  : "lg:grid-cols-1 max-w-2xl mx-auto"
              }`}
            >
              {/* Dealer Selection - Only for Dealer type */}
              {userType === "Dealer" && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-blue-500" />
                    Select Dealer <span className="text-red-500 ml-1">*</span>
                  </label>

                  <CustomDropdown
                    options={dealerList}
                    value={selectedDealer?._id || ""}
                    onChange={handleDealerChange}
                    placeholder="Choose a dealer partner"
                    error={errors.dealer}
                    icon={Building}
                    searchable={true}
                    displayKey="name"
                    valueKey="_id"
                  />

                  {errors.dealer && (
                    <div className="flex items-center text-red-500 text-sm mt-2">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.dealer}
                    </div>
                  )}
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-500" />
                  {userType === "Dealer" ? "Dealer Role" : "Role"}{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <CustomDropdown
                  options={userType === "Dealer" ? dealerRoles : skanrayRoles}
                  value={selectedRole?._id || ""}
                  onChange={handleRoleChange}
                  placeholder={`Select ${
                    userType === "Dealer" ? "dealer role" : "role"
                  }`}
                  error={errors.role}
                  icon={Shield}
                  searchable={true}
                  displayKey="name"
                  valueKey="_id"
                />

                {errors.role && (
                  <div className="flex items-center text-red-500 text-sm mt-2">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.role}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
