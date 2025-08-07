"use client";

import React, { useEffect, useState } from "react";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { RefreshCw, X } from "lucide-react";
import LoadingSpinner from "../../../../LoadingSpinner";

const UserData = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [loader, setLoader] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(data?.map((item) => item._id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((itemId) => itemId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Permanently?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${process.env.REACT_APP_BASE_URL}/collections/user/${id}`)
          .then(() => {
            Swal.fire("Deleted!", "User has been deleted.", "success");
          })
          .then(() => {
            getData();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };
  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "Deactive" : "Active";

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/user/${user._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      const data = await response.json();

      setData((prevData) =>
        prevData.map((u) =>
          u._id === user._id ? { ...u, status: newStatus } : u
        )
      );

      if (newStatus === "Active") {
        toast.success("User activated successfully!");
      } else {
        toast.error("User deactivated successfully!");
      }

      // if (newStatus === "Deactive") {
      //   toast("User will be logged out from all devices");
      // }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (userId) => {
    navigate(`/user-edit/${userId}`);
  };
  const handleSearch = async (pageNum = 1) => {
    if (!searchQuery) return;
    setLoader(true);
    setIsSearchMode(true);
    setPage(pageNum);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/usersearch?q=${searchQuery}&page=${pageNum}&limit=${limit}`
      );

      setData(response.data.users);
      setTotalPages(response.data.totalPages);
      setTotalUsers(response.data.totalUsers);
      setLoader(false);
    } catch (error) {
      console.error("Error searching users:", error);
      setLoader(false);
    }
  };

  const getData = (pageNum = page) => {
    setLoader(true);
    setIsSearchMode(false);
    setPage(pageNum);

    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/collections/user?page=${pageNum}&limit=${limit}`
      )
      .then((res) => {
        setLoader(false);
        setData(res.data.users);
        setTotalPages(res.data.totalPages);
        setTotalUsers(res.data.totalUsers);
      })
      .catch((error) => {
        setLoader(false);
        console.log(error);
      });
  };

  useEffect(() => {
    getData();
  }, []);
  useEffect(() => {
    if (!searchQuery) {
      getData();
    }
  }, [searchQuery]);

  useEffect(() => {
    getData();
  }, [page]);

  const handlePreviousPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      if (isSearchMode) {
        handleSearch(newPage);
      } else {
        getData(newPage);
      }
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const newPage = page + 1;
      if (isSearchMode) {
        handleSearch(newPage);
      } else {
        getData(newPage);
      }
    }
  };

  // Helper function to format skills array
  const formatSkills = (skills) => {
    if (!skills || !Array.isArray(skills)) return "No skills";

    // Return the count of skills if there are many
    if (skills.length > 3) {
      return `${skills.length} skills`;
    }

    // Otherwise return product names joined with commas
    return skills.map((skill) => skill.productName).join(", ");
  };
  const getDemographicNames = (item, type) => {
    return (
      item?.demographics
        ?.find((d) => d.type === type)
        ?.values?.map((v) => v.name)
        ?.join(", ") || ""
    );
  };

  const handleRemoveDevice = async (userId) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/collections/remove-device`,
        {
          userId,
        }
      );

      if (res.data?.message) {
        toast.success(res.data.message);

        getData();
      }
    } catch (err) {
      console.error("Error removing device:", err);
      alert("Failed to remove device");
    }
  };

  const refreshpage = () => {
    setIsSpinning(true);
    getData();

    setTimeout(() => setIsSpinning(false), 1000);
  };
  const downloadExcel = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/excel/users/export-users`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users_data_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Download failed");
        alert("Failed to download Excel file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      {loader ? (
        <div className="flex items-center justify-center h-[60vh]">
          <span className="CustomLoader"></span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-3 justify-center">
              <FormControl sx={{ flex: 1 }} size="sm">
                <Input
                  size="sm"
                  placeholder="Search"
                  startDecorator={<SearchIcon />}
                  value={searchQuery}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </FormControl>
              <button
                onClick={() => handleSearch(1)}
                type="button"
                className="text-white w-full col-span-2 px-5 bg-blue-700 hover:bg-gradient-to-br font-medium rounded-[3px] text-sm py-1.5 mb-2"
              >
                Search
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSpinning(true);
                  getData();
                  setTimeout(() => setIsSpinning(false), 1000);
                }}
                className="text-white w-full col-span-2 px-5 bg-blue-700 hover:bg-gradient-to-br font-medium rounded-[3px] text-sm py-1.5 mb-2 flex items-center justify-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="text-white w-full col-span-2 px-5 bg-blue-700 hover:bg-gradient-to-br font-medium rounded-[3px] text-sm py-1.5 mb-2"
              >
                Upload
              </button>

              <button
                onClick={() => navigate("/user-create")}
                type="button"
                className="text-white w-full col-span-2 px-5 bg-blue-700 hover:bg-gradient-to-br font-medium rounded-[3px] text-sm py-1.5 mb-2"
              >
                Create
              </button>
              <button
                type="button"
                className="text-white w-full col-span-2 px-5 bg-blue-700 hover:bg-gradient-to-br font-medium rounded-[3px] text-sm py-1.5 mb-2"
              >
                Filter
              </button>
              <button
                className={`text-white text-nowrap w-full col-span-2 px-5 bg-blue-700 hover:bg-gradient-to-br font-medium rounded-[3px] text-sm py-1.5 mb-2
          ${
            isDownloading
              ? "bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed"
              : "text-white w-full col-span-2 px-5 bg-blue-700 hover:bg-gradient-to-br font-medium rounded-[3px] text-sm py-1.5 mb-2"
          }`}
                onClick={downloadExcel}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <div className="flex items-center">
                      <LoadingSpinner />
                      Downloading...
                    </div>
                  </>
                ) : (
                  <>Download Excel</>
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-end ">
            {/* {selectedRows?.length > 0 && (
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-[4px] text-sm px-5 py-2.5 mb-2"
              >
                Delete Selected
              </button>
            )} */}
          </div>
          {/* Add this div before the table */}
          <div className="flex justify-between items-center ">
            <div className="text-sm text-gray-600">
              {isSearchMode ? (
                <span>
                  Search Results:{" "}
                  <span className="font-semibold">{totalUsers}</span> users
                  found for "{searchQuery}"
                </span>
              ) : (
                <span>
                  Total Records:{" "}
                  <span className="font-semibold">{totalUsers}</span> users
                </span>
              )}
            </div>
          </div>

          <div className="relative w-full overflow-x-auto border">
            <table className="w-full border min-w-max caption-bottom text-sm">
              <thead className="[&amp;_tr]:border-b bg-blue-700">
                <tr className="border-b text-white">
                  <th scope="col" className="p-4">
                    <div className="flex items-center">
                      <input
                        id="checkbox-all-search"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                      <label htmlFor="checkbox-all-search" className="sr-only">
                        checkbox
                      </label>
                    </div>
                  </th>
                  <th className="px-4 text-left font-medium">Employee ID</th>

                  <th className="px-4 text-left font-medium">First Name</th>
                  <th className="px-4 text-left font-medium">Last Name</th>
                  <th className="px-4 text-left font-medium">Email</th>
                  <th className="px-4 text-left font-medium">Mobile Number</th>
                  <th className="px-4 text-left font-medium">User Type</th>
                  <th className="px-4 text-left font-medium">Role</th>
                  <th className="px-4 text-left font-medium">Manager Email</th>
                  <th className="px-4 text-left font-medium">Dealer </th>
                  <th className="px-4 text-left font-medium">Skills</th>
                  <th className="px-4 text-left font-medium">Status</th>
                  {/* <th className="px-4 text-left font-medium">Branch</th>
                  <th className="px-4 text-left font-medium">
                    Login Expiry Date
                  </th>

                  <th className="px-4 text-left font-medium">Geo</th>
                  <th className="px-4 text-left font-medium">Region</th>
                  <th className="px-4 text-left font-medium">Country</th>
                  <th className="px-4 text-left font-medium">State</th>
                  <th className="px-4 text-left font-medium">City</th>
                  <th className="px-4 text-left font-medium">Department</th>

                  <th className="px-4 text-left font-medium">Dealer Email</th>
                  <th className="px-4 text-left font-medium">Dealer Code</th> */}

                  <th className="px-4 text-left font-medium">Device ID</th>
                  {/* <th className="px-4 text-left font-medium">
                    Device Reg Date
                  </th>
                  <th className="px-4 text-left font-medium">Created Date</th>
                  <th className="px-4 text-left font-medium">Modified Date</th> */}
                  <th className="px-4 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((item, index) => {
                  console.log("item", item);
                  return (
                    <tr key={item?._id} className="border-b">
                      <th scope="row" className="p-4">
                        <div className="flex items-center">
                          <input
                            id={`checkbox-${index}`}
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                            checked={selectedRows?.includes(item?._id)}
                            onChange={() => handleRowSelect(item?._id)}
                          />
                          <label
                            htmlFor={`checkbox-${index}`}
                            className="sr-only"
                          >
                            checkbox
                          </label>
                        </div>
                      </th>
                      <td className="p-4">{item?.employeeid}</td>
                      <td className="p-4 capitalize">{item?.firstname}</td>
                      <td className="p-4 capitalize">{item?.lastname}</td>
                      <td className="p-4">{item?.email}</td>
                      <td className="p-4">{item?.mobilenumber}</td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
      ${item?.usertype === "skanray" ? "bg-green-100 text-green-800" : ""}
      ${item?.usertype === "dealer" ? "bg-yellow-100 text-yellow-800" : ""}
    `}
                        >
                          {item?.usertype}
                        </span>
                      </td>

                      <td className="p-4 capitalize">{item?.role?.roleName}</td>
                      <td className="p-4">{item?.manageremail?.join(", ")}</td>
                      <td className="p-4">{item?.dealerInfo?.dealerName}</td>
                      <td className="p-4">{formatSkills(item?.skills)}</td>
                      <td className="p-4">
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded border ${
                            item?.status === "Active"
                              ? "bg-green-100 text-green-800 border-green-400"
                              : item?.status === "Inactive"
                              ? "bg-red-100 text-red-800 border-red-400"
                              : "bg-orange-100 text-orange-800 border-orange-400"
                          }`}
                        >
                          {item?.status}
                        </span>
                      </td>
                      {/* <td className="p-4">
                        {Array.isArray(item?.branch)
                          ? item?.branch.join(", ")
                          : item?.branch}
                      </td> */}
                      {/* <td className="p-4">
                        {moment(item?.loginexpirydate).format("MMM D, YYYY")}
                      </td>

                      <td className="p-4">
                        {getDemographicNames(item, "geo")}
                      </td>
                      <td className="p-4">
                        {getDemographicNames(item, "region")}
                      </td>
                      <td className="p-4">
                        {getDemographicNames(item, "country")}
                      </td>
                      <td className="p-4">
                        {getDemographicNames(item, "state")}
                      </td>
                      <td className="p-4">
                        {getDemographicNames(item, "city")}
                      </td>

                      <td className="p-4">{item?.department}</td>

                      <td className="p-4">{item?.dealerInfo?.dealerEmail}</td>
                      <td className="p-4">{item?.dealerInfo?.dealerCode}</td> */}

                      <td className="p-4">
                        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-2 shadow-sm rounded-md w-fit min-w-[250px]">
                          <span className="text-sm text-blue-900 font-medium">
                            {item?.deviceid || "No Device ID"}
                          </span>
                          <button
                            onClick={() => handleRemoveDevice(item._id)}
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded h-8 px-4 bg-red-700 hover:bg-red-500 text-white text-sm font-medium leading-normal w-fit"
                          >
                            Remove
                          </button>
                        </div>
                      </td>

                      {/* <td className="p-4">
                        {item?.deviceregistereddate &&
                          moment(item?.deviceregistereddate).format(
                            "MMM D, YYYY [at] h:mm A"
                          )}{" "}
                      </td>
                      <td className="p-4">
                        {moment(item?.createdAt).format("MMM D, YYYY")}
                      </td>
                      <td className="p-4">
                        {moment(item?.modifiedAt).format("MMM D, YYYY")}
                      </td> */}
                      <td className="p-4">
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleEdit(item?._id)}
                            className="border p-2 bg-blue-700 text-white rounded hover:bg-blue-500"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-pencil-square"
                              viewBox="0 0 16 16"
                            >
                              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                              <path
                                fillRule="evenodd"
                                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item?._id)}
                            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-trash3-fill"
                              viewBox="0 0 16 16"
                            >
                              <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                            </svg>
                          </button>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={item?.status === "Active"}
                              onChange={() => handleToggleStatus(item)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute  pt-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {item?.status === "Active"
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="Pagination-laptopUp flex justify-between p-4">
            <button
              className={`border rounded p-1 w-[100px] ${
                page === 1 ? "cursor-not-allowed" : "cursor-pointer"
              } bg-gray-100 font-semibold hover:bg-gray-300`}
              onClick={handlePreviousPage}
              disabled={page === 1}
            >
              Previous
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 3 && p <= page + 3)
                )
                .map((p, i, array) => (
                  <React.Fragment key={p}>
                    {i > 0 && p !== array[i - 1] + 1 && <span>...</span>}
                    <button
                      className={`border px-3 rounded ${
                        p === page ? "bg-blue-700 text-white" : ""
                      }`}
                      onClick={() => setPage(p)}
                      disabled={p === page}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            <button
              className="border rounded p-1 w-[100px] bg-blue-700 text-white font-semibold hover:bg-blue-500"
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default UserData;
