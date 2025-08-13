"use client"

import { useEffect, useState } from "react"
import axios from "axios"

// <CHANGE> Added custom PermissionButton component for reports
const PermissionButton = ({ permission, reportId, isGranted, onChange }) => {
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
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            )}
          </div>
          <span className="text-sm font-medium">No</span>
        </button>
      </div>
    </div>
  )
}

const ReportsSection = ({ watch, setValue, register, isEditing, currentRoleData, reportsList }) => {
  const [reports, setReports] = useState([])
  const [selectedReports, setSelectedReports] = useState({})

  useEffect(() => {
    if (reportsList && reportsList.length > 0) {
      setReports(reportsList)

      // Initialize selected reports
      const initialState = {}
      reportsList.forEach((report) => {
        initialState[report._id] = false
      })

      // If editing, set the pre-selected reports
      if (isEditing && currentRoleData?.reports) {
        currentRoleData.reports.forEach((report) => {
          initialState[report.reportId] = true
        })
      }

      setSelectedReports(initialState)
    } else {
      // Fallback to fetch if reportsList is not provided
      axios
        .get(`${process.env.REACT_APP_BASE_URL}/role/reports`)
        .then((res) => {
          setReports(res.data)

          // Initialize selected reports
          const initialState = {}
          res.data.forEach((report) => {
            initialState[report._id] = false
          })

          // If editing, set the pre-selected reports
          if (isEditing && currentRoleData?.reports) {
            currentRoleData.reports.forEach((report) => {
              initialState[report.reportId] = true
            })
          }

          setSelectedReports(initialState)
        })
        .catch((err) => {
          console.error("Failed to fetch reports:", err)
        })
    }
  }, [reportsList, isEditing, currentRoleData])

  const handleCheckboxChange = (id) => {
    setSelectedReports((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const selectAllReports = () => {
    const allSelected = {}
    reports.forEach((report) => {
      allSelected[report._id] = true
    })
    setSelectedReports(allSelected)
  }

  const deselectAllReports = () => {
    const noneSelected = {}
    reports.forEach((report) => {
      noneSelected[report._id] = false
    })
    setSelectedReports(noneSelected)
  }

  // <CHANGE> Added global permission functions
  const grantAllPermissions = () => {
    reports
      .filter((report) => selectedReports[report._id])
      .forEach((report) => {
        ["read", "write", "edit", "delete"].forEach((perm) =>
          setValue(`reportPermissions.${report._id}.${perm}`, true)
        )
      })
  }

  const revokeAllPermissions = () => {
    reports
      .filter((report) => selectedReports[report._id])
      .forEach((report) => {
        ["read", "write", "edit", "delete"].forEach((perm) =>
          setValue(`reportPermissions.${report._id}.${perm}`, false)
        )
      })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
            Reports Access
          </h3>
          <p className="text-sm text-gray-600 mt-1">Select reports to grant access</p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={selectAllReports}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 text-sm font-medium shadow-sm"
          >
            Select All Reports
          </button>
          <button
            type="button"
            onClick={deselectAllReports}
            className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 text-sm font-medium shadow-sm"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Report Selection */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-teal-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => {
            const isSelected = selectedReports[report._id] || false
            return (
              <div 
                key={report._id} 
                className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'border-teal-300 bg-teal-50 shadow-sm' 
                    : 'border-gray-200 bg-white hover:border-teal-200 hover:bg-teal-25'
                }`}
                onClick={() => handleCheckboxChange(report._id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    isSelected 
                      ? 'border-teal-500 bg-teal-500' 
                      : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`font-medium transition-colors duration-200 ${
                    isSelected ? 'text-teal-800' : 'text-gray-700'
                  }`}>
                    {report.name}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Permissions Section */}
      {reports.filter((report) => selectedReports[report._id]).length > 0 && (
        <div className="space-y-6 h-screen overflow-y-auto ">
          <div className="flex justify-between items-center pr-2">
            <div>
              <h4 className="text-lg font-semibold text-teal-800 flex items-center">
                <div className="w-2 h-2 bg-teal-400 rounded-full mr-3"></div>
                Report Permissions
              </h4>
              <p className="text-sm text-gray-600 mt-1">Configure permissions for selected reports</p>
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

          {reports
            .filter((report) => selectedReports[report._id])
            .map((report) => {
              const reportName = report.name || report._id
              return (
                <div key={report._id} className="bg-white/70 backdrop-blur-sm rounded-xl mr-3 border border-teal-200 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h5 className="text-lg font-semibold text-teal-800 flex items-center">
                      <div className="w-2 h-2 bg-teal-400 rounded-full mr-3"></div>
                      {reportName} Permissions
                    </h5>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          ["read", "write", "edit", "delete"].forEach((perm) =>
                            setValue(`reportPermissions.${report._id}.${perm}`, true)
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
                            setValue(`reportPermissions.${report._id}.${perm}`, false)
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
                        reportId={report._id}
                        isGranted={watch(`reportPermissions.${report._id}.${permission}`) || false}
                        onChange={(granted) => setValue(`reportPermissions.${report._id}.${permission}`, granted)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

export default ReportsSection
