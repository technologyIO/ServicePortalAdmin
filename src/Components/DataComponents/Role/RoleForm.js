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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-8">
      <div className=" ">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("name", { required: "Role name is required" })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Parent Role
            </label>
            <select
              {...register("parentRole")}
              value={selectedParentRole}
              onChange={(e) => setSelectedParentRole(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">None</option>
              {parentRoles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role Type
            </label>
            <select
              value={selectedRoleType}
              onChange={(e) => setSelectedRoleType(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">None</option>
              <option value="skanray">Skanray</option>
              <option value="dealer">Dealer</option>
            </select>
          </div>
        </div>

        {/* Components Access */}
        <ComponentsAccess
          availableComponents={availableComponents}
          isLoading={false}
          register={register}
          watch={watch}
          setValue={setValue}
          getValues={getValues}
        />

        {/* Permissions */}
        <PermissionsSection
          watch={watch}
          register={register}
          setValue={setValue}
          availableComponents={availableComponents}
        />

        {/* Mobile Components */}
        <MobileComponents
          watch={watch}
          setValue={setValue}
          register={register}
          isEditing={isEditing}
          currentRoleData={currentRoleData}
          mobileComponentsList={mobileComponentsList}
        />

        {/* Reports */}
        <ReportsSection
          watch={watch}
          setValue={setValue}
          register={register}
          isEditing={isEditing}
          currentRoleData={currentRoleData}
          reportsList={reportsList}
        />

        {/* Demographic Section */}
        <DemographicSection
          register={register}
          watch={watch}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            "Saving..."
          ) : isEditing ? (
            "Update Role"
          ) : (
            "Create Role"
          )}
        </button>
      </div>
    </form>
  );
};

export default RoleForm;


