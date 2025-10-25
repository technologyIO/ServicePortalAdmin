"use client"

// <CHANGE> Added custom PermissionButton component for Yes/No radio style selection
const PermissionButton = ({ permission, componentId, index, isGranted, onChange }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 capitalize">{permission}</h4>
      <div className="flex space-x-4">
        {/* Yes Button */}
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
            isGranted
              ? 'border-green-300 bg-green-50 text-green-800'
              : 'border-gray-200 bg-white text-gray-600 hover:border-green-200'
          }`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            isGranted ? 'border-green-500 bg-green-500' : 'border-gray-300'
          }`}>
            {isGranted && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-sm font-medium">Yes</span>
        </button>

        {/* No Button */}
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
            !isGranted
              ? 'border-red-300 bg-red-50 text-red-800'
              : 'border-gray-200 bg-white text-gray-600 hover:border-red-200'
          }`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            !isGranted ? 'border-red-500 bg-red-500' : 'border-gray-300'
          }`}>
            {!isGranted && (
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
          </div>
          <span className="text-sm font-medium">No</span>
        </button>
      </div>
    </div>
  )
}

const PermissionsSection = ({ watch, register, setValue, availableComponents }) => {
  // <CHANGE> Added grant all and revoke all functions for all components
  const grantAllPermissions = () => {
    const features = watch("features") || []
    features.forEach((_, index) => {
      setValue(`features.${index}.read`, true)
      setValue(`features.${index}.write`, true)
      setValue(`features.${index}.edit`, true)
      setValue(`features.${index}.delete`, true)
    })
  }

  const revokeAllPermissions = () => {
    const features = watch("features") || []
    features.forEach((_, index) => {
      setValue(`features.${index}.read`, false)
      setValue(`features.${index}.write`, false)
      setValue(`features.${index}.edit`, false)
      setValue(`features.${index}.delete`, false)
    })
  }

  const selectAllPermissions = (index) => {
    setValue(`features.${index}.read`, true)
    setValue(`features.${index}.write`, true)
    setValue(`features.${index}.edit`, true)
    setValue(`features.${index}.delete`, true)
  }

  const deselectAllPermissions = (index) => {
    setValue(`features.${index}.read`, false)
    setValue(`features.${index}.write`, false)
    setValue(`features.${index}.edit`, false)
    setValue(`features.${index}.delete`, false)
  }

  return (
    <>
      {watch("features")?.some((f) => f?.featuresId) && (
        <div className="space-y-6 ">
          <div className="flex justify-between items-center pr-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Component Permissions
              </h3>
              <p className="text-sm text-gray-600 mt-1">Configure permissions for selected components</p>
            </div>
            {/* <CHANGE> Added global grant/revoke all buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={grantAllPermissions}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-sm"
              >
                Grant All Permissions
              </button>
              <button
                type="button"
                onClick={revokeAllPermissions}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium shadow-sm"
              >
                Revoke All Permissions
              </button>
            </div>
          </div>

          <div className="space-y-6 h-screen overflow-y-auto pr-3">
            {watch("features")
              ?.filter((f) => f?.featuresId)
              .map((feature, index) => {
                const component = availableComponents.find((comp) => comp._id === feature.featuresId)
                if (!component) return null

                return (
                  <div key={component._id} className="bg-white/70 backdrop-blur-sm  rounded-xl border border-purple-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-lg font-semibold text-purple-800 flex items-center">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                        {component.name} Permissions
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => selectAllPermissions(index)}
                          className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-all duration-200 text-sm font-medium"
                        >
                          Grant All
                        </button>
                        <button
                          type="button"
                          onClick={() => deselectAllPermissions(index)}
                          className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-medium"
                        >
                          Revoke All
                        </button>
                      </div>
                    </div>
                    
                    {/* <CHANGE> Updated to use new PermissionButton component */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {["read", "write", "edit", "delete"].map((permission) => (
                        <PermissionButton
                          key={permission}
                          permission={permission}
                          componentId={component._id}
                          index={index}
                          isGranted={watch(`features.${index}.${permission}`) || false}
                          onChange={(granted) => setValue(`features.${index}.${permission}`, granted)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </>
  )
}

export default PermissionsSection
