import axios from "axios";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const RoleManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableStates, setAvailableStates] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [availableComponents, setAvailableComponents] = useState([]);
  const { register, handleSubmit, reset, setValue, watch, getValues } =
    useForm();
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [parentRoles, setParentRoles] = useState([]);
  const [selectedParentRole, setSelectedParentRole] = useState("");

  const selectedComponents = watch("features", []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchRoles(),
          fetchStates(),
          fetchCities(),
          fetchComponents(),
          fetchParentRoles(),
        ]);
        setDataLoaded(true);
      } catch (err) {
        toast.error("Failed to load initial data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/roles");
      setRoles(res.data);
    } catch (err) {
      toast.error("Failed to fetch roles");
      console.error(err);
    }
  };

  const fetchStates = async () => {
    try {
      const res = await axios.get("http://localhost:5000/collections/allstate");
      setAvailableStates(res.data);
    } catch (err) {
      toast.error("Failed to fetch states");
      console.error(err);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await axios.get("http://localhost:5000/collections/allcity");
      setAvailableCities(res.data);
    } catch (err) {
      toast.error("Failed to fetch cities");
      console.error(err);
    }
  };

  const fetchComponents = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/role/components");
      setAvailableComponents(res.data || []);
      setIsLoading(false);
    } catch (err) {
      toast.error("Failed to fetch components");
      console.error(err);
      setAvailableComponents([]);
      setIsLoading(false);
    }
  };

  const fetchParentRoles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/roles");
      setParentRoles(res.data);
    } catch (err) {
      toast.error("Failed to fetch parent roles");
      console.error(err);
    }
  };

  const toggleStateSelection = (stateId) => {
    setSelectedStates((prevStates) => {
      if (prevStates.includes(stateId)) {
        // Deselect: remove the state and its cities from selection
        setSelectedCities((prevCities) =>
          prevCities.filter(
            (cityId) =>
              !availableCities.some(
                (city) => city._id === cityId && city.state === stateId
              )
          )
        );
        return prevStates.filter((id) => id !== stateId);
      } else {
        // Select: add the stateId
        return [...prevStates, stateId];
      }
    });
  };

  const toggleCitySelection = (cityId) => {
    setSelectedCities((prev) =>
      prev.includes(cityId)
        ? prev.filter((id) => id !== cityId)
        : [...prev, cityId]
    );
  };

  // Select all components
  const selectAllComponents = () => {
    const activeComponents = availableComponents.filter(
      (comp) => comp?.isActive !== false
    );
    const currentFeatures = getValues("features") || [];

    const newFeatures = activeComponents.map((component) => {
      const existingFeature = currentFeatures.find(
        (f) => f.featuresId === component._id
      );
      return (
        existingFeature || {
          featuresId: component._id,
          component: component.name,
          read: false,
          write: false,
          edit: false,
          delete: false,
        }
      );
    });

    setValue("features", newFeatures);
  };

  // Deselect all components
  const deselectAllComponents = () => {
    setValue("features", []);
  };

  // Select all permissions for a component
  const selectAllPermissions = (index) => {
    setValue(`features.${index}.read`, true);
    setValue(`features.${index}.write`, true);
    setValue(`features.${index}.edit`, true);
    setValue(`features.${index}.delete`, true);
  };

  // Deselect all permissions for a component
  const deselectAllPermissions = (index) => {
    setValue(`features.${index}.read`, false);
    setValue(`features.${index}.write`, false);
    setValue(`features.${index}.edit`, false);
    setValue(`features.${index}.delete`, false);
  };

  // Select all states
  const selectAllStates = () => {
    const allStateIds = availableStates.map((state) => state.stateId);
    setSelectedStates(allStateIds);
  };

  // Deselect all states
  const deselectAllStates = () => {
    setSelectedStates([]);
    setSelectedCities([]);
  };

  // Select all cities for selected states
  const selectAllCities = () => {
    const citiesForSelectedStates = availableCities
      .filter((city) => selectedStates.includes(city.stateId))
      .map((city) => city._id);

    setSelectedCities(citiesForSelectedStates);
  };

  // Deselect all cities
  const deselectAllCities = () => {
    setSelectedCities([]);
  };

  // Load role data when editing
  const handleEdit = (role) => {
    setIsEditing(true);
    setCurrentRoleId(role._id);
    setSelectedParentRole(role.parentRole?._id || "");

    // Set form values
    reset({
      name: role.name,
      description: role.description,
    });

    // Set features
    const features = role.features.map((f) => ({
      featuresId: f.component?._id,
      component: f.component?.name,
      read: f.read || false,
      write: f.write || false,
      edit: f.edit || false,
      delete: f.delete || false,
    }));

    reset({ name: role.name, description: role.description });
    setValue(
      "features",
      role.features.map((f) => ({
        featuresId: f.featuresId,
        component: f.component,
        read: f.read,
        write: f.write,
        edit: f.edit,
        delete: f.delete,
      }))
    );
    // Set locations
    setSelectedStates(role.states?.map((s) => s._id) || []);
    setSelectedCities(role.cities?.map((c) => c._id) || []);
  };

  const handleDelete = async (roleId) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await axios.delete(`http://localhost:5000/roles/${roleId}`);
        toast.success("Role deleted successfully");
        fetchRoles();
      } catch (err) {
        toast.error("Failed to delete role");
        console.error(err);
      }
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const roleData = {
        name: data.name,
        description: data.description,
        parentRole: selectedParentRole || null,
        features:
          data.features
            ?.filter((f) => f.featuresId)
            .map((f) => ({
              featuresId: f.featuresId, // Added back the featuresId
              component: f.component,
              read: Boolean(f.read),
              write: Boolean(f.write),
              edit: Boolean(f.edit),
              delete: Boolean(f.delete),
            })) || [],
        states: selectedStates,
        cities: selectedCities,
      };

      if (isEditing) {
        await axios.put(
          `http://localhost:5000/roles/${currentRoleId}`,
          roleData
        );
        toast.success("Role updated successfully");
      } else {
        await axios.post("http://localhost:5000/roles", roleData);
        toast.success("Role created successfully");
      }

      resetForm();
      fetchRoles();
    } catch (err) {
      toast.error(err.response?.data?.error || "Operation failed");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    reset();
    setIsEditing(false);
    setCurrentRoleId(null);
    setSelectedStates([]);
    setSelectedCities([]);
    setSelectedParentRole("");
  };

  if (loading && !dataLoaded) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="h-[98vh] overflow-y-auto">
      <div className="rounded-lg">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">
          Role Management
        </h1>

        {/* Role Form */}
        <div className="bg-blue-50 p-4 rounded-lg mb-2">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            {isEditing ? "Edit Role" : "Create New Role"}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("name", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter role name"
                />
              </div>

              {/* Parent Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Role
                </label>
                <select
                  value={selectedParentRole}
                  onChange={(e) => setSelectedParentRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Parent Role</option>
                  {parentRoles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  {...register("description")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Components Access <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={selectAllComponents}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllComponents}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                {isLoading ? (
                  <p>Loading components...</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 border border-gray-200 rounded p-2">
                    {availableComponents
                      .filter((c) => c.isActive !== false)
                      .map((component) => {
                        // current features in the form
                        const features = getValues("features") || [];
                        const isChecked = features.some(
                          (f) => f.featuresId === component._id
                        );

                        return (
                          <div
                            key={component._id}
                            className="flex items-center mb-2"
                          >
                            <input
                              type="checkbox"
                              id={`component-${component._id}`}
                              checked={isChecked}
                              onChange={(e) => {
                                let newFeatures = [...features];
                                if (e.target.checked) {
                                  // add this component to features
                                  newFeatures.push({
                                    featuresId: component._id,
                                    component: component.name,
                                    read: false,
                                    write: false,
                                    edit: false,
                                    delete: false,
                                  });
                                } else {
                                  // remove it
                                  newFeatures = newFeatures.filter(
                                    (f) => f.featuresId !== component._id
                                  );
                                }
                                setValue("features", newFeatures);
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`component-${component._id}`}
                              className="ml-2 text-sm text-gray-700"
                            >
                              {component.name}
                            </label>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Permissions for selected components */}
              {watch("features")?.some((f) => f?.featuresId) && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Set Permissions for Selected Components
                  </label>
                  <div className="space-y-4">
                    {watch("features")
                      ?.filter((f) => f?.featuresId)
                      .map((feature, index) => {
                        const component = availableComponents.find(
                          (comp) => comp._id === feature.featuresId
                        );
                        if (!component) return null;

                        return (
                          <div
                            key={component._id}
                            className="bg-gray-50 p-3 rounded-md"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-gray-800">
                                {component.name} Permissions
                              </h4>
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => selectAllPermissions(index)}
                                  className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                >
                                  All
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deselectAllPermissions(index)}
                                  className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                                >
                                  None
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                              {["read", "write", "edit", "delete"].map(
                                (permission) => (
                                  <div
                                    key={permission}
                                    className="flex items-center"
                                  >
                                    <input
                                      type="checkbox"
                                      id={`${permission}-${component._id}`}
                                      {...register(
                                        `features.${index}.${permission}`
                                      )}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label
                                      htmlFor={`${permission}-${component._id}`}
                                      className="ml-2 text-sm text-gray-700"
                                    >
                                      {permission.charAt(0).toUpperCase() +
                                        permission.slice(1)}
                                    </label>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    State Access
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={selectAllStates}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllStates}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                    >
                      None
                    </button>
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {availableStates.map((state) => (
                    <div key={state._id} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        id={`state-${state.stateId}`}
                        checked={selectedStates.includes(state.stateId)}
                        onChange={() => toggleStateSelection(state.stateId)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`state-${state.stateId}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {state.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* City Access */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    City Access
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={selectAllCities}
                      disabled={selectedStates.length === 0}
                      className={`text-xs px-2 py-1 rounded ${
                        selectedStates.length === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllCities}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                    >
                      None
                    </button>
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {selectedStates.length > 0 ? (
                    availableCities
                      .filter((city) => selectedStates.includes(city.stateId))
                      .map((city) => (
                        <div key={city._id} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            id={`city-${city._id}`}
                            checked={selectedCities.includes(city._id)}
                            onChange={() => toggleCitySelection(city._id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`city-${city._id}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {city.name}
                          </label>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Select states first to choose cities
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : isEditing
                  ? "Update Role"
                  : "Create Role"}
              </button>
            </div>
          </form>
        </div>

        {/* Roles List */}
        <div>
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            Existing Roles
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Role Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Role Id
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
                      <div className="font-medium text-gray-900">
                        {role.name}
                      </div>

                      <div className="text-sm text-gray-500">
                        {role.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{role.roleId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {role.parentRole?.name || "None"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(role)}
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
      </div>
    </div>
  );
};

export default RoleManagement;
