import React from "react";

export default function Step2UserDetails({
  formData,
  handleInputChange,
  errors,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-blue-100">
      <h2 className="text-xl font-semibold text-blue-900 mb-6">User Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${
              errors.firstName ? "border-red-500" : "border-blue-200"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-700">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${
              errors.lastName ? "border-red-500" : "border-blue-200"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-700">{errors.lastName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${
              errors.email ? "border-red-500" : "border-blue-200"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-700">{errors.email}</p>
          )}
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Mobile <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${
              errors.mobile ? "border-red-500" : "border-blue-200"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter Mobile number"
          />
          {errors.mobile && (
            <p className="mt-1 text-sm text-red-700">{errors.mobile}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="employeeid"
            value={formData.employeeid}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${
              errors.employeeid ? "border-red-500" : "border-blue-200"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter Employee Id"
          />
          {errors.employeeid && (
            <p className="mt-1 text-sm text-red-700">{errors.employeeid}</p>
          )}
        </div>
        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${
              errors.password ? "border-red-500" : "border-blue-200"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter Password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-700">{errors.password}</p>
          )}
        </div>

        {/* Manager Email */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Manager Email <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="manageremail"
            value={formData.manageremail}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${
              errors.manageremail ? "border-red-500" : "border-blue-200"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter Manager Email"
          />
          {errors.manageremail && (
            <p className="mt-1 text-sm text-red-700">{errors.manageremail}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Profile Image
          </label>
          <input
            type="text"
            name="profileimage"
            value={formData.profileimage}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${
              errors.profileimage ? "border-red-500" : "border-blue-200"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter Profile Image "
          />
          {errors.profileimage && (
            <p className="mt-1 text-sm text-red-700">{errors.profileimage}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Login Expiry Date
          </label>
          <input
            type="date"
            name="loginexpirydate"
            value={formData.loginexpirydate}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${
              errors.loginexpirydate ? "border-red-500" : "border-blue-200"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter Mobile number"
          />
          {errors.loginexpirydate && (
            <p className="mt-1 text-sm text-red-700">
              {errors.loginexpirydate}
            </p>
          )}
        </div>
        {/* <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Device Id
          </label>
          <input
            type="text"
            name="deviceid"
            value={formData.deviceid}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${
              errors.deviceid ? "border-red-500" : "border-blue-200"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter Device Id"
          />
          {errors.deviceid && (
            <p className="mt-1 text-sm text-red-700">{errors.deviceid}</p>
          )}
        </div> */}
        {/* <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Device Registered Date
          </label>
          <input
            type="date"
            name="deviceregistereddate"
            value={formData.deviceregistereddate}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${
              errors.deviceregistereddate ? "border-red-500" : "border-blue-200"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter Manager Email"
          />
          {errors.deviceregistereddate && (
            <p className="mt-1 text-sm text-red-700">
              {errors.deviceregistereddate}
            </p>
          )}
        </div> */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Zip Code
          </label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${
              errors.zipCode ? "border-red-500" : "border-blue-200"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter zip code"
          />
          {errors.zipCode && (
            <p className="mt-1 text-sm text-red-700">{errors.zipCode}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Department
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter Department"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter full address"
          />
        </div>
      </div>
    </div>
  );
}
