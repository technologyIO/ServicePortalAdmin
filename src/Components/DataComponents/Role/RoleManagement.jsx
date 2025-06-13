import React, { useState, useEffect } from "react";
import RoleForm from "./RoleForm";
import RoleList from "./RoleList";
import { 
  fetchRoles, 
  fetchParentRoles,
  fetchComponents
} from "./utils";
import toast from "react-hot-toast";

const RoleManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parentRoles, setParentRoles] = useState([]);
  const [selectedParentRole, setSelectedParentRole] = useState("");
  const [availableComponents, setAvailableComponents] = useState([]);

  // Fetch all required data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesData, parentRolesData, componentsData] = await Promise.all([
        fetchRoles(),
        fetchParentRoles(),
        fetchComponents()
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
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="h-[98vh] overflow-y-auto pr-3">
      <div className="rounded-lg">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">
          Role Management
        </h1>
        
        <RoleForm 
          isEditing={isEditing}
          currentRoleId={currentRoleId}
          parentRoles={parentRoles}
          selectedParentRole={selectedParentRole}
          setSelectedParentRole={setSelectedParentRole}
          availableComponents={availableComponents}
          onSuccess={handleRoleUpdate}
          onCancel={resetForm}
        />
        
        <RoleList 
          roles={roles}
          onEdit={handleEdit}
          onDelete={handleRoleUpdate} // Refresh after delete
        />
      </div>
    </div>
  );
};

export default RoleManagement;