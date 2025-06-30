import React from "react";
import axios from "axios";
import toast from "react-hot-toast";

const RoleList = ({ roles, onEdit, onDelete }) => {
  const handleDelete = async (roleId) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_BASE_URL}/roles/${roleId}`
        );
        toast.success("Role deleted successfully");
        onDelete(); // Refresh the list
      } catch (error) {
        toast.error("Failed to delete role");
        console.error("Error deleting role:", error);
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-blue-800 mb-4">Existing Roles</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                Role Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                Role ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                Role Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                Parent Role
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{role.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{role.roleId}</div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
      ${role?.roleType === "skanray" ? "bg-green-100 text-green-800" : ""}
      ${role?.roleType === "dealer" ? "bg-yellow-100 text-yellow-800" : ""}
    `}
                  >
                    {role?.roleType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {role.parentRole?.name || "None"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(role)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(role._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleList;