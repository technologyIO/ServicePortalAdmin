"use client"

import { useEffect, useState } from "react"
import axios from "axios"

// <CHANGE> Added custom PermissionButton component for mobile components
const PermissionButton = ({ permission, componentId, isGranted, onChange }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 capitalize">{permission}</h4>
      <div className="flex space-x-4">
        {/* Yes Button */}
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${isGranted
            ? 'border-green-300 bg-green-50 text-green-800'
            : 'border-gray-200 bg-white text-gray-600 hover:border-green-200'
            }`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isGranted ? 'border-green-500 bg-green-500' : 'border-gray-300'
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
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${!isGranted
            ? 'border-red-300 bg-red-50 text-red-800'
            : 'border-gray-200 bg-white text-gray-600 hover:border-red-200'
            }`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!isGranted ? 'border-red-500 bg-red-500' : 'border-gray-300'
            }`}>
            {!isGranted && (
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            )}
          </div>
          <span className="text-sm font-medium">No</span>
        </button>
      </div>
    </div>
  )
}

const MobileComponents = ({ watch, setValue, register, isEditing, currentRoleData, mobileComponentsList }) => {
  const [mobileComponents, setMobileComponents] = useState([])
  const [selectedComponents, setSelectedComponents] = useState({})

  useEffect(() => {
    if (mobileComponentsList && mobileComponentsList.length > 0) {
      setMobileComponents(mobileComponentsList)

      // Initialize selected components
      const initialSelection = {}
      mobileComponentsList.forEach((item) => {
        initialSelection[item._id] = false
      })

      // If editing, set the pre-selected components
      if (isEditing && currentRoleData?.mobileComponents) {
        currentRoleData.mobileComponents.forEach((comp) => {
          initialSelection[comp.componentId] = true
        })
      }

      setSelectedComponents(initialSelection)
    } else {
      // Fallback to fetch if mobileComponentsList is not provided
      axios
        .get(`${process.env.REACT_APP_BASE_URL}/role/mobilecomponents`)
        .then((response) => {
          setMobileComponents(response.data)

          // Initialize selected components
          const initialSelection = {}
          response.data.forEach((item) => {
            initialSelection[item._id] = false
          })

          // If editing, set the pre-selected components
          if (isEditing && currentRoleData?.mobileComponents) {
            currentRoleData.mobileComponents.forEach((comp) => {
              initialSelection[comp.componentId] = true
            })
          }

          setSelectedComponents(initialSelection)
        })
        .catch((error) => {
          console.error("Error fetching mobile components:", error)
        })
    }
  }, [mobileComponentsList, isEditing, currentRoleData])

  const handleCheckboxChange = (id) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const selectAllMobileComponents = () => {
    const allSelected = {}
    mobileComponents.forEach((comp) => {
      allSelected[comp._id] = true
    })
    setSelectedComponents(allSelected)
  }

  const deselectAllMobileComponents = () => {
    const noneSelected = {}
    mobileComponents.forEach((comp) => {
      noneSelected[comp._id] = false
    })
    setSelectedComponents(noneSelected)
  }

  // <CHANGE> Added global permission functions
  const grantAllPermissions = () => {
    mobileComponents
      .filter((comp) => selectedComponents[comp._id])
      .forEach((comp) => {
        ["read", "write", "edit", "delete"].forEach((perm) =>
          setValue(`mobilePermissions.${comp._id}.${perm}`, true)
        )
      })
  }

  const revokeAllPermissions = () => {
    mobileComponents
      .filter((comp) => selectedComponents[comp._id])
      .forEach((comp) => {
        ["read", "write", "edit", "delete"].forEach((perm) =>
          setValue(`mobilePermissions.${comp._id}.${perm}`, false)
        )
      })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
            Mobile Components Access
          </h3>
          <p className="text-sm text-gray-600 mt-1">Select mobile components to grant access</p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={selectAllMobileComponents}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-sm"
          >
            Select All Components
          </button>
          <button
            type="button"
            onClick={deselectAllMobileComponents}
            className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 text-sm font-medium shadow-sm"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Components Selection */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-orange-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mobileComponents.map((component) => {
            const isSelected = selectedComponents[component._id] || false
            return (
              <div
                key={component._id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${isSelected
                  ? 'border-orange-300 bg-orange-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-25'
                  }`}
                onClick={() => handleCheckboxChange(component._id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300 bg-white'
                    }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`font-medium transition-colors duration-200 ${isSelected ? 'text-orange-800' : 'text-gray-700'
                    }`}>
                    {component.name}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Permissions Section */}
      {mobileComponents.filter((comp) => selectedComponents[comp._id]).length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold text-orange-800 flex items-center">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                Mobile Component Permissions
              </h4>
              <p className="text-sm text-gray-600 mt-1">Configure permissions for selected mobile components</p>
            </div>
            {/* <CHANGE> Added global permission buttons */}
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
          <div className=" h-screen overflow-y-auto pr-3 ">
            {mobileComponents
              .filter((comp) => selectedComponents[comp._id])
              .map((component) => {
                const componentName = component.name || component._id
                return (
                  <div key={component._id} className="bg-white/70  backdrop-blur-sm rounded-xl border border-orange-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h5 className="text-lg font-semibold text-orange-800 flex items-center">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                        {componentName} Permissions
                      </h5>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            ["read", "write", "edit", "delete"].forEach((perm) =>
                              setValue(`mobilePermissions.${component._id}.${perm}`, true)
                            )
                          }}
                          className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-all duration-200 text-sm font-medium"
                        >
                          Grant All
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            ["read", "write", "edit", "delete"].forEach((perm) =>
                              setValue(`mobilePermissions.${component._id}.${perm}`, false)
                            )
                          }}
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
                          isGranted={watch(`mobilePermissions.${component._id}.${permission}`) || false}
                          onChange={(granted) => setValue(`mobilePermissions.${component._id}.${permission}`, granted)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileComponents
