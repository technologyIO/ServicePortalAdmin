"use client"

import React from "react"
import axios from "axios"
import Swal from "sweetalert2"

const RoleList = ({ roles, onEdit, onDelete }) => {
  const handleDelete = async (roleId) => {
    const result = await Swal.fire({
      title: "Delete Role?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-xl",
        title: "text-lg font-semibold",
        content: "text-sm text-gray-600",
      },
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`${process.env.REACT_APP_BASE_URL}/roles/${roleId}`)
        Swal.fire({
          title: "Deleted!",
          text: "Role has been deleted successfully.",
          icon: "success",
          showConfirmButton: true, 
          confirmButtonColor: "#3b82f6", 
          confirmButtonText: "OK",
          customClass: {
            popup: "rounded-xl",
          },
        });


        onDelete()
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete role. Please try again.",
          icon: "error",
          confirmButtonColor: "#ef4444",
          customClass: {
            popup: "rounded-xl",
          },
        })
        console.error("Error deleting role:", error)
      }
    }
  }

  const getRoleTypeStyle = (roleType) => {
    switch (roleType?.toLowerCase()) {
      case "skanray":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
      case "dealer":
        return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
      case "admin":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25"
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25"
    }
  }

  const getRoleIcon = (roleType) => {
    switch (roleType?.toLowerCase()) {
      case "skanray":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        )
      case "dealer":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        )
      case "admin":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )
    }
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No roles found</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Get started by creating your first role to manage user permissions and access levels
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create First Role
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Role Management</h2>
        <p className="text-sm text-gray-600 mt-1">Manage user roles and permissions</p>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Role Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                Role ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                Parent Role
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100">
            {roles.map((role, index) => (
              <tr
                key={role._id}
                className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}
              >
                {/* Role Details Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${getRoleTypeStyle(role.roleType)} transform group-hover:scale-110 transition-transform duration-200`}
                    >
                      {getRoleIcon(role.roleType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {role.name}
                      </div>
                      {/* Mobile: Show additional info */}
                      <div className="md:hidden mt-1 space-y-1">
                        <div className="text-xs text-gray-500">
                          ID: <span className="font-mono">#{role.roleId}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleTypeStyle(role.roleType)}`}
                          >
                            {role?.roleType || "N/A"}
                          </span>
                          {role.parentRole?.name && (
                            <span className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                              Parent: {role.parentRole.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Role ID Column - Hidden on mobile */}
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-mono">
                    #{role.roleId}
                  </span>
                </td>

                {/* Role Type Column - Hidden on mobile/tablet */}
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getRoleTypeStyle(role.roleType)}`}
                  >
                    {role?.roleType || "N/A"}
                  </span>
                </td>

                {/* Parent Role Column - Hidden on mobile/tablet */}
                <td className="px-6 py-4 hidden lg:table-cell">
                  {role.parentRole?.name ? (
                    <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      {role.parentRole.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-sm">
                      No parent
                    </span>
                  )}
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(role)}
                      className="group/btn inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25"
                    >
                      <svg
                        className="w-4 h-4 sm:mr-2 group-hover/btn:rotate-12 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(role._id)}
                      className="group/btn inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-white bg-red-50 hover:bg-red-500 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                    >
                      <svg
                        className="w-4 h-4 sm:mr-2 group-hover/btn:rotate-12 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total roles: {roles.length}</span>
          <span>Showing all results</span>
        </div>
      </div>
    </div>
  )
}

export default RoleList
