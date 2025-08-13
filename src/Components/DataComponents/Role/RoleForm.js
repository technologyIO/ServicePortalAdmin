import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { fetchRoles, fetchComponents } from "./utils";
import axios from "axios";
import toast from "react-hot-toast";
import ComponentsAccess from "./ComponentsAccess";
import DemographicSection from "./DemographicSection";
import MobileComponents from "./MobileComponents";
import PermissionsSection from "./PermissionsSection";
import ReportsSection from "./ReportsSection";

const RoleForm = ({
  isEditing,
  currentRoleId,
  parentRoles,
  selectedParentRole,
  setSelectedParentRole,
  availableComponents,
  onSuccess,
  selectedRoleType,
  setSelectedRoleType,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  const [mobileComponentsList, setMobileComponentsList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [currentRoleData, setCurrentRoleData] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch mobile components and reports data
        const [mobileRes, reportsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BASE_URL}/role/mobilecomponents`),
          axios.get(`${process.env.REACT_APP_BASE_URL}/role/reports`)
        ]);

        setMobileComponentsList(mobileRes.data);
        setReportsList(reportsRes.data);

        // If editing, fetch the role data
        if (isEditing && currentRoleId) {
          const roleRes = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/roles/${currentRoleId}`
          );
          const roleData = roleRes.data;
          setCurrentRoleData(roleData);
          setSelectedRoleType(roleData.roleType);

          // Set initial permissions for mobile components and reports
          const initialMobilePermissions = {};
          const initialReportPermissions = {};

          roleData.mobileComponents?.forEach(comp => {
            initialMobilePermissions[comp.componentId] = {
              read: comp.read,
              write: comp.write,
              edit: comp.edit,
              delete: comp.delete
            };
          });

          roleData.reports?.forEach(report => {
            initialReportPermissions[report.reportId] = {
              read: report.read,
              write: report.write,
              edit: report.edit,
              delete: report.delete
            };
          });

          reset({
            name: roleData.name,
            parentRole: roleData.parentRole?._id || "",
            features: roleData.features,
            mobilePermissions: initialMobilePermissions,
            reportPermissions: initialReportPermissions,
            demographic: roleData.demographicSelections?.reduce((acc, curr) => {
              acc[curr.name] = {
                enabled: curr.isEnabled,
                type: curr.selectionType
              };
              return acc;
            }, {})
          });

          setSelectedParentRole(roleData.parentRole?._id || "");
        }
      } catch (error) {
        toast.error("Failed to load initial data");
        console.error("Error loading data:", error);
      }
    };

    fetchInitialData();
  }, [isEditing, currentRoleId, reset, setSelectedParentRole, setSelectedRoleType]);

  const onSubmit = async (data) => {
    try {
      // Format mobile components
      const formattedMobileComponents = data.mobilePermissions
        ? Object.entries(data.mobilePermissions)
            .filter(([_, permissions]) => Object.values(permissions).some(Boolean))
            .map(([componentId, permissions]) => {
              const component = mobileComponentsList.find(c => c._id === componentId);
              return {
                componentId,
                name: component?.name || componentId,
                ...permissions
              };
            })
        : [];

      // Format reports
      const formattedReports = data.reportPermissions
        ? Object.entries(data.reportPermissions)
            .filter(([_, permissions]) => Object.values(permissions).some(Boolean))
            .map(([reportId, permissions]) => {
              const report = reportsList.find(r => r._id === reportId);
              return {
                reportId,
                name: report?.name || reportId,
                ...permissions
              };
            })
        : [];

      // Format demographic selections
      const formattedDemographic = data.demographic
        ? Object.entries(data.demographic)
            .filter(([_, settings]) => settings.enabled)
            .map(([name, settings]) => ({
              name,
              isEnabled: true,
              selectionType: settings.type
            }))
        : [];

      const formattedData = {
        name: data.name,
        parentRole: data.parentRole || null,
        roleType: selectedRoleType,
        features: data.features || [],
        mobileComponents: formattedMobileComponents,
        reports: formattedReports,
        demographicSelections: formattedDemographic
      };

      console.log("Submitting data:", formattedData); // For debugging

      if (isEditing && currentRoleId) {
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/roles/${currentRoleId}`,
          formattedData
        );
        toast.success("Role updated successfully");
      } else {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/roles`,
          formattedData
        );
        toast.success("Role created successfully");
      }

      onSuccess();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "An error occurred while saving the role"
      );
      console.error("Error submitting role:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-8xl mx-auto ">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isEditing ? 'Edit Role' : 'Create New Role'}
            </h2>
            <p className="text-gray-600 mt-2">Configure role permissions and access levels</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name", { required: "Role name is required" })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                    placeholder="Enter role name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Role
                  </label>
                  <select
                    {...register("parentRole")}
                    value={selectedParentRole}
                    onChange={(e) => setSelectedParentRole(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                  >
                    <option value="">Select parent role</option>
                    {parentRoles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Type
                  </label>
                  <select
                    value={selectedRoleType}
                    onChange={(e) => setSelectedRoleType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                  >
                    <option value="">Select role type</option>
                    <option value="skanray">Skanray</option>
                    <option value="dealer">Dealer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Components Access Section */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
              <ComponentsAccess
                availableComponents={availableComponents}
                isLoading={false}
                register={register}
                watch={watch}
                setValue={setValue}
                getValues={getValues}
              />
            </div>

            {/* Permissions Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <PermissionsSection
                watch={watch}
                register={register}
                setValue={setValue}
                availableComponents={availableComponents}
              />
            </div>

            {/* Mobile Components Section */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <MobileComponents
                watch={watch}
                setValue={setValue}
                register={register}
                isEditing={isEditing}
                currentRoleData={currentRoleData}
                mobileComponentsList={mobileComponentsList}
              />
            </div>

            {/* Reports Section */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
              <ReportsSection
                watch={watch}
                setValue={setValue}
                register={register}
                isEditing={isEditing}
                currentRoleData={currentRoleData}
                reportsList={reportsList}
              />
            </div>

            {/* Demographic Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <DemographicSection
                register={register}
                watch={watch}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : isEditing ? (
                  "Update Role"
                ) : (
                  "Create Role"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleForm;
