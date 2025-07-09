import React, { useEffect, useState, useCallback } from "react";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Modal,
  ModalDialog,
  Option,
  Select,
  TextField,
} from "@mui/joy";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import toast from "react-hot-toast";

function AdminRegion() {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState({});

  const limit = 10;
  const [selectedStates, setSelectedStates] = useState([]);
  const [country, setcountry] = useState([]);
  const [selectedcountry, setSelectedcountry] = useState([]);

  const [loader, setLoader] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCloseModal = () => {
    setShowModal((prev) => !prev);
    setEditModal(false);
    setCurrentData({});
  };

  const handleOpenModal = (region) => {
    setCurrentData(region);
    setEditModal(true);
    setShowModal(true);

    const selectedStates = Array.isArray(region.country)
      ? region.country.map((stateName) => ({ label: stateName }))
      : [{ label: region.country }];

    setSelectedStates(selectedStates);
  };

  useEffect(() => {
    const fetchcountry = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allcountry`
        );
        const formatted = res.data?.countries?.map((country) => ({
          ...country,
          label: country.name,
        }));
        setcountry(formatted);
      } catch (error) {
        console.error("Error fetching country:", error);
      }
    };

    fetchcountry();
  }, []);

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
            `${process.env.REACT_APP_BASE_URL}/collections/api/region/${id}`
          )
          .then((res) => {
            Swal.fire("Deleted!", "Region has been deleted.", "success");
            getAllData();
          })
          .catch((error) => {
            console.log(error);
            Swal.fire("Error!", "Failed to delete region.", "error");
          });
      }
    });
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      getAllData();
      return;
    }

    setLoader(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/searchregion?q=${searchQuery}`
      );
      setData(response.data);
      setLoader(false);
    } catch (error) {
      console.error("Error searching cities:", error);
      setLoader(false);
    }
  };

  const getAllData = useCallback(async () => {
    try {
      setLoader(true);
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/api/allregion?page=${page}&limit=${limit}`
      );
      setData(res.data.regions); // ✅ store regions array
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch region data:", error);
    } finally {
      setLoader(false);
    }
  }, [page, limit]);

  useEffect(() => {
    getAllData();
  }, [getAllData]);

  const handleSubmit = (id) => {
    if (editModal && id) {
      handleEditData(id);
    } else {
      handleAddData();
    }
  };

  const handleFormData = (name, value) => {
    setCurrentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddData = () => {
    axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/collections/api/region`,
        currentData
      )
      .then(() => {
        getAllData();
        toast.success("Region added successfully!");
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.message || "Failed to add region.";
        console.error(errorMsg);
        toast.error(errorMsg);
      });
  };

  const handleEditData = (id) => {
    axios
      .put(
        `${process.env.REACT_APP_BASE_URL}/collections/api/region/${id}`,
        currentData
      )
      .then(() => {
        getAllData();
        handleCloseModal();
        toast.success("Region updated successfully!");
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.message || "Failed to update region.";
        console.error(errorMsg);
        toast.error(errorMsg);
      });
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage((prevPage) => prevPage - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((prevPage) => prevPage + 1);
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
                      />
                      <label htmlFor="checkbox-all-search" className="sr-only">
                        checkbox
                      </label>
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Region Name
                  </th>

                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Country
                  </th>

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
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {data?.length > 0 &&
                  data.map((region, regionIndex) => {
                    const regionId = region?._id || `region-${regionIndex}`;
                    const createdAt = region?.createdAt
                      ? moment(region.createdAt).format("MMM D, YYYY")
                      : "N/A";
                    const modifiedAt = region?.modifiedAt
                      ? moment(region.modifiedAt).format("MMM D, YYYY")
                      : createdAt;

                    // Ensure country is treated as an array
                    const countries = Array.isArray(region.country)
                      ? region.country
                      : [region.country];

                    return countries.map((country, stateIndex) => {
                      return (
                        <tr
                          key={`${regionId}-${stateIndex}`}
                          className="border-b transition-colors data-[state=selected]:bg-muted"
                        >
                          {/* 🟢 Render Region Name and Details only once using rowSpan */}
                          {stateIndex === 0 && (
                            <>
                              <th
                                scope="col"
                                className="p-4"
                                rowSpan={countries.length}
                              >
                                <div className="flex items-center">
                                  <input
                                    id={`checkbox-${regionIndex}`}
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                                  />
                                  <label
                                    htmlFor={`checkbox-${regionIndex}`}
                                    className="sr-only"
                                  >
                                    Select row
                                  </label>
                                </div>
                              </th>
                              <td
                                className="p-4 font-bold text-md capitalize align-middle whitespace-nowrap"
                                rowSpan={countries.length}
                              >
                                {region.regionName}
                              </td>
                            </>
                          )}

                          <td className="p-4 text-md capitalize align-middle whitespace-nowrap">
                            {country}
                          </td>

                          {stateIndex === 0 && (
                            <>
                              <td
                                rowSpan={countries.length}
                                className="align-middle whitespace-nowrap"
                              >
                                <span className="text-xs font-medium px-2.5 py-0.5 rounded border bg-green-100 text-green-800 border-green-400">
                                  Active
                                </span>
                              </td>
                              <td
                                className="p-4 align-middle whitespace-nowrap"
                                rowSpan={countries.length}
                              >
                                {createdAt}
                              </td>
                              <td
                                className="p-4 align-middle whitespace-nowrap"
                                rowSpan={countries.length}
                              >
                                {modifiedAt}
                              </td>
                              <td
                                className="p-4 align-middle whitespace-nowrap"
                                rowSpan={countries.length}
                              >
                                <div className="flex gap-4">
                                  <button
                                    onClick={() => handleOpenModal(region)}
                                    title="Edit Region"
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
                                        fillRule="evenodd"
                                        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(region._id)}
                                    title="Delete Region"
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
                            </>
                          )}
                        </tr>
                      );
                    });
                  })}
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
            className="z-[1] thin-scroll"
            size="lg"
          >
            <ModalDialog size="lg" className="p-2  thin-scroll">
              <div className="flex items-start justify-between p-2 border-b px-5 border-solid border-blueGray-200 rounded-t thin-scroll">
                <h3 className="text-xl font-semibold">
                  {editModal ? "Update Region" : "Create Region"}
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
                  <div className="grid md:grid-cols-2 md:gap-6 w-full">
                    <div className="relative  w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900 ">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter Region Name"
                        onChange={(e) =>
                          handleFormData("regionName", e.target.value)
                        }
                        id="regionName"
                        value={currentData?.regionName}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5     "
                      />
                    </div>
                    {/* <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Region ID
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter Region ID"
                        onChange={(e) =>
                          handleFormData("regionID", e.target.value)
                        }
                        value={currentData?.regionID || ""}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div> */}

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 ">
                        Status
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
                  </div>
                  <div className="relative  w-full mb-5 group">
                    <label className="block mb-2 text-sm font-medium text-gray-900 ">
                      Country{" "}
                    </label>
                    <Autocomplete
                      options={country}
                      value={selectedcountry}
                      onChange={(event, value) => {
                        setSelectedcountry(value);
                        const selected = value?.label || "";
                        handleFormData("country", selected);
                      }}
                      getOptionLabel={(option) => option.label ?? ""}
                      isOptionEqualToValue={(option, value) =>
                        option._id === value._id
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Country"
                          variant="outlined"
                        />
                      )}
                      sx={{
                        width: "100%",
                        "& .MuiAutocomplete-inputRoot": {
                          flexWrap: "wrap",
                          alignItems: "flex-start",
                          paddingTop: "8px",
                          paddingBottom: "8px",
                        },
                        "& .MuiChip-root": {
                          margin: "2px",
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-end mt-3 rounded-b">
                  <button
                    onClick={() => handleCloseModal()}
                    type="button"
                    className=" focus:outline-none border h-8  shadow text-black flex items-center hover:bg-gray-200  font-medium rounded-[4px] text-sm px-5 py-2.5    me-2 mb-2"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => handleSubmit(currentData?._id)}
                    type="submit"
                    className="text-white bg-blue-700 h-8 hover:bg-blue-800 focus:ring-4  flex items-center px-8 focus:ring-blue-300 font-medium rounded-[4px] text-sm  py-2.5 me-2 mb-2 :bg-blue-600 :hover:bg-blue-700 focus:outline-none :focus:ring-blue-800 me-2 mb-2"
                  >
                    {editModal ? "Update Region" : "Create Region"}
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

export default AdminRegion;
