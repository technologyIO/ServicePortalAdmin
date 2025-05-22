import React, { useEffect, useState } from "react";
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
import BulkModal from "../../BulkUpload.jsx/BulkModal";

const UserData = () => {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [data, setData] = useState([]);
  const [BranchData, setBranchData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [loader, setLoader] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;
  const [state, setstate] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [country, setCountry] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleMapping, setRoleMapping] = useState({});

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/roles");
        setRoles(res.data);

        // Optional: Create roleName to roleId mapping
        const mapping = {};
        res.data.forEach((role) => {
          mapping[role.roleName] = role._id;
        });
        setRoleMapping(mapping);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);
  // Fetch all cities
  useEffect(() => {
    const getCities = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allcity`
        );
        const cities = res.data.map((city) => ({
          label: city.name,
          id: city._id,
          state: city.state,
          status: city.status,
        }));
        setCityList(cities);
      } catch (err) {
        console.error(err);
      }
    };
    getCities();
  }, []);

  // Fetch all states/regions
  useEffect(() => {
    const getState = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allstate`
        );
        const State = res.data.map((state) => ({
          label: state.name,
          id: state._id,
          country: state.country,
          status: state.status,
        }));
        setstate(State);
      } catch (err) {
        console.error(err);
      }
    };
    getState();
  }, []);

  // Fetch all countries
  useEffect(() => {
    const getCountry = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allCountries`
        );
        const Country = res.data.map((country) => ({
          label: country.name,
          id: country._id,
          status: country.status,
        }));
        setCountry(Country);
      } catch (err) {
        console.error(err);
      }
    };
    getCountry();
  }, []);

  // Fetch all branches
  useEffect(() => {
    const getBranch = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allbranch`
        );
        const branches = res.data.map((branch) => ({
          label: branch.name,
          id: branch._id,
          state: branch.state,
          status: branch.status,
          city: branch.city,
          branchShortCode: branch.branchShortCode,
        }));
        setBranchData(branches);
      } catch (err) {
        console.error(err);
      }
    };
    getBranch();
  }, []);

  // Fetch dealer list from API
  useEffect(() => {
    const getDealers = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/alldealer`
        );
        const dealers = res.data.dealers.map((dealer) => ({
          label: dealer.name,
          id: dealer.dealerid || dealer._id,
        }));
        setDealerList(dealers);
      } catch (err) {
        console.error(err);
      }
    };
    getDealers();
  }, []);

  const [selectedRows, setSelectedRows] = useState([]);
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

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // Updated Create button handler to open modal for new user creation
  const handleCreateModal = () => {
    setCurrentData({}); // clear form data
    setEditModal(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditModal(false);
    setCurrentData({});
  };

  const handleOpenModal = (user) => {
    setCurrentData(user);
    setEditModal(true);
    setShowModal(true);
  };

  const handleFormData = (name, value) => {
    setCurrentData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoader(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/search?q=${searchQuery}`
      );
      setData(response.data);
      setLoader(false);
    } catch (error) {
      console.error("Error searching users:", error);
      setLoader(false);
    }
  };

  const getData = () => {
    setLoader(true);
    setSearchQuery("");
    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/collections/user?page=${page}&limit=${limit}`
      )
      .then((res) => {
        setLoader(false);
        setData(res.data.users);
        setTotalPages(res.data.totalPages);
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
    getData();
  }, [page]);

  const handleSubmit = (id) => {
    if (editModal && id) {
      handleEditUser(id);
    } else {
      handleCreate();
    }
  };

  const handleCreate = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/collections/user`, currentData)
      .then(() => {
        getData();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleEditUser = (id) => {
    axios
      .put(
        `${process.env.REACT_APP_BASE_URL}/collections/user/${id}`,
        currentData
      )
      .then(() => {
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
                  className="w-full"
                />
              </FormControl>
              <button
                onClick={handleSearch}
                type="button"
                className="text-white w-full col-span-2 px-5 bg-blue-700 hover:bg-gradient-to-br font-medium rounded-[3px] text-sm py-1.5 mb-2"
              >
                Search
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={openModal}
                type="button"
                className="text-white w-full col-span-2 px-5 bg-blue-700 hover:bg-gradient-to-br font-medium rounded-[3px] text-sm py-1.5 mb-2"
              >
                Upload
              </button>
              {/* Updated Create button now opens the modal */}
              <button
                onClick={handleCreateModal}
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
            </div>
          </div>
          <div className="flex justify-end ">
            {selectedRows?.length > 0 && (
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-[4px] text-sm px-5 py-2.5 mb-2"
              >
                Delete Selected
              </button>
            )}
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
                  <th className="px-4 text-left font-medium">First Name</th>
                  <th className="px-4 text-left font-medium">Last Name</th>
                  <th className="px-4 text-left font-medium">Email</th>
                  <th className="px-4 text-left font-medium">Mobile Number</th>
                  <th className="px-4 text-left font-medium">Branch</th>
                  <th className="px-4 text-left font-medium">
                    Login Expiry Date
                  </th>
                  <th className="px-4 text-left font-medium">Status</th>
                  <th className="px-4 text-left font-medium">Employee ID</th>
                  <th className="px-4 text-left font-medium">Country</th>
                  <th className="px-4 text-left font-medium">State/Region</th>
                  <th className="px-4 text-left font-medium">City</th>
                  <th className="px-4 text-left font-medium">Department</th>
                  <th className="px-4 text-left font-medium">Created Date</th>
                  <th className="px-4 text-left font-medium">Modified Date</th>
                  <th className="px-4 text-left font-medium">Manager Email</th>
                  <th className="px-4 text-left font-medium">Skills</th>
                  <th className="px-4 text-left font-medium">Device ID</th>
                  <th className="px-4 text-left font-medium">
                    Device Reg Date
                  </th>
                  <th className="px-4 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((item, index) => (
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
                    <td className="p-4 capitalize">{item?.firstname}</td>
                    <td className="p-4 capitalize">{item?.lastname}</td>
                    <td className="p-4">{item?.email}</td>
                    <td className="p-4">{item?.mobilenumber}</td>
                    <td className="p-4">{item?.branch}</td>
                    <td className="p-4">
                      {moment(item?.loginexpirydate).format("MMM D, YYYY")}
                    </td>
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
                    <td className="p-4">{item?.employeeid}</td>
                    <td className="p-4">{item?.country}</td>
                    <td className="p-4">{item?.state}</td>
                    <td className="p-4">{item?.city}</td>
                    <td className="p-4">{item?.department}</td>
                    <td className="p-4">
                      {moment(item?.createdAt).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4">
                      {moment(item?.modifiedAt).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4">{item?.manageremail}</td>
                    <td className="p-4">{item?.skills}</td>
                    <td className="p-4">{item?.deviceid}</td>
                    <td className="p-4">
                      {moment(item?.deviceregistereddate).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleOpenModal(item)}
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
                          className="border p-2 bg-blue-700 text-white rounded hover:bg-blue-500"
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

          {/* Modal for Create / Edit User */}
          <Modal
            open={showModal}
            onClose={handleCloseModal}
            className="z-[1]"
            size="lg"
          >
            <ModalDialog size="lg" className="p-2">
              <div className="flex items-start justify-between p-2 px-5 border-b">
                <h3 className="text-xl font-semibold">
                  {editModal ? "Update UserData" : "Create UserData"}
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
                    className="bi bi-x-lg"
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
                className="p-3 max-h-[380px] w-[650px] overflow-y-auto"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Basic User Details */}
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={currentData?.firstname || ""}
                      onChange={(e) =>
                        handleFormData("firstname", e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={currentData?.lastname || ""}
                      onChange={(e) =>
                        handleFormData("lastname", e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Email
                    </label>
                    <input
                      type="text"
                      value={currentData?.email || ""}
                      onChange={(e) => handleFormData("email", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      value={currentData?.mobilenumber || ""}
                      onChange={(e) =>
                        handleFormData("mobilenumber", e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Login Expiry Date
                    </label>
                    <input
                      type="date"
                      value={
                        currentData?.loginexpirydate
                          ? currentData.loginexpirydate.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleFormData("loginexpirydate", e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Status
                    </label>
                    <Select
                      variant="soft"
                      defaultValue={currentData?.status || ""}
                      onChange={(e, value) => handleFormData("status", value)}
                      className="w-full"
                    >
                      <Option value="">Select Status</Option>
                      <Option value="Active">Active</Option>
                      <Option value="Pending">Pending</Option>
                      <Option value="Inactive">Inactive</Option>
                    </Select>
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={currentData?.employeeid || ""}
                      onChange={(e) =>
                        handleFormData("employeeid", e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>
                  {/* Country, State, City */}
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Search Country
                    </label>
                    <Autocomplete
                      options={country}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name="country"
                          label="Select Country"
                          className="w-full"
                        />
                      )}
                      onChange={(event, value) =>
                        handleFormData("country", value ? value.label : "")
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Search City
                    </label>
                    <Autocomplete
                      options={cityList}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name="city"
                          label="Select City"
                          className="w-full"
                        />
                      )}
                      onChange={(event, value) =>
                        handleFormData("city", value ? value.label : "")
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Department
                    </label>
                    <input
                      type="text"
                      value={currentData?.department || ""}
                      onChange={(e) =>
                        handleFormData("department", e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>
                  {!editModal && (
                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Password
                      </label>
                      <input
                        type="text"
                        value={currentData?.password || ""}
                        onChange={(e) =>
                          handleFormData("password", e.target.value)
                        }
                        className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Manager Email
                    </label>
                    <input
                      type="text"
                      value={currentData?.manageremail || ""}
                      onChange={(e) =>
                        handleFormData("manageremail", e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Skills
                    </label>
                    <input
                      type="text"
                      value={currentData?.skills || ""}
                      onChange={(e) => handleFormData("skills", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Profile Image
                    </label>
                    <input
                      type="text"
                      value={currentData?.profileimage || ""}
                      onChange={(e) =>
                        handleFormData("profileimage", e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Device ID
                    </label>
                    <input
                      type="text"
                      value={currentData?.deviceid || ""}
                      onChange={(e) =>
                        handleFormData("deviceid", e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Device Registered Date
                    </label>
                    <input
                      type="date"
                      value={
                        currentData?.deviceregistereddate
                          ? currentData.deviceregistereddate.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleFormData("deviceregistereddate", e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>

                  {/* New Section: User Type */}
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      User Type
                    </label>
                    <Select
                      variant="soft"
                      defaultValue={currentData?.usertype || ""}
                      onChange={(e, value) => handleFormData("usertype", value)}
                      className="w-full"
                    >
                      <Option value="">Select User Type</Option>
                      <Option value="skanray">Skanray</Option>
                      <Option value="dealer">Dealer</Option>
                    </Select>
                  </div>
                  {/* Conditional Section: Role for Skanray */}
                  {currentData?.usertype === "skanray" && (
                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Role
                      </label>
                      <Select
                        variant="soft"
                        defaultValue={currentData?.role?.roleId || ""}
                        onChange={(e, selectedRoleId) => {
                          const selectedRole = roles.find(
                            (r) => r.roleId === selectedRoleId
                          );
                          handleFormData("roleName", selectedRole?.name || "");
                          handleFormData("roleId", selectedRoleId);
                        }}
                        className="w-full"
                      >
                        <Option value="">Select Role</Option>
                        {roles.map((role) => (
                          <Option key={role.roleId} value={role.roleId}>
                            {role.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  )}

                  {/* Conditional Section: Dealer selection for Dealer */}
                  {currentData?.usertype === "dealer" && (
                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Select Dealer
                      </label>
                      <Autocomplete
                        options={dealerList}
                        getOptionLabel={(option) => option.label}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            name="dealer"
                            label="Select Dealer"
                            className="w-full"
                          />
                        )}
                        onChange={(event, value) => {
                          handleFormData(
                            "dealerName",
                            value ? value.label : ""
                          );
                          handleFormData("dealerId", value ? value.id : "");
                        }}
                        className="w-full"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Branch
                    </label>
                    <Autocomplete
                      options={BranchData}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name="branch"
                          label="Select Branch"
                          className="w-full"
                        />
                      )}
                      onChange={(event, value) =>
                        handleFormData("branch", value ? value.label : "")
                      }
                      className="w-full"
                    />
                  </div>
                  {/* New Field: Location (multiple) */}
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Location
                    </label>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]} // No preset options
                      value={currentData?.location || []}
                      onChange={(event, newValue) =>
                        handleFormData("location", newValue)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Enter Locations"
                          className="w-full"
                        />
                      )}
                      className="w-full"
                    />
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      State/Region
                    </label>
                    <Autocomplete
                      options={state}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name="state"
                          label="Select State"
                          className="w-full"
                        />
                      )}
                      onChange={(event, value) =>
                        handleFormData("state", value ? value.label : "")
                      }
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-end mt-3">
                  <button
                    onClick={handleCloseModal}
                    type="button"
                    className="border shadow text-black hover:bg-gray-200 font-medium rounded text-sm px-5 py-2.5"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleSubmit(currentData?._id)}
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 flex items-center px-8 font-medium rounded text-sm py-2.5"
                  >
                    {editModal ? "Update User" : "Create User"}
                  </button>
                </div>
              </form>
            </ModalDialog>
          </Modal>
          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-gray-200 rounded-lg p-6 w-[80vh] relative">
                <button
                  onClick={closeModal}
                  className="absolute top-3 right-3 text-3xl text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
                <BulkModal />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default UserData;
