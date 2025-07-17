import React, { useEffect, useState } from "react";

import FormControl from "@mui/joy/FormControl";

import Input from "@mui/joy/Input";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import SearchIcon from "@mui/icons-material/Search";

import { Modal, ModalDialog, Option, Select } from "@mui/joy";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import BulkModal from "../../BulkUpload.jsx/BulkModal";
import ProductBulk from "./ProductBulk";
function Product() {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [loader, setLoader] = useState(true);
  const limit = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [cityList, setCityList] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const getCities = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/collections/city`)
      .then((res) => {
        setCityList(res.data.city);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getCities();
  }, []);

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
    setShowModal((prev) => !prev);
    setEditModal(false);
    setCurrentData({});
  };

  const handleOpenModal = (country) => {
    setCurrentData(country);
    setEditModal(true);
    setShowModal(true);
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
          .delete(`${process.env.REACT_APP_BASE_URL}/collections/product/${id}`)
          .then((res) => {
            Swal.fire("Deleted!", "Countrys has been deleted.", "success");
          })
          .then((res) => {
            getData();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      getData(); // Reset to normal data if search is empty
      return;
    }

    setLoader(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/searchProduct?q=${searchQuery}`
      );
      // Make sure to set the data properly
      setData(response.data); // or response.data.product depending on your API response
      setLoader(false);
    } catch (error) {
      console.error("Error searching products:", error);
      setLoader(false);
    }
  };

  const getData = () => {
    setLoader(true);
    setSearchQuery("");
    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/collections/productbypage?page=${page}&limit=${limit}`
      )
      .then((res) => {
        setLoader(false);
        setData(res.data.product); // Change this line
        setTotalPages(res.data.totalPages);
      })
      .catch((error) => {
        setLoader(false);
        console.log(error);
      });
  };
  useEffect(() => {
    if (!searchQuery) {
      getData();
    }
  }, [searchQuery]);

  useEffect(() => {
    getData();
  }, [page]);

  const handleSubmit = (id) => {
    if (editModal && id) {
      handleEditCountry(id);
    } else {
      handleCreate();
    }
  };

  const handleCreate = () => {
    axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/collections/product`,
        currentData
      )
      .then((res) => {
        getData();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleEditCountry = (id) => {
    axios
      .put(
        `${process.env.REACT_APP_BASE_URL}/collections/product/${id}`,
        currentData
      )
      .then((res) => {
        getData();
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
            <div className="flex gap-3">
              <button
                onClick={openModal}
                type="button"
                className="text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br  focus:outline-none  font-medium rounded-[3px] text-sm  py-1.5 text-center  mb-2"
              >
                Upload
              </button>
              <button
                onClick={handleCloseModal}
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
            </div>
          </div>
          {selectedRows?.length > 0 && (
            <div className="flex justify-center">
              <button
                type="button"
                class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 :focus:ring-red-800 font-medium rounded-[4px] text-sm px-5 py-2.5 text-center me-2 mb-2"
              >
                Delete Selected
              </button>
            </div>
          )}
          <div className="relative w-full overflow-x-auto">
            <table className="w-full  border border  min-w-max caption-bottom text-sm">
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
                    Part No
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Product Group
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Sub_GRp
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Frequency
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Date of Launch
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    End Of Sale{" "}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    End of Support{" "}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Ex-support avlb
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    installation checklist Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    PM checklist Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Created Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Modified Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="[&amp;_tr:last-child]:border-0  ">
                {data?.map((item, index) => (
                  <tr
                    key={item?._id}
                    className="border-b transition-colors  data-[state=selected]:bg-muted"
                  >
                    <th scope="col" className="p-4">
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
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {item?.partnoid}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {item?.product}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {item?.productgroup}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {item?.subgrp}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {item?.frequency}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {moment(item?.dateoflaunch).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {moment(item?.endofsaledate).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4 font- text-md capitalize text-center align-middle whitespace-nowrap">
                      {moment(item?.endofsupportdate).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4 font- text-md capitalize text-center align-middle whitespace-nowrap">
                      {moment(item?.exsupportavlb).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4 font- text-md capitalize text-center align-middle whitespace-nowrap">
                      {item?.installationcheckliststatusboolean}
                    </td>
                    <td className="p-4 font- text-md capitalize text-center align-middle whitespace-nowrap">
                      {item?.pmcheckliststatusboolean}
                    </td>

                    <td className="p-4 align-middle whitespace-nowrap">
                      {moment(item?.createdAt).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4 align-middle whitespace-nowrap">
                      {moment(item?.modifiedAt).format("MMM D, YYYY")}
                    </td>

                    <td className="p-4 align-middle whitespace-nowrap">
                      <div className="flex gap-4 ">
                        <button
                          onClick={() => {
                            handleOpenModal(item);
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
                          onClick={() => handleDelete(item?._id)}
                          className="border p-[7px] bg-blue-700 text-white rounded cursor-pointer hover:bg-blue-500"
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
                page === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              } w-[100px] hover:bg-gray-300 px-2 bg-gray-100 font-semibold`}
              onClick={handlePreviousPage}
              disabled={page === 1}
            >
              Previous
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((p) => {
                  // Show first 3 pages, last 3 pages, and pages around current page
                  return (
                    p === 1 ||
                    p === 2 ||
                    p === 3 ||
                    p === totalPages ||
                    p === totalPages - 1 ||
                    p === totalPages - 2 ||
                    Math.abs(p - page) <= 1
                  );
                })
                .map((p, i, array) => (
                  <React.Fragment key={p}>
                    {/* Add ellipsis when there's a gap */}
                    {i > 0 && p - 1 !== array[i - 1] && <span>...</span>}
                    <button
                      className={`border px-3 rounded ${
                        p === page
                          ? "bg-blue-700 text-white"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            <button
              className={`border rounded p-1 ${
                page === totalPages
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              } hover:bg-blue-500 px-2 bg-blue-700 w-[100px] text-white font-semibold`}
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
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
                <ProductBulk />
              </div>
            </div>
          )}
          <Modal
            open={showModal}
            onClose={handleCloseModal}
            className="z-[1] thin-scroll"
            size="lg"
          >
            <ModalDialog size="lg" className="p-2  thin-scroll">
              <div className="flex items-start justify-between p-2 border-b px-5 border-solid border-blueGray-200 rounded-t thin-scroll">
                <h3 className="text-xl font-semibold">
                  {editModal ? "Update Product" : "Create Product"}
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
                  handleCloseModal();
                }}
                className="thin-scroll"
              >
                <div className=" w-[300px] md:w-[500px] lg:w-[700px] border-b border-solid border-blueGray-200 p-3 flex-auto max-h-[380px] overflow-y-auto">
                  <div class="grid md:grid-cols-2 md:gap-6 w-full">
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Part No{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) =>
                          handleFormData("partnoid", e.target.value)
                        }
                        id="name"
                        value={currentData?.partnoid}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Product{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) =>
                          handleFormData("product", e.target.value)
                        }
                        id="name"
                        value={currentData?.product}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Product Group{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) =>
                          handleFormData("productgroup", e.target.value)
                        }
                        id="name"
                        value={currentData?.productgroup}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Sub_GRp{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) =>
                          handleFormData("subgrp", e.target.value)
                        }
                        id="name"
                        value={currentData?.subgrp}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>

                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2  text-sm font-medium text-gray-900 ">
                        Frequency{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) =>
                          handleFormData("frequency", e.target.value)
                        }
                        id="name"
                        value={currentData?.frequency}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Date of Launch
                      </label>
                      <input
                        type="date"
                        onChange={(e) =>
                          handleFormData("dateoflaunch", e.target.value)
                        }
                        id="name"
                        value={currentData?.dateoflaunch?.split("T")[0]}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        End Of Sale{" "}
                      </label>
                      <input
                        type="date"
                        onChange={(e) =>
                          handleFormData("endofsaledate", e.target.value)
                        }
                        id="name"
                        value={currentData?.endofsaledate?.split("T")[0]}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        End of Support{" "}
                      </label>
                      <input
                        type="date"
                        onChange={(e) =>
                          handleFormData("endofsupportdate", e.target.value)
                        }
                        id="name"
                        value={currentData?.endofsupportdate?.split("T")[0]}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Ex-support avlb
                      </label>
                      <input
                        type="date"
                        onChange={(e) =>
                          handleFormData("exsupportavlb", e.target.value)
                        }
                        id="exsupportavlb"
                        value={currentData?.exsupportavlb?.split("T")[0]}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        installation checklist Status{" "}
                      </label>
                      <Select
                        variant="soft"
                        className="rounded-[4px] py-2 border"
                        defaultValue={
                          currentData?.installationcheckliststatusboolean ===
                          true
                            ? "true"
                            : "false" || ""
                        }
                        onChange={(e, value) =>
                          handleFormData(
                            "installationcheckliststatusboolean",
                            value
                          )
                        }
                      >
                        <Option value="">Select </Option>
                        <Option value="true">True</Option>
                        <Option value="false">False</Option>
                      </Select>
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        PM checklist Status{" "}
                      </label>
                      <Select
                        variant="soft"
                        className="rounded-[4px] py-2 border"
                        defaultValue={
                          currentData?.pmcheckliststatusboolean === true
                            ? "true"
                            : "false" || ""
                        }
                        onChange={(e, value) =>
                          handleFormData("pmcheckliststatusboolean", value)
                        }
                      >
                        <Option value="">Select </Option>
                        <Option value="true">True</Option>
                        <Option value="false">False</Option>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-end mt-3 rounded-b">
                  <button
                    onClick={() => handleCloseModal()}
                    type="button"
                    class=" focus:outline-none border h-8  shadow text-black flex items-center hover:bg-gray-200  font-medium rounded-[4px] text-sm px-5 py-2.5    me-2 mb-2"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => handleSubmit(currentData?._id)}
                    type="submit"
                    className="text-white bg-blue-700 h-8 hover:bg-blue-800 focus:ring-4  flex items-center px-8 focus:ring-blue-300 font-medium rounded-[4px] text-sm  py-2.5 me-2 mb-2 :bg-blue-600 :hover:bg-blue-700 focus:outline-none :focus:ring-blue-800 me-2 mb-2"
                  >
                    {editModal ? "Update Product" : "Create Product"}
                  </button>
                </div>
              </form>
            </ModalDialog>
          </Modal>
        </>
      )}
    </>
  );
}

export default Product;
