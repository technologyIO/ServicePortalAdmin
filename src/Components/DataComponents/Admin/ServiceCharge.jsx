import React, { useEffect, useState } from "react";
import { Modal, ModalDialog } from "@mui/joy";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import LoadingSpinner from "../../../LoadingSpinner";

// API root

const emptyData = {
  partNumber: "",
  description: "",
  Product: "",
  cmcPrice: "",
  ncmcPrice: "",
  onCallVisitCharge: {
    withinCity: "",
    outsideCity: "",
  },
  remarks: "",
};

function ServiceCharge() {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [currentData, setCurrentData] = useState(emptyData);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loader, setLoader] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDownloadingServiceCharge, setIsDownloadingServiceCharge] =
    useState(false);

  const downloadServiceChargeExcel = async () => {
    setIsDownloadingServiceCharge(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/excel/servicecharges/export-servicecharges`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `service_charges_data_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Download failed");
        alert("Failed to download Service Charge Excel file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    } finally {
      setIsDownloadingServiceCharge(false);
    }
  };
  // Data fetch
  const getData = async (newPage = page) => {
    setLoader(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/admin/service-charge/allservicecharge?page=${newPage}&limit=${limit}`
      );
      setData(res.data.serviceCharges || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setData([]);
      setTotalPages(1);
    }
    setLoader(false);
  };

  // Search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      getData(1);
      setPage(1);
      return;
    }
    setLoader(true);
    try {
      const res = await axios.get(
        `${
          process.env.REACT_APP_BASE_URL
        }/admin/service-charge/search/${encodeURIComponent(searchQuery.trim())}`
      );

      setData(res.data.serviceCharges || []);
      setTotalPages(1);
      setPage(1);
    } catch {
      setData([]);
    }
    setLoader(false);
  };

  // Create
  const handleCreate = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/admin/service-charge`,
        {
          ...currentData,
          cmcPrice: Number(currentData.cmcPrice),
          ncmcPrice: Number(currentData.ncmcPrice),
          onCallVisitCharge: {
            withinCity: Number(currentData.onCallVisitCharge.withinCity),
            outsideCity: Number(currentData.onCallVisitCharge.outsideCity),
          },
        }
      );
      Swal.fire("Created!", "", "success");
      getData();
    } catch {
      Swal.fire("Failed to create!", "", "error");
    }
    handleCloseModal();
  };
  useEffect(() => {
    if (!searchQuery) {
      getData();
    }
  }, [searchQuery]);
  // Update
  const handleEdit = async (id) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/admin/service-charge/${id}`,
        {
          ...currentData,
          cmcPrice: Number(currentData.cmcPrice),
          ncmcPrice: Number(currentData.ncmcPrice),
          onCallVisitCharge: {
            withinCity: Number(currentData.onCallVisitCharge.withinCity),
            outsideCity: Number(currentData.onCallVisitCharge.outsideCity),
          },
        }
      );
      Swal.fire("Updated!", "", "success");
      getData();
    } catch {
      Swal.fire("Failed to update!", "", "error");
    }
    handleCloseModal();
  };

  // Delete
  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete?",
      text: "Can't be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `${process.env.REACT_APP_BASE_URL}/admin/service-charge/${id}`
          )
          .then(() => {
            Swal.fire("Deleted!", "", "success");
            setSelectedRows((prev) => prev.filter((row) => row !== id));
            getData();
          });
      }
    });
  };

  // Modal controls
  const handleCloseModal = () => {
    setShowModal(false);
    setEditModal(false);
    setCurrentData(emptyData);
  };
  const handleOpenModal = (item) => {
    setEditModal(!!item?._id);
    setCurrentData(
      item && item._id
        ? {
            ...item,
            onCallVisitCharge: { ...item.onCallVisitCharge },
          }
        : { ...emptyData }
    );
    setShowModal(true);
  };

  // Form controls
  const handleFormData = (name, value) => {
    if (name === "withinCity" || name === "outsideCity") {
      setCurrentData((prev) => ({
        ...prev,
        onCallVisitCharge: {
          ...prev.onCallVisitCharge,
          [name]: value,
        },
      }));
    } else {
      setCurrentData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Submit
  const handleSubmit = (id) => {
    if (editModal && id) handleEdit(id);
    else handleCreate();
  };

  // Select logic
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedRows(!selectAll ? data.map((item) => item._id) : []);
  };
  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]
    );
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (!selectedRows.length) return;
    Swal.fire({
      title: `Delete ${selectedRows.length}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete All",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `${process.env.REACT_APP_BASE_URL}/admin/service-charge/bulk-delete`,
            { ids: selectedRows }
          )
          .then(() => {
            setSelectedRows([]);
            getData();
            Swal.fire("Deleted!", "", "success");
          });
      }
    });
  };

  // Pagination
  const handlePreviousPage = () => page > 1 && setPage(page - 1);
  const handleNextPage = () => page < totalPages && setPage(page + 1);

  useEffect(() => {
    if (!searchQuery) getData(page);
    // eslint-disable-next-line
  }, [page]);
  useEffect(() => {
    setPage(1);
    if (!searchQuery) getData(1);
    // eslint-disable-next-line
  }, [searchQuery]);

  return (
    <>
      {/* Top controls */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <FormControl sx={{ flex: 1 }} size="sm">
            <Input
              size="sm"
              placeholder="Search"
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FormControl>
          <button
            onClick={handleSearch}
            className="text-white bg-blue-700 rounded px-5 py-1.5 text-sm"
          >
            Search
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleOpenModal()}
            className="text-white w-full text-nowrap col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center mb-2"
          >
            Create
          </button>
          <button
            className={`text-white w-full text-nowrap col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center mb-2 ${
              isDownloadingServiceCharge
                ? "bg-gray-500 cursor-not-allowed"
                : "text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center mb-2"
            }`}
            onClick={downloadServiceChargeExcel}
            disabled={isDownloadingServiceCharge}
          >
            {isDownloadingServiceCharge ? (
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
      {/* Bulk delete */}
      {/* {selectedRows.length > 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleBulkDelete}
            className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 font-medium rounded text-sm px-5 py-2"
          >
            Delete Selected
          </button>
        </div>
      )} */}
      {/* Table */}
      <div className="overflow-x-auto w-full rounded shadow-sm">
        <table className="w-full border text-sm min-w-max">
          <thead className="bg-blue-700">
            <tr className="text-white">
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-3">Part Number</th>
              <th className="p-3">Description</th>
              <th className="p-3">Product</th>
              <th className="p-3">CMC Price</th>
              <th className="p-3">NCMC Price</th>
              <th className="p-3">On-Call (With in city)</th>
              <th className="p-3">On-Call (Outside city)</th>
              <th className="p-3">Remarks</th>
              <th className="p-3">Created</th>
              <th className="p-3">Modified</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loader ? (
              <tr>
                <td colSpan={12} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-6 text-center text-gray-400">
                  No Data
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item._id)}
                      onChange={() => handleRowSelect(item._id)}
                    />
                  </td>
                  <td className="p-3">{item.partNumber}</td>
                  <td className="p-3">{item.description}</td>
                  <td className="p-3">{item.Product}</td>
                  <td className="p-3">{item.cmcPrice}</td>
                  <td className="p-3">{item.ncmcPrice}</td>
                  <td className="p-3">{item?.onCallVisitCharge?.withinCity}</td>
                  <td className="p-3">
                    {item?.onCallVisitCharge?.outsideCity}
                  </td>
                  <td className="p-3">{item.remarks}</td>
                  <td className="p-3">
                    {moment(item.createdAt).format("MMM D, YYYY")}
                  </td>
                  <td className="p-3">
                    {moment(item.updatedAt).format("MMM D, YYYY")}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="border p-1 bg-blue-700 text-white rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="border p-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center my-4">
        <button
          className={`border rounded p-1 ${
            page === 1 ? "cursor-not-allowed" : "cursor-pointer"
          } w-[100px] bg-gray-100 font-semibold`}
          onClick={handlePreviousPage}
          disabled={page === 1}
        >
          Previous
        </button>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)
            )
            .map((p, i, arr) => (
              <React.Fragment key={p}>
                {i > 0 && p !== arr[i - 1] + 1 && <span>...</span>}
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
          className="border rounded p-1 hover:bg-blue-500 bg-blue-700 w-[100px] text-white font-semibold"
          onClick={handleNextPage}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={handleCloseModal} size="lg">
        <ModalDialog size="lg" className="p-2 w-[700px] thin-scroll">
          <div className="flex items-start justify-between p-2 border-b px-5">
            <h3 className="text-xl font-semibold">
              {editModal ? "Update Service Charge" : "Create Service Charge"}
            </h3>
            <div
              onClick={handleCloseModal}
              className="border p-2 rounded hover:bg-gray-200 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
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
            }}
            className="thin-scroll"
          >
            <div className="grid md:grid-cols-2 gap-4 my-7">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Part Number
                </label>
                <input
                  type="text"
                  required
                  value={currentData.partNumber}
                  onChange={(e) => handleFormData("partNumber", e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={currentData.description}
                  onChange={(e) =>
                    handleFormData("description", e.target.value)
                  }
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Product
                </label>
                <input
                  type="text"
                  required
                  value={currentData.Product}
                  onChange={(e) => handleFormData("Product", e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  CMC Price
                </label>
                <input
                  type="number"
                  required
                  value={currentData.cmcPrice}
                  onChange={(e) => handleFormData("cmcPrice", e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  NCMC Price
                </label>
                <input
                  type="number"
                  required
                  value={currentData.ncmcPrice}
                  onChange={(e) => handleFormData("ncmcPrice", e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  On-Call (Within City)
                </label>
                <input
                  type="number"
                  required
                  value={currentData.onCallVisitCharge.withinCity}
                  onChange={(e) => handleFormData("withinCity", e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  On-Call (Outside City)
                </label>
                <input
                  type="number"
                  required
                  value={currentData.onCallVisitCharge.outsideCity}
                  onChange={(e) =>
                    handleFormData("outsideCity", e.target.value)
                  }
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Remarks
                </label>
                <input
                  type="text"
                  value={currentData.remarks}
                  onChange={(e) => handleFormData("remarks", e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-3 rounded-b">
              <button
                type="button"
                onClick={handleCloseModal}
                className="border shadow text-black hover:bg-gray-200 font-medium rounded px-5 py-2"
              >
                Close
              </button>
              <button
                type="submit"
                className="text-white bg-blue-700  hover:bg-blue-800 font-medium rounded px-8 py-2"
              >
                {editModal ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </ModalDialog>
      </Modal>
    </>
  );
}

export default ServiceCharge;
