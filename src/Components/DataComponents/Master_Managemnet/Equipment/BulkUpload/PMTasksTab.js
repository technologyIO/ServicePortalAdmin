"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar, Wrench, Filter, Search } from "lucide-react"
import { renderStatusBadge } from "./Utils/helpers"

export default function PMTasksTab({ jobId }) {
  const [pmTasks, setPmTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [filters, setFilters] = useState({
    pmType: "all",
    status: "all",
    pmStatus: "all",
    search: "",
  })

  const fetchPMTasks = async (page = 1, currentFilters = filters) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        type: "pm",
        ...Object.fromEntries(Object.entries(currentFilters).filter(([_, value]) => value && value !== "all")),
      })

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL || ""}/api/bulk-upload/results/${jobId}?${queryParams}`,
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch PM tasks: ${response.status}`)
      }

      const data = await response.json()

      // Extract PM tasks from the results
      const allPMTasks = []
      if (data.data) {
        data.data.forEach((equipment) => {
          if (equipment.pmResults) {
            equipment.pmResults.forEach((pm) => {
              allPMTasks.push({
                ...pm,
                equipmentId: equipment.equipmentid,
                serialNumber: equipment.serialnumber,
                equipmentStatus: equipment.status,
              })
            })
          }
        })
      }

      setPmTasks(allPMTasks)
      setPagination(data.pagination || pagination)
    } catch (error) {
      console.error("Error fetching PM tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (jobId) {
      fetchPMTasks(1)
    }
  }, [jobId])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPMTasks(newPage)
    }
  }

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value }
    setFilters(newFilters)
    fetchPMTasks(1, newFilters)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Due":
        return "text-yellow-600 bg-yellow-50"
      case "Overdue":
        return "text-red-600 bg-red-50"
      case "Lapsed":
        return "text-gray-600 bg-gray-50"
      case "Created":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  if (loading && pmTasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading PM tasks...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={filters.pmType}
            onChange={(e) => handleFilterChange("pmType", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All PM Types</option>
            <option value="WPM">WPM</option>
            <option value="EPM">EPM</option>
            <option value="CPM">CPM</option>
            <option value="NPM">NPM</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Created">Created</option>
            <option value="Skipped">Skipped</option>
            <option value="Failed">Failed</option>
          </select>

          <select
            value={filters.pmStatus}
            onChange={(e) => handleFilterChange("pmStatus", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All PM Statuses</option>
            <option value="Due">Due</option>
            <option value="Overdue">Overdue</option>
            <option value="Lapsed">Lapsed</option>
          </select>

          <div className="flex items-center gap-2 flex-1 min-w-64">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search equipment ID or serial number..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* PM Tasks Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Wrench size={20} />
            PM Tasks
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {pagination.startRecord || 1} to {pagination.endRecord || pagination.limit} of {pagination.total} PM
            tasks
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PM Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PM Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pmTasks.map((task, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{task.equipmentId}</div>
                      <div className="text-sm text-gray-500">S/N: {task.serialNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {task.pmType || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                        </div>
                        {task.dueMonth && <div className="text-xs text-gray-500">{task.dueMonth}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(task.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {task.pmStatus && (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.pmStatus)}`}
                      >
                        {task.pmStatus}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {task.reason && (
                      <div className="text-sm text-gray-600 max-w-xs truncate" title={task.reason}>
                        {task.reason}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pmTasks.length === 0 && !loading && (
          <div className="text-center py-12">
            <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
            <div className="text-gray-500">No PM tasks found</div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <span>•</span>
            <span>{pagination.total} total PM tasks</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev || loading}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pageNum === pagination.page
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext || loading}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
