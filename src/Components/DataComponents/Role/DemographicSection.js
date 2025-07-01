const DEMOGRAPHIC_FIELDS = ["GEO", "Country", "Region", "State", "Branch", "City"]

const DemographicSection = ({ register, watch }) => {
  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700">
        Demographic <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 gap-2 mb-4 border border-gray-200 rounded p-2">
        {DEMOGRAPHIC_FIELDS.map((item) => {
          const isChecked = watch(`demographic.${item}.enabled`, true)
          const selectedType = watch(`demographic.${item}.type`, "single")

          return (
            <div className="flex items-center justify-start gap-10 py-2" key={item}>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(`demographic.${item}.enabled`)}
                    defaultChecked={true}
                    className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-gray-700 font-medium">{item}</span>
                </label>
              </div>
              <div className="flex items-center space-x-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="single"
                    {...register(`demographic.${item}.type`)}
                    defaultChecked={selectedType === "single"}
                    className="w-4 h-4 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-gray-700">Single Select</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="multi"
                    {...register(`demographic.${item}.type`)}
                    defaultChecked={selectedType === "multi"}
                    className="w-4 h-4 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-gray-700">Multi Select</span>
                </label>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DemographicSection
