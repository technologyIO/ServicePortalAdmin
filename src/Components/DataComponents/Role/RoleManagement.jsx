"use client";

import { useState, useEffect } from "react";
import RoleForm from "./RoleForm";
import RoleList from "./RoleList";
import { fetchRoles, fetchParentRoles, fetchComponents } from "./utils";
import toast from "react-hot-toast";

const RoleManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parentRoles, setParentRoles] = useState([]);
  const [selectedParentRole, setSelectedParentRole] = useState("");
  const [selectedRoleType, setSelectedRoleType] = useState("");
  const [availableComponents, setAvailableComponents] = useState([]);

  // Fetch all required data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesData, parentRolesData, componentsData] = await Promise.all([
        fetchRoles(),
        fetchParentRoles(),
        fetchComponents(),
      ]);
      setRoles(rolesData);
      setParentRoles(parentRolesData);
      setAvailableComponents(componentsData);
    } catch (error) {
      toast.error("Failed to load initial data");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (role) => {
    setIsEditing(true);
    setCurrentRoleId(role._id);
    setSelectedParentRole(role.parentRole?._id || "");
  };

  const handleRoleUpdate = () => {
    fetchData();
    resetForm();
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentRoleId(null);
    setSelectedParentRole("");
    setSelectedRoleType("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium mt-3">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="h-[98vh] overflow-y-auto">
        <div className="max-w-8xl mx-auto p-3 space-y-3">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  Role Management
                </h1>
                <p className="text-slate-600 mt-1">
                  Manage system roles and permissions
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 overflow-hidden">
            <div className="">
              <RoleForm
                isEditing={isEditing}
                currentRoleId={currentRoleId}
                parentRoles={parentRoles}
                setSelectedRoleType={setSelectedRoleType}
                selectedRoleType={selectedRoleType}
                selectedParentRole={selectedParentRole}
                setSelectedParentRole={setSelectedParentRole}
                availableComponents={availableComponents}
                onSuccess={handleRoleUpdate}
                onCancel={resetForm}
              />
            </div>
          </div>

          {/* List Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 overflow-hidden">
            <div className="p-3">
              <RoleList
                roles={roles}
                onEdit={handleEdit}
                onDelete={handleRoleUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
