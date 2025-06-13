import React from "react";

const ComponentsAccess = ({ 
  availableComponents, 
  isLoading, 
  register, 
  watch, 
  setValue, 
  getValues 
}) => {
  const selectAllComponents = () => {
    const activeComponents = availableComponents.filter(comp => comp?.isActive !== false);
    const currentFeatures = getValues("features") || [];
    const newFeatures = activeComponents.map(component => {
      const existingFeature = currentFeatures.find(f => f.featuresId === component._id);
      return existingFeature || {
        featuresId: component._id,
        component: component.name,
        read: false,
        write: false,
        edit: false,
        delete: false,
      };
    });
    setValue("features", newFeatures);
  };

  const deselectAllComponents = () => {
    setValue("features", []);
  };

  return (
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
            .filter(c => c.isActive !== false)
            .map((component) => {
              const features = getValues("features") || [];
              const isChecked = features.some(f => f.featuresId === component._id);

              return (
                <div key={component._id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`component-${component._id}`}
                    checked={isChecked}
                    onChange={(e) => {
                      let newFeatures = [...features];
                      if (e.target.checked) {
                        newFeatures.push({
                          featuresId: component._id,
                          component: component.name,
                          read: false,
                          write: false,
                          edit: false,
                          delete: false,
                        });
                      } else {
                        newFeatures = newFeatures.filter(f => f.featuresId !== component._id);
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
  );
};

export default ComponentsAccess;