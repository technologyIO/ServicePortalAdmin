"use client";
import { useState } from "react";
import { Upload, X, User, Mail, Phone, Building, Calendar, MapPin, Home, Users } from 'lucide-react';

export default function Step2UserDetails({
  formData,
  handleInputChange,
  errors,
  setFormData,
}) {
  const [newManagerEmail, setNewManagerEmail] = useState("");
  const [previewImage, setPreviewImage] = useState(formData.profileimage || "");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e) => {
    handleImageChange(e);
  };

  const removeImage = () => {
    const syntheticEvent = {
      target: {
        files: [],
        name: "profileimage",
      },
    };
    handleImageChange(syntheticEvent);
    setPreviewImage("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const syntheticEvent = {
          target: {
            files: [file],
            name: "profileimage",
          },
        };
        handleImageChange(syntheticEvent);
      }
    }
  };

  const managerEmails = Array.isArray(formData.manageremail)
    ? formData.manageremail
    : formData.manageremail
    ? [formData.manageremail]
    : [];

  const handleAddManagerEmail = () => {
    if (newManagerEmail && !managerEmails.includes(newManagerEmail)) {
      const updatedEmails = [...managerEmails, newManagerEmail];
      handleInputChange({
        target: {
          name: "manageremail",
          value: updatedEmails,
        },
      });
      setNewManagerEmail("");
    }
  };

  const handleRemoveManagerEmail = (emailToRemove) => {
    const updatedEmails = managerEmails.filter(
      (email) => email !== emailToRemove
    );
    handleInputChange({
      target: {
        name: "manageremail",
        value: updatedEmails,
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddManagerEmail();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData((prev) => ({
        ...prev,
        profileimage: file,
      }));
    } else {
      // Handle remove case
      setPreviewImage("");
      setFormData((prev) => ({
        ...prev,
        profileimage: null,
      }));
    }
  };

  // Function to get the correct image source
  const getImageSrc = () => {
    if (previewImage) {
      return previewImage;
    }
    if (formData.profileimage) {
      // If it's a File object (new upload)
      if (formData.profileimage instanceof File) {
        return URL.createObjectURL(formData.profileimage);
      }
      // If it's a string path (existing image from API)
      if (typeof formData.profileimage === 'string') {
        return `${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}${formData.profileimage}`;
      }
    }
    return "/placeholder.svg?height=160&width=160";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-8xl mx-auto ">
        <div className="bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 border-b border-gray-100">
            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-2">
                Personal Information
              </h2>
              <p className="text-gray-600">Please fill in your personal details</p>
            </div>
          </div>
          
          <div className="p-8">
            {/* Personal Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* First Name */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-blue-500" />
                  First Name <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl transition-all duration-300 focus:outline-none focus:bg-white focus:scale-[1.02] ${
                      errors.firstName
                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <div className="absolute -bottom-6 left-0 flex items-center text-red-500 text-xs">
                      <X className="w-3 h-3 mr-1" />
                      {errors.firstName}
                    </div>
                  )}
                </div>
              </div>

              {/* Last Name */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-blue-500" />
                  Last Name <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl transition-all duration-300 focus:outline-none focus:bg-white focus:scale-[1.02] ${
                      errors.lastName
                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <div className="absolute -bottom-6 left-0 flex items-center text-red-500 text-xs">
                      <X className="w-3 h-3 mr-1" />
                      {errors.lastName}
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-blue-500" />
                  Email <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl transition-all duration-300 focus:outline-none focus:bg-white focus:scale-[1.02] ${
                      errors.email
                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <div className="absolute -bottom-6 left-0 flex items-center text-red-500 text-xs">
                      <X className="w-3 h-3 mr-1" />
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-blue-500" />
                  Mobile <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl transition-all duration-300 focus:outline-none focus:bg-white focus:scale-[1.02] ${
                      errors.mobile
                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                    placeholder="Enter mobile number"
                  />
                  {errors.mobile && (
                    <div className="absolute -bottom-6 left-0 flex items-center text-red-500 text-xs">
                      <X className="w-3 h-3 mr-1" />
                      {errors.mobile}
                    </div>
                  )}
                </div>
              </div>

              {/* Employee ID */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Building className="w-4 h-4 mr-2 text-blue-500" />
                  Employee ID <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="employeeid"
                    value={formData.employeeid}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl transition-all duration-300 focus:outline-none focus:bg-white focus:scale-[1.02] ${
                      errors.employeeid
                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                    placeholder="Enter employee ID"
                  />
                  {errors.employeeid && (
                    <div className="absolute -bottom-6 left-0 flex items-center text-red-500 text-xs">
                      <X className="w-3 h-3 mr-1" />
                      {errors.employeeid}
                    </div>
                  )}
                </div>
              </div>

              {/* Department */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Building className="w-4 h-4 mr-2 text-blue-500" />
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl transition-all duration-300 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:scale-[1.02]"
                  placeholder="Enter department"
                />
              </div>
            </div>

            {/* Manager Email Section */}
            <div className="mb-8">
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-3 text-blue-600" />
                  Manager Email(s) <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      value={newManagerEmail}
                      onChange={(e) => setNewManagerEmail(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={`w-full px-4 py-4 bg-white border-2 rounded-2xl transition-all duration-300 focus:outline-none focus:scale-[1.02] ${
                        errors.manageremail
                          ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      }`}
                      placeholder="Enter manager email address"
                    />
                    <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddManagerEmail}
                    className="px-6 py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Email
                  </button>
                </div>
                {errors.manageremail && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center">
                    <X className="w-4 h-4 text-red-500 mr-2" />
                    <p className="text-sm text-red-600">
                      {errors.manageremail}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  {managerEmails.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm border border-blue-200 transition-all duration-300 hover:shadow-md"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveManagerEmail(email)}
                        className="ml-3 text-blue-600 hover:text-red-600 font-bold transition-colors duration-200 hover:scale-110 transform"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Login Expiry Date */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  Login Expiry Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="loginexpirydate"
                    value={formData.loginexpirydate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl transition-all duration-300 focus:outline-none focus:bg-white focus:scale-[1.02] ${
                      errors.loginexpirydate
                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                  />
                  {errors.loginexpirydate && (
                    <div className="absolute -bottom-6 left-0 flex items-center text-red-500 text-xs">
                      <X className="w-3 h-3 mr-1" />
                      {errors.loginexpirydate}
                    </div>
                  )}
                </div>
              </div>

              {/* Zip Code */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                  Zip Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl transition-all duration-300 focus:outline-none focus:bg-white focus:scale-[1.02] ${
                      errors.zipCode
                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                    placeholder="Enter zip code"
                  />
                  {errors.zipCode && (
                    <div className="absolute -bottom-6 left-0 flex items-center text-red-500 text-xs">
                      <X className="w-3 h-3 mr-1" />
                      {errors.zipCode}
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Home className="w-4 h-4 mr-2 text-blue-500" />
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl transition-all duration-300 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:scale-[1.02] resize-none"
                  placeholder="Enter full address"
                />
              </div>
            </div>

            {/* Profile Image Section */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <label className="block text-lg font-bold text-gray-800 mb-6 flex items-center">
                <User className="w-6 h-6 mr-3 text-blue-600" />
                Profile Image
              </label>
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                {/* Preview Section */}
                <div className="flex-shrink-0">
                  <div className="relative group">
                    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden border-4 border-white bg-gray-100 shadow-lg">
                      {(previewImage || formData.profileimage) ? (
                        <>
                          <img
                            src={getImageSrc() || "/placeholder.svg"}
                            alt="Profile preview"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.src = "/placeholder.svg?height=160&width=160";
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={removeImage}
                              className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transform hover:scale-110 shadow-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 font-medium">
                              No Image
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload Section */}
                <div className="flex-1 w-full">
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
                      isDragOver
                        ? "border-blue-500 bg-blue-100"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                    } ${errors.profileimage ? "border-red-300 bg-red-50" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      name="profileimage"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {isDragOver ? "Drop your image here" : "Upload Profile Image"}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        {isDragOver ? "Release to upload" : "Drag and drop or click to browse"}
                      </p>
                      
                      {formData.profileimage instanceof File && (
                        <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                  {formData.profileimage.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(formData.profileimage.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeImage}
                              className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-center gap-2 text-xs text-gray-400 mt-4">
                        <span className="px-2 py-1 bg-white rounded border">JPG</span>
                        <span className="px-2 py-1 bg-white rounded border">PNG</span>
                        <span className="px-2 py-1 bg-white rounded border">GIF</span>
                        <span className="px-2 py-1 bg-white rounded border">Max 5MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errors.profileimage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <X className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-700 font-medium">
                      {errors.profileimage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
