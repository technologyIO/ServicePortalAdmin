import React, { useEffect, useState } from "react";

import FormControl from "@mui/joy/FormControl";

import Input from "@mui/joy/Input";

import SearchIcon from "@mui/icons-material/Search";

import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
} from "@mui/joy";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import BulkModal from "../BulkUpload.jsx/BulkModal";
import CheckListBulk from "./Bulk/CheckListBulk";

const AdminChecklist = () => {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [countrys, setCountries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [CheckListtype, setCheckListtype] = useState([]);

  const [checkpointtype, setcheckpointtype] = useState([]);
  const [productgroup, setproductgroup] = useState([]);
  const limit = 10;
  const [isOpen, setIsOpen] = useState(false);
  const [loader, setLoader] = useState(true);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDownloadingChecklist, setIsDownloadingChecklist] = useState(false);

  const downloadChecklistExcel = async () => {
    setIsDownloadingChecklist(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/excel/checklists/export-checklists`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `checklists_data_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Download failed");
        alert("Failed to download CheckList Excel file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    } finally {
      setIsDownloadingChecklist(false);
    }
  };

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-4 w-4 mr-2"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      // Select all rows
      setSelectedRows(data?.map((country) => country._id));
    } else {
      // Deselect all rows
      setSelectedRows([]);
    }
  };
  const handleRowSelect = (countryId) => {
    if (selectedRows.includes(countryId)) {
      // Deselect the row
      setSelectedRows(selectedRows.filter((id) => id !== countryId));
    } else {
      // Select the row
      setSelectedRows([...selectedRows, countryId]);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditModal(false);
    setCurrentData({});
  };

  useEffect(() => {
    const fetchAllChecklistTypes = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allchecklisttype`
        );
        console.log("API Response:", res.data); // Logs the response to verify structure
        setCheckListtype(res.data || []); // Directly use res.data as it's already the array
      } catch (error) {
        console.error("Error fetching data:", error);
        setCheckListtype([]); // Set an empty array in case of an error
      }
    };

    fetchAllChecklistTypes();
  }, []);

  useEffect(() => {
    console.log("CheckListtype state updated:", CheckListtype); // Log updated state
  }, [CheckListtype]);

  useEffect(() => {
    const fetchallcheckpointtype = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allcheckpointtype`
        );
        console.log("API Response:", res.data); // Logs the response to verify structure
        setcheckpointtype(res.data || []); // Directly use res.data as it's already the array
      } catch (error) {
        console.error("Error fetching data:", error);
        setcheckpointtype([]); // Set an empty array in case of an error
      }
    };

    fetchallcheckpointtype();
  }, []);

  useEffect(() => {
    console.log("CheckListtype state updated:", checkpointtype); // Log updated state
  }, [checkpointtype]);

  useEffect(() => {
    const fetchallproductgroup = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allproductgroup`
        );
        console.log("API Response:", res.data); // Logs the response to verify structure
        setproductgroup(res.data || []); // Directly use res.data as it's already the array
      } catch (error) {
        console.error("Error fetching data:", error);
        setproductgroup([]); // Set an empty array in case of an error
      }
    };

    fetchallproductgroup();
  }, []);

  useEffect(() => {
    console.log("CheckListtype state updated:", productgroup); // Log updated state
  }, [productgroup]);

  // Open Modal and fetch checklist data
  const handleOpenModal = (country) => {
    setCurrentData(country || {}); // Use empty object for create
    setShowModal(true); // Show modal
    setEditModal(!!country); // Set to true if country exists, false otherwise
  };

  const handleFormData = (name, value) => {
    setCurrentData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
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
          .delete(
            `${process.env.REACT_APP_BASE_URL}/collections/checklist/${id}`
          )
          .then((res) => {
            Swal.fire("Deleted!", "Countrys has been deleted.", "success");
          })
          .then((res) => {
            getAllData();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      return;
    }

    setLoader(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/searchchecklist?q=${searchQuery}`
      );
      setData(response.data);
      setLoader(false);
    } catch (error) {
      console.error("Error searching users:", error);
      setLoader(false);
    }
  };
  const getAllData = () => {
    setLoader(true);
    setSearchQuery("");
    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/collections/checklist?page=${page}&limit=${limit}`
      )
      .then((res) => {
        setLoader(false);

        setData(res.data.checklists);
        setTotalPages(res.data.totalPages);
      })
      .catch((error) => {
        setLoader(false);

        console.log(error);
      });
  };
  useEffect(() => {
    if (!searchQuery) {
      getAllData();
    }
  }, [searchQuery]);
  useEffect(() => {
    getAllData();
    // getAllCountries()
  }, [page]);

  const handleSubmit = (id) => {
    if (editModal && id) {
      handleEditData(id);
    } else {
      handleAddData();
    }
  };

  const handleAddData = () => {
    axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/collections/checklist`,
        currentData
      )
      .then((res) => {
        getAllData();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleEditData = (id) => {
    axios
      .put(
        `${process.env.REACT_APP_BASE_URL}/collections/checklist/${id}`,
        currentData
      )
      .then((res) => {
        getAllData();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <>
      {loader ? (
        <div className="flex items-center justify-center h-[60vh]">
          <span class="CustomLoader"></span>
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
                />
              </FormControl>
              <button
                onClick={handleSearch}
                type="button"
                className="text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2 mb-2"
              >
                Search
              </button>
            </div>

            <div className="flex gap-3 ">
              <button
                onClick={openModal}
                type="button"
                className="text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br  focus:outline-none  font-medium rounded-[3px] text-sm  py-1.5 text-center  mb-2"
              >
                Upload
              </button>
              <button
                onClick={() => handleOpenModal()} // Call without arguments for create
                type="button"
                className="text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br  focus:outline-none  font-medium rounded-[3px] text-sm  py-1.5 text-center  mb-2"
              >
                Create
              </button>
              <button
                type="button"
                className="text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br  focus:outline-none  font-medium rounded-[3px] text-sm  py-1.5 text-center  mb-2"
              >
                Filter
              </button>
              <button
                className={`text-white w-full text-nowrap col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center mb-2 ${
                  isDownloadingChecklist
                    ? "bg-gray-500 cursor-not-allowed"
                    : "text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center mb-2"
                }`}
                onClick={downloadChecklistExcel}
                disabled={isDownloadingChecklist}
              >
                {isDownloadingChecklist ? (
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

          <div className="relative w-full overflow-x-auto">
            <table className="w-full  border  min-w-max caption-bottom text-sm">
              <thead className="[&amp;_tr]:border-b bg-blue-700 ">
                <tr className="border-b transition-colors  text-white hover:bg-muted/50 data-[state=selected]:bg-muted">
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
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Checklist Type
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Checkpoint Type
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Checkpoint
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    ProdGroup
                  </th>
                  {/* <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Result
                  </th> */}
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Created Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Modified Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Result Type
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Start Voltage
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    End Voltage
                  </th>

                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="[&amp;_tr:last-child]:border-0  ">
                {data?.map((i, index) => (
                  <tr
                    key={i._id}
                    className="border-b transition-colors  data-[state=selected]:bg-muted"
                  >
                    <th scope="col" className="p-4">
                      <div className="flex items-center">
                        <input
                          id={`checkbox-${index}`}
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                          checked={selectedRows?.includes(i?._id)}
                          onChange={() => handleRowSelect(i?._id)}
                        />
                        <label
                          htmlFor={`checkbox-${index}`}
                          className="sr-only"
                        >
                          checkbox
                        </label>
                      </div>
                    </th>
                    <td className="p-4 font-bold text-md capitalize align-middle whitespace-nowrap">
                      {i?.checklisttype}
                    </td>
                    <td className="p-4  text-md capitalize align-middle whitespace-nowrap">
                      {i?.checkpointtype}
                    </td>
                    <td className="p-4  text-md capitalize align-middle whitespace-nowrap">
                      {i?.checkpoint}
                    </td>
                    <td className="p-4  text-md capitalize align-middle whitespace-nowrap">
                      {i?.prodGroup}
                    </td>
                    {/* <td className="p-4  text-md capitalize align-middle whitespace-nowrap">
                      {i?.result}
                    </td> */}

                    <td className="p-4 align-middle whitespace-nowrap">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded border ${
                          i?.status === "Active"
                            ? "bg-green-100 text-green-800 border-green-400"
                            : i?.status === "Inactive"
                            ? "bg-red-100 text-red-800  border-red-400"
                            : "bg-orange-100 text-orange-800  border-orange-400"
                        }`}
                      >
                        {i?.status}
                      </span>
                    </td>

                    <td className="p-4 align-middle whitespace-nowrap">
                      {moment(i?.createdAt).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4 align-middle whitespace-nowrap">
                      {moment(i?.modifiedAt).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4  text-md capitalize align-middle whitespace-nowrap">
                      {i?.resulttype}
                    </td>
                    <td className="p-4  text-md capitalize align-middle whitespace-nowrap">
                      {i?.startVoltage}
                    </td>
                    <td className="p-4  text-md capitalize align-middle whitespace-nowrap">
                      {i?.endVoltage}
                    </td>

                    <td className="p-4 align-middle whitespace-nowrap">
                      <div className="flex gap-4 ">
                        <button
                          onClick={() => {
                            handleOpenModal(i);
                          }}
                          className="border p-[7px] bg-blue-700 text-white rounded cursor-pointer hover:bg-blue-500"
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
                              fill-rule="evenodd"
                              d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(i?._id)}
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className="Pagination-laptopUp"
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "16px",
            }}
          >
            <button
              className={`border rounded p-1 ${
                page === 1 ? "cursor-not-allowed" : "cursor-pointer"
              } w-[100px] hover:bg-gray-300 px-2 bg-gray-100 font-semibold`}
              onClick={handlePreviousPage}
              disabled={page === 1}
            >
              Previous
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((p) => {
                  // Show the first page, last page, and pages around the current page
                  return (
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 3 && p <= page + 3)
                  );
                })
                .map((p, i, array) => (
                  <React.Fragment key={p}>
                    {/* Add ellipsis for skipped ranges */}
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
              className="border rounded p-1 cursor-pointer hover:bg-blue-500 px-2 bg-blue-700 w-[100px] text-white font-semibold"
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>

          <Modal
            open={showModal}
            onClose={handleCloseModal}
            className=""
            size="lg"
          >
            <ModalDialog size="lg" className="p-2 ">
              <div className="flex items-start justify-between p-2  px-5 border-solid border-blueGray-200 rounded-t thin-scroll">
                <h3 className="text-xl font-semibold">
                  {editModal ? "Update Checklist" : "Create Checklist"}
                </h3>
                <div
                  onClick={() => handleCloseModal()}
                  className=" border p-2 rounded-[4px] hover:bg-gray-200 cursor-pointer "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    className="bi bi-x-lg font-semibold "
                    viewBox="0 0 16 16"
                  >
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                  </svg>
                </div>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(currentData?._id);
                  handleCloseModal();
                }}
                className=""
              >
                <div className=" w-[300px] md:w-[500px] lg:w-[700px] border-b border-solid border-blueGray-200 p-3 flex-auto max-h-[380px] overflow-y-auto gap-6">
                  <div class="grid md:grid-cols-2 md:gap-6">
                    <div class="relative z-0 w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900">
                        Checklist Type{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <Select
                        required
                        className="rounded-[4px] py-2 border"
                        value={currentData?.checklisttype || ""}
                        onChange={(e, newValue) =>
                          handleFormData("checklisttype", newValue)
                        }
                      >
                        <Option value="">Select Checklist Type</Option>
                        {CheckListtype.map((item) => (
                          <Option key={item._id} value={item.name}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div class="relative z-0 w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900">
                        Checkpoint Type{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <Select
                        required
                        className="rounded-[4px] py-2 border"
                        value={currentData?.checkpointtype || ""}
                        onChange={(e, newValue) =>
                          handleFormData("checkpointtype", newValue)
                        }
                      >
                        <Option value="">Select CheckPoint Type</Option>
                        {checkpointtype.map((item) => (
                          <Option key={item._id} value={item.name}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div class="relative z-0 w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900">
                        Checkpoint{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <Select
                        variant="soft"
                        required
                        className="rounded-[4px] py-2 border"
                        defaultValue={currentData?.checkpoint || ""}
                        onChange={(e, value) =>
                          handleFormData("checkpoint", value)
                        }
                      >
                        <Option value="">Select CheckPoint</Option>
                        <Option value="Loose Contact in Plag point">
                          Loose Contact in Plag point
                        </Option>
                        <Option value="Power Cord Condition">
                          Power Cord Condition
                        </Option>
                        <Option value="Battery take Over">
                          Battery take Over
                        </Option>
                        <Option value="Keyboard/ Switch Conditions">
                          Keyboard/ Switch Conditions
                        </Option>
                        <Option value="Machine Cleanliness">
                          Machine Cleanliness
                        </Option>
                        <Option value="Accessory Cleanliness">
                          Accessory Cleanliness
                        </Option>
                        <Option value="Check ECG with cable ">
                          Check ECG with cable{" "}
                        </Option>
                        <Option value="Check RESP ">Check RESP </Option>
                        <Option value="Check NIBP with Cuff and hose assembly ">
                          Check NIBP with Cuff and hose assembly{" "}
                        </Option>
                        <Option value="Check TEMP with probe ">
                          Check TEMP with probe{" "}
                        </Option>
                        <Option value="Check Co2 with filter line ">
                          Check Co2 with filter line
                        </Option>
                        <Option value="Check AGM with Sampling line  ">
                          Check AGM with Sampling line
                        </Option>
                        <Option value="Check Spo2 with Sensor ">
                          Check Spo2 with Sensor
                        </Option>
                        <Option value="Battery Condition">
                          Battery Condition
                        </Option>
                        <Option value="Display Calibration">
                          Display Calibration
                        </Option>
                        <Option value="Bipolar Extn.Cable">
                          Bipolar Extn.Cable
                        </Option>
                        <Option value="Patient Plate">Patient Plate</Option>
                        <Option value="Electrode Handle">
                          Electrode Handle
                        </Option>
                        <Option value="Check Paddles ">Check Paddles </Option>
                        <Option value="Check power cord for any damage ">
                          Check power cord for any damage
                        </Option>
                        <Option value="Accessory Cleanliness ">
                          Accessory Cleanliness
                        </Option>
                        <Option value="Patient Plate Cable|">
                          Patient Plate Cable|
                        </Option>
                      </Select>
                    </div>
                    <div class="relative z-0 w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900">
                        ProdGroup{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <Select
                        required
                        className="rounded-[4px] py-2 border"
                        value={currentData?.prodGroup || ""}
                        onChange={(e, newValue) =>
                          handleFormData("prodGroup", newValue)
                        }
                      >
                        <Option value="">Select CheckPoint Type</Option>
                        {productgroup.map((item) => (
                          <Option key={item._id} value={item.name}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label class="block mb-2 text-sm font-medium text-gray-900">
                        Status{" "}
                      </label>

                      <Select
                        variant="soft"
                        className="rounded-[4px] py-2 border"
                        defaultValue={currentData?.status || ""}
                        onChange={(e, value) => handleFormData("status", value)}
                      >
                        <Option value="">Select Status</Option>
                        <Option value="Active">Active</Option>
                        <Option value="Pending">Pending</Option>
                        <Option value="Inactive">Inactive</Option>
                      </Select>
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Result Type{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <Select
                        variant="soft"
                        required
                        className="rounded-[4px] py-2 border"
                        defaultValue={currentData?.resulttype || ""}
                        onChange={(e, value) =>
                          handleFormData("resulttype", value)
                        }
                      >
                        <Option value="">Select Result Type</Option>
                        <Option value="Numeric Entry">Numeric Entry</Option>
                        <Option value="Yes / No">Yes / No</Option>
                        <Option value="Remarks">Remarks</Option>
                        <Option value="OK/NOT OK">OK/NOT OK</Option>
                      </Select>
                    </div>

                    {currentData?.resulttype === "Numeric Entry" && (
                      <div className="grid grid-cols-1   gap-6">
                        <div className="relative z-0 w-full mb-5 group">
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Start Voltage
                          </label>
                          <input
                            onChange={(e) =>
                              handleFormData("startVoltage", e.target.value)
                            }
                            type="text"
                            value={currentData?.startVoltage || ""}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Enter start voltage"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      {currentData?.resulttype === "Numeric Entry" && (
                        <div className="relative z-0 w-full mb-5 group">
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            End Voltage
                          </label>
                          <input
                            onChange={(e) =>
                              handleFormData("endVoltage", e.target.value)
                            }
                            type="text"
                            value={currentData?.endVoltage || ""}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Enter end voltage"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* <div className="relative z-0 w-full mb-5 group">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Result
                    </label>
                    {currentData?.resulttype === "Numeric Entry" && (
                      <input
                        onChange={(e) =>
                          handleFormData("result", e.target.value)
                        }
                        type="number"
                        value={currentData?.result}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5     "
                        placeholder="Enter numeric value"
                      />
                    )}
                    {currentData?.resulttype === "OK/NOT OK" && (
                      <div className="flex items-center gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="result"
                            value="OK"
                            checked={currentData?.result === "OK"}
                            onChange={(e) =>
                              handleFormData("result", e.target.value)
                            }
                            className="mr-2"
                          />
                          OK
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="result"
                            value="Not OK"
                            checked={currentData?.result === "Not OK"}
                            onChange={(e) =>
                              handleFormData("result", e.target.value)
                            }
                            className="mr-2"
                          />
                          Not OK
                        </label>
                      </div>
                    )}
                    {currentData?.resulttype === "Yes / No" && (
                      <div className="flex items-center gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="result"
                            value="Yes"
                            checked={currentData?.result === "Yes"}
                            onChange={(e) =>
                              handleFormData("result", e.target.value)
                            }
                            className="mr-2"
                          />
                          Yes
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="result"
                            value="No"
                            checked={currentData?.result === "No"}
                            onChange={(e) =>
                              handleFormData("result", e.target.value)
                            }
                            className="mr-2"
                          />
                          No
                        </label>
                      </div>
                    )}
                    {currentData?.resulttype === "Remarks" && (
                      <textarea
                        onChange={(e) =>
                          handleFormData("result", e.target.value)
                        }
                        value={currentData?.result}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5     "
                        placeholder="Enter remarks"
                        rows={3}
                      />
                    )}
                  </div> */}
                </div>
                <div className="flex items-center justify-end mt-3 rounded-b">
                  <button
                    onClick={() => handleCloseModal()}
                    type="button"
                    class="focus:outline-none border h-8  shadow text-black flex items-center hover:bg-gray-200  font-medium rounded-[4px] text-sm px-5 py-2.5    me-2 mb-2"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => handleSubmit(currentData?._id)}
                    type="submit"
                    className="text-white bg-blue-700 h-8 hover:bg-blue-800 focus:ring-4  flex items-center px-8 focus:ring-blue-300 font-medium rounded-[4px] text-sm  py-2.5 me-2 mb-2 :bg-blue-600 :hover:bg-blue-700 focus:outline-none :focus:ring-blue-800 me-2 mb-2"
                  >
                    {editModal ? "Update Checklist" : "Create Checklist"}
                  </button>
                </div>
              </form>
            </ModalDialog>
          </Modal>
          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              {/* Modal Content */}

              <div className="bg-white rounded-lg p-6    relative">
                <button
                  onClick={closeModal}
                  className="absolute top-0 text-3xl right-3 text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
                <CheckListBulk />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default AdminChecklist;
