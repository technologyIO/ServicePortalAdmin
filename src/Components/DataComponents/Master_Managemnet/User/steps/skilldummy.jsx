"use client"

export default function Step3Skillsdummy({ Skill, selectedSkill, setSelectedSkill }) {
  const isSkillFullySelected = (skill) => {
    return Array.isArray(skill.products) && skill.products.every((p) => selectedSkill[p._id])
  }

  const isSkillPartiallySelected = (skill) => {
    return (
      Array.isArray(skill.products) && skill.products.some((p) => selectedSkill[p._id]) && !isSkillFullySelected(skill)
    )
  }

  const handleSkillCheckboxChange = (skill, isChecked) => {
    const newSelections = { ...selectedSkill }
    if (Array.isArray(skill.products)) {
      skill.products.forEach((product) => {
        newSelections[product._id] = isChecked
      })
    }
    setSelectedSkill(newSelections)
  }

  const handleProductCheckboxChange = (productId, isChecked) => {
    setSelectedSkill((prev) => ({
      ...prev,
      [productId]: isChecked,
    }))
  }

  const handleSelectAll = () => {
    const allSelections = {}
    Skill.forEach((skill) => {
      if (Array.isArray(skill.products)) {
        skill.products.forEach((product) => {
          allSelections[product._id] = true
        })
      }
    })
    setSelectedSkill(allSelections)
  }

  const handleDeselectAll = () => {
    setSelectedSkill({})
  }

  const getTotalSelectedCount = () => {
    return Object.values(selectedSkill).filter(Boolean).length
  }

  const getTotalProductsCount = () => {
    return Skill.reduce((total, skill) => {
      return total + (Array.isArray(skill.products) ? skill.products.length : 0)
    }, 0)
  }

  const getSkillSelectedCount = (skill) => {
    if (!Array.isArray(skill.products)) return 0
    return skill.products.filter((product) => selectedSkill[product._id]).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Skills & Expertise
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the skills and product expertise areas for this user. Choose specific products or entire skill
            categories.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with Controls */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center text-white">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                <div>
                  <h3 className="text-xl font-semibold">Product Expertise Selection</h3>
                  <p className="text-blue-100 text-sm">
                    {getTotalSelectedCount()} of {getTotalProductsCount()} products selected
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center border border-white/20"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.isArray(Skill) &&
                Skill.map((skill, index) => {
                  const isFullySelected = isSkillFullySelected(skill)
                  const isPartiallySelected = isSkillPartiallySelected(skill)
                  const selectedCount = getSkillSelectedCount(skill)
                  const totalCount = Array.isArray(skill.products) ? skill.products.length : 0

                  return (
                    <div
                      key={skill.productgroup}
                      className={`group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                        isFullySelected
                          ? "border-green-400 shadow-lg shadow-green-100"
                          : isPartiallySelected
                            ? "border-blue-400 shadow-lg shadow-blue-100"
                            : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {/* Skill Header */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            {/* Custom Checkbox */}
                            <div className="relative flex-shrink-0 mt-1">
                              <input
                                type="checkbox"
                                checked={isFullySelected}
                                onChange={(e) => handleSkillCheckboxChange(skill, e.target.checked)}
                                className="sr-only"
                              />
                              <div
                                onClick={() => handleSkillCheckboxChange(skill, !isFullySelected)}
                                className={`w-6 h-6 rounded-lg border-2 cursor-pointer transition-all duration-300 flex items-center justify-center ${
                                  isFullySelected
                                    ? "bg-green-500 border-green-500 shadow-lg"
                                    : isPartiallySelected
                                      ? "bg-blue-500 border-blue-500 shadow-lg"
                                      : "border-gray-300 hover:border-blue-400 bg-white"
                                }`}
                              >
                                {isFullySelected ? (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                ) : isPartiallySelected ? (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex-1">
                              <h3
                                className={`text-lg font-bold transition-colors duration-300 ${
                                  isFullySelected
                                    ? "text-green-700"
                                    : isPartiallySelected
                                      ? "text-blue-700"
                                      : "text-gray-800 group-hover:text-blue-700"
                                }`}
                              >
                                {skill.productgroup}
                              </h3>
                              <div className="flex items-center mt-2">
                                <div
                                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                                    isFullySelected
                                      ? "bg-green-100 text-green-700"
                                      : isPartiallySelected
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {selectedCount} of {totalCount} selected
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Progress Ring */}
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-gray-200"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className={
                                  isFullySelected
                                    ? "text-green-500"
                                    : isPartiallySelected
                                      ? "text-blue-500"
                                      : "text-gray-300"
                                }
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                fill="none"
                                strokeDasharray={`${(selectedCount / totalCount) * 100}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                className={`text-xs font-bold ${
                                  isFullySelected
                                    ? "text-green-600"
                                    : isPartiallySelected
                                      ? "text-blue-600"
                                      : "text-gray-500"
                                }`}
                              >
                                {Math.round((selectedCount / totalCount) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Products List */}
                      <div className="p-6">
                        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                          {Array.isArray(skill.products) &&
                            skill.products.map((product) => (
                              <div
                                key={product._id}
                                className={`flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-gray-50 ${
                                  selectedSkill[product._id] ? "bg-blue-50 border border-blue-200" : "hover:shadow-sm"
                                }`}
                              >
                                {/* Product Checkbox */}
                                <div className="relative flex-shrink-0 mr-3">
                                  <input
                                    type="checkbox"
                                    checked={!!selectedSkill[product._id]}
                                    onChange={(e) => handleProductCheckboxChange(product._id, e.target.checked)}
                                    className="sr-only"
                                  />
                                  <div
                                    onClick={() =>
                                      handleProductCheckboxChange(product._id, !selectedSkill[product._id])
                                    }
                                    className={`w-5 h-5 rounded-md border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                      selectedSkill[product._id]
                                        ? "bg-blue-500 border-blue-500 shadow-sm"
                                        : "border-gray-300 hover:border-blue-400 bg-white"
                                    }`}
                                  >
                                    {selectedSkill[product._id] && (
                                      <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-medium transition-colors duration-200 ${
                                      selectedSkill[product._id] ? "text-blue-700" : "text-gray-700"
                                    }`}
                                  >
                                    {product.product}
                                  </p>
                                </div>

                                {/* Selection Indicator */}
                                {selectedSkill[product._id] && (
                                  <div className="flex-shrink-0 ml-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Selection Status Badge */}
                      {(isFullySelected || isPartiallySelected) && (
                        <div className="absolute -top-2 -right-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                              isFullySelected ? "bg-green-500" : "bg-blue-500"
                            }`}
                          >
                            {isFullySelected ? (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>

            {/* Summary Section */}
            {getTotalSelectedCount() > 0 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-green-800">Selection Summary</h4>
                      <p className="text-green-700">
                        {getTotalSelectedCount()} products selected across{" "}
                        {Skill.filter((skill) => getSkillSelectedCount(skill) > 0).length} skill categories
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{getTotalSelectedCount()}</div>
                    <div className="text-sm text-green-600">Total Skills</div>
                  </div>
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Skills Selection Guide</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-center">
                      <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Click skill category headers to select/deselect entire groups
                    </li>
                    <li className="flex items-center">
                      <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Individual products can be selected independently
                    </li>
                    <li className="flex items-center">
                      <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Progress rings show completion percentage for each category
                    </li>
                    <li className="flex items-center">
                      <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Use "Select All" and "Clear All" for quick bulk operations
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}
