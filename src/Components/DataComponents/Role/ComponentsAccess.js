"use client"

const ComponentsAccess = ({ availableComponents, isLoading, register, watch, setValue, getValues }) => {
  const selectAllComponents = () => {
    const activeComponents = availableComponents.filter((comp) => comp?.isActive !== false)
    const currentFeatures = getValues("features") || []
    const newFeatures = activeComponents.map((component) => {
      const existingFeature = currentFeatures.find((f) => f.featuresId === component._id)
      return (
        existingFeature || {
          featuresId: component._id,
          component: component.name,
          read: false,
          write: false,
          edit: false,
          delete: false,
        }
      )
    })
    setValue("features", newFeatures)
  }

  const deselectAllComponents = () => {
    setValue("features", [])
  }

  return (
    <div className="space-y-6  ">
      <div className="flex justify-between items-center  ">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            Web Components Access
          </h3>
          <p className="text-sm text-gray-600 mt-1">Select components to grant access</p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={selectAllComponents}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-sm"
          >
            Grant All Access
          </button>
          <button
            type="button"
            onClick={deselectAllComponents}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium shadow-sm"
          >
            Revoke All Access
          </button>
        </div>
      </div>
      <div className="h-screen overflow-y-auto">


        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="ml-3 text-gray-600">Loading components...</p>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-green-200 mr-2 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableComponents
                .filter((c) => c.isActive !== false)
                .map((component) => {
                  const features = getValues("features") || []
                  const isChecked = features.some((f) => f.featuresId === component._id)

                  return (
                    <div
                      key={component._id}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${isChecked
                          ? 'border-green-300 bg-green-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-green-200 hover:bg-green-25'
                        }`}
                      onClick={() => {
                        const features = getValues("features") || []
                        let newFeatures = [...features]
                        if (isChecked) {
                          newFeatures = newFeatures.filter((f) => f.featuresId !== component._id)
                        } else {
                          newFeatures.push({
                            featuresId: component._id,
                            component: component.name,
                            read: false,
                            write: false,
                            edit: false,
                            delete: false,
                          })
                        }
                        setValue("features", newFeatures)
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isChecked
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 bg-white'
                          }`}>
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`font-medium transition-colors duration-200 ${isChecked ? 'text-green-800' : 'text-gray-700'
                          }`}>
                          {component.name}
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComponentsAccess
