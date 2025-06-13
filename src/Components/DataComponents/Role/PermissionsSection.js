import React from "react";

const PermissionsSection = ({ watch, register, setValue, availableComponents }) => {
  const selectAllPermissions = (index) => {
    setValue(`features.${index}.read`, true);
    setValue(`features.${index}.write`, true);
    setValue(`features.${index}.edit`, true);
    setValue(`features.${index}.delete`, true);
  };

  const deselectAllPermissions = (index) => {
    setValue(`features.${index}.read`, false);
    setValue(`features.${index}.write`, false);
    setValue(`features.${index}.edit`, false);
    setValue(`features.${index}.delete`, false);
  };

  return (
    <>
      {watch("features")?.some(f => f?.featuresId) && (
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Set Permissions for Selected Components
          </label>
          <div className="space-y-4">
            {watch("features")
              ?.filter(f => f?.featuresId)
              .map((feature, index) => {
                const component = availableComponents.find(
                  comp => comp._id === feature.featuresId
                );
                if (!component) return null;

                return (
                  <div key={component._id} className="bg-gray-50 p-3 rounded-md">
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
                      {["read", "write", "edit", "delete"].map((permission) => (
                        <div key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`${permission}-${component._id}`}
                            {...register(`features.${index}.${permission}`)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`${permission}-${component._id}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {permission.charAt(0).toUpperCase() + permission.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
};

export default PermissionsSection;