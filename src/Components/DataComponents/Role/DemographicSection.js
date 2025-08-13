const DEMOGRAPHIC_FIELDS = ["GEO", "Country", "Region", "State", "Branch", "City"]

// <CHANGE> Added custom SelectionButton component for demographic types
const SelectionButton = ({ type, currentType, onChange, label }) => {
  const isSelected = currentType === type
  
  return (
    <button
      type="button"
      onClick={() => onChange(type)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
        isSelected
          ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
          : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200'
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
        isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
      }`}>
        {isSelected && (
          <div className="w-2 h-2 bg-white rounded-full"></div>
        )}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

const DemographicSection = ({ register, watch }) => {
  // <CHANGE> Added select all and deselect all functions
  const selectAllDemographics = () => {
    DEMOGRAPHIC_FIELDS.forEach((field) => {
      const fieldElement = document.querySelector(`input[name="demographic.${field}.enabled"]`)
      if (fieldElement && !fieldElement.checked) {
        fieldElement.click()
      }
    })
  }

  const deselectAllDemographics = () => {
    DEMOGRAPHIC_FIELDS.forEach((field) => {
      const fieldElement = document.querySelector(`input[name="demographic.${field}.enabled"]`)
      if (fieldElement && fieldElement.checked) {
        fieldElement.click()
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
            Demographic Settings
          </h3>
          <p className="text-sm text-gray-600 mt-1">Configure demographic field access and selection types</p>
        </div>
        {/* <CHANGE> Added select all buttons */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={selectAllDemographics}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-sm"
          >
            Enable All Fields
          </button>
          <button
            type="button"
            onClick={deselectAllDemographics}
            className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 text-sm font-medium shadow-sm"
          >
            Disable All Fields
          </button>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-indigo-200 p-6">
        <div className="space-y-6">
          {DEMOGRAPHIC_FIELDS.map((item) => {
            const isChecked = watch(`demographic.${item}.enabled`, true)
            const selectedType = watch(`demographic.${item}.type`, "single")

            return (
              <div key={item} className="bg-white rounded-lg border border-indigo-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* <CHANGE> Updated checkbox styling */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register(`demographic.${item}.enabled`)}
                        defaultChecked={true}
                        className="w-5 h-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                      />
                      <label className="ml-3 text-lg font-semibold text-gray-800">
                        {item}
                      </label>
                    </div>
                  </div>

                  {/* <CHANGE> Updated selection type buttons */}
                  {isChecked && (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-600">Selection Type:</span>
                      <div className="flex space-x-3">
                        <SelectionButton
                          type="single"
                          currentType={selectedType}
                          onChange={(type) => {
                            const fieldElement = document.querySelector(`input[name="demographic.${item}.type"][value="${type}"]`)
                            if (fieldElement) fieldElement.click()
                          }}
                          label="Single Select"
                        />
                        <SelectionButton
                          type="multi"
                          currentType={selectedType}
                          onChange={(type) => {
                            const fieldElement = document.querySelector(`input[name="demographic.${item}.type"][value="${type}"]`)
                            if (fieldElement) fieldElement.click()
                          }}
                          label="Multi Select"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Hidden radio inputs for form submission */}
                <div className="hidden">
                  <input
                    type="radio"
                    value="single"
                    {...register(`demographic.${item}.type`)}
                    defaultChecked={selectedType === "single"}
                  />
                  <input
                    type="radio"
                    value="multi"
                    {...register(`demographic.${item}.type`)}
                    defaultChecked={selectedType === "multi"}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DemographicSection
