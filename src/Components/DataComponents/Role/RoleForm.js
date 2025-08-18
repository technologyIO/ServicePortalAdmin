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
  const [isOpen, setIsOpen] = useState(false);
  const [isRoleTypeOpen, setIsRoleTypeOpen] = useState(false);

  // Role type options
  const roleTypeOptions = [
    { value: 'skanray', label: 'Skanray' },
    { value: 'dealer', label: 'Dealer' }
  ];

  const handleSelect = (roleId, roleName) => {
    setSelectedParentRole(roleId);
    setValue("parentRole", roleId); // Ye line add karni thi
    setIsOpen(false);
  };

  const selectedRole = parentRoles.find(role => role._id === selectedParentRole);
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

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Role
                  </label>

                  <div className="relative">
                    {/* Hidden select for form registration */}
                    <select
                      {...register("parentRole")}
                      value={selectedParentRole}
                      onChange={(e) => {
                        setSelectedParentRole(e.target.value);
                        setValue("parentRole", e.target.value);
                      }}
                      className="hidden"
                    >
                      <option value="">Select parent role</option>
                      {parentRoles.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                    </select>

                    {/* Custom dropdown button */}
                    <button
                      type="button"
                      onClick={() => setIsOpen(!isOpen)}
                      className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-xl shadow-sm 
                 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 transition-all duration-200 flex items-center justify-between group"
                    >
                      <span className={`${selectedRole ? 'text-gray-900' : 'text-gray-500'} font-medium`}>
                        {selectedRole ? selectedRole.name : 'Select parent role'}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {isOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg 
                     max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95">
                        <div className="py-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedParentRole('');
                              setValue("parentRole", '');
                              setIsOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left text-gray-500 hover:bg-blue-50 hover:text-blue-600 
                     transition-colors duration-150 font-medium"
                          >
                            Select parent role
                          </button>
                          {parentRoles.map((role) => (
                            <button
                              key={role._id}
                              type="button"
                              onClick={() => {
                                setSelectedParentRole(role._id);
                                setValue("parentRole", role._id);
                                setIsOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-600 
                       transition-colors duration-150 font-medium
                       ${selectedParentRole === role._id ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
                            >
                              {role.name}
                              {selectedParentRole === role._id && (
                                <svg className="inline-block w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Click outside to close */}
                  {isOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsOpen(false)}
                    />
                  )}
                </div>



                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Type
                  </label>

                  <div className="relative">
                    {/* Hidden select for form registration */}
                    <select
                      value={selectedRoleType}
                      onChange={(e) => setSelectedRoleType(e.target.value)}
                      className="hidden"
                    >
                      <option value="">Select role type</option>
                      {roleTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* Custom dropdown button */}
                    <button
                      type="button"
                      onClick={() => setIsRoleTypeOpen(!isRoleTypeOpen)}
                      className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-xl shadow-sm 
                 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 transition-all duration-200 flex items-center justify-between group"
                    >
                      <span className={`${selectedRoleType ? 'text-gray-900' : 'text-gray-500'} font-medium`}>
                        {selectedRoleType ? roleTypeOptions.find(opt => opt.value === selectedRoleType)?.label : 'Select role type'}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isRoleTypeOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {isRoleTypeOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg 
                     max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95">
                        <div className="py-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRoleType('');
                              setIsRoleTypeOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left text-gray-500 hover:bg-blue-50 hover:text-blue-600 
                     transition-colors duration-150 font-medium"
                          >
                            Select role type
                          </button>
                          {roleTypeOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setSelectedRoleType(option.value);
                                setIsRoleTypeOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-600 
                       transition-colors duration-150 font-medium
                       ${selectedRoleType === option.value ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
                            >
                              {option.label}
                              {selectedRoleType === option.value && (
                                <svg className="inline-block w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Click outside to close */}
                  {isRoleTypeOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsRoleTypeOpen(false)}
                    />
                  )}
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
