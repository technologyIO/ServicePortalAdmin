import React, { useEffect, useMemo, useState } from "react";

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

function Dealer() {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [loader, setLoader] = useState(true);
  const limit = 10;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [department, setdepartment] = useState([]);
  const [BranchData, setBranchData] = useState([]);
  const [state, setstate] = useState([]);
  const [country, setCountry] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  useEffect(() => {
    fetchUsers();
  }, []);
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [personSearchQuery, setpersonSearchQuery] = useState("");

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!personSearchQuery.trim()) return allUsers;
    const query = personSearchQuery.toLowerCase();
    return allUsers.filter((user) => {
      const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
      return (
        fullName.includes(query) ||
        user.employeeid.toLowerCase().includes(query)
      );
    });
  }, [allUsers, personSearchQuery]);
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/alluser`
      );
      let users = res.data.users || res.data; // Try both possibilities

      // Ensure we have an array
      if (!Array.isArray(users)) {
        // If users is an object, convert it to an array of its values
        if (users && typeof users === "object") {
          users = Object.values(users);
        } else {
          users = []; // Fallback to empty array
        }
      }

      // Filter out any non-user objects
      users = users.filter(
        (user) =>
          user &&
          typeof user === "object" &&
          user.firstname &&
          user.lastname &&
          user.employeeid
      );

      setAllUsers(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setAllUsers([]); // Set to empty array on error
    }
  };

  // Get All City
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
  // Get All State/Region
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
  const handlePersonToggle = (user) => {
    setSelectedPersons((prev) => {
      const isSelected = prev.some((p) => p.employeeid === user.employeeid);
      const updatedPersons = isSelected
        ? prev.filter((p) => p.employeeid !== user.employeeid)
        : [
            ...prev,
            {
              name: `${user.firstname} ${user.lastname}`,
              employeeid: user.employeeid,
            },
          ];

      handleFormData("personresponsible", updatedPersons);
      return updatedPersons;
    });
  };

  //Get All country
  useEffect(() => {
    const getCountry = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allCountries`
        );

        // Map the API response to match Autocomplete's expected format
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
  useEffect(() => {
    const getBranch = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allbranch`
        );
        const cities = res.data.map((branches) => ({
          label: branches.name,
          id: branches._id,
          state: branches.state,
          status: branches.status,
          city: branches.city,
          branchShortCode: branches.branchShortCode,
        }));
        setBranchData(cities);
      } catch (err) {
        console.error(err);
      }
    };

    getBranch();
  }, []);
  // Get All Department
  useEffect(() => {
    const getDepartment = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/alldepart`
        );
        const department = res.data.map((depart) => ({
          label: depart.name,
          id: depart._id,
          status: depart.status,
        }));
        setdepartment(department);
      } catch (err) {
        console.error(err);
      }
    };

    getDepartment();
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
          .delete(`${process.env.REACT_APP_BASE_URL}/collections/dealer/${id}`)
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
      return;
    }

    setLoader(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/searchdealer?q=${searchQuery}`
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
        `${process.env.REACT_APP_BASE_URL}/collections/dealer?page=${page}&limit=${limit}`
      )
      .then((res) => {
        setLoader(false);
        setData(res.data.dealers);
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
      handleEditCountry(id);
    } else {
      handleCreate();
    }
  };

  const handleCreate = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/collections/dealer`, currentData)
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
        `${process.env.REACT_APP_BASE_URL}/collections/dealer/${id}`,
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
                    Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Dealer ID
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Person Responsible
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    State
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    City
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Pincode
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
                      {item?.name}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {item?.email}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded border ${
                          item?.status === "Active"
                            ? "bg-green-100 text-green-800 border-green-400"
                            : item?.status === "Inactive"
                            ? "bg-red-100 text-red-800  border-red-400"
                            : "bg-orange-100 text-orange-800  border-orange-400"
                        }`}
                      >
                        {item?.status}
                      </span>
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {item?.dealercode}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {Array.isArray(item?.personresponsible)
                        ? item.personresponsible.map((p) => p.name).join(", ")
                        : item?.personresponsible}
                    </td>

                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {item?.state}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {item?.city}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {item?.pincode}
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
                  {editModal ? "Update Dealer" : "Create Dealer"}
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
                        Dealer Name{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) => handleFormData("name", e.target.value)}
                        id="name"
                        placeholder="Enter Dealer Name"
                        value={currentData?.name}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Dealer Code{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) =>
                          handleFormData("dealercode", e.target.value)
                        }
                        placeholder="Enter Dealer Code"
                        id="dealercode"
                        value={currentData?.dealercode}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Email{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter Dealer Email"
                        onChange={(e) =>
                          handleFormData("email", e.target.value)
                        }
                        id="name"
                        value={currentData?.email}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2  text-sm font-medium text-gray-900 ">
                        State{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <Autocomplete
                        className="h-10 w-full"
                        required
                        options={state}
                        placeholder="Enter Dealer State"
                        getOptionLabel={(option) => option.label}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            name="state"
                            label="Select State"
                          />
                        )}
                        sx={{ width: 300 }}
                        onChange={(event, value) =>
                          handleFormData("state", value ? value.label : "")
                        }
                      />
                    </div>
                    <div className="w-full mb-5">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Person Responsible{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>

                      {/* Search Input - Changed from searchQuery to personSearchQuery */}
                      <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={personSearchQuery}
                        onChange={(e) => setpersonSearchQuery(e.target.value)}
                        className="w-full p-2 mb-3 border h-10 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />

                      {/* Selected Count */}
                      {selectedPersons.length > 0 && (
                        <div className="mb-2 text-xs text-blue-600">
                          {selectedPersons.length} person(s) selected
                        </div>
                      )}

                      {/* Users List */}
                      <div className="border border-gray-300 rounded-md p-2 max-h-48 overflow-y-auto bg-white">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => {
                            const fullName = `${user.firstname} ${user.lastname}`;
                            const isChecked = selectedPersons.some(
                              (p) => p.employeeid === user.employeeid
                            );

                            return (
                              <div
                                key={user._id}
                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                              >
                                <input
                                  type="checkbox"
                                  required
                                  checked={isChecked}
                                  onChange={() => handlePersonToggle(user)}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {fullName}{" "}
                                  <span className="text-gray-500">
                                    ({user.employeeid})
                                  </span>
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            {personSearchQuery
                              ? "No users found"
                              : "No users available"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        City{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <Autocomplete
                        className="h-10 w-full"
                        required
                        placeholder="Enter Dealer City"
                        options={cityList}
                        getOptionLabel={(option) => option.label}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            name="city"
                            label="Select City"
                          />
                        )}
                        sx={{ width: 300 }}
                        onChange={(event, value) =>
                          handleFormData("city", value ? value.label : "")
                        }
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Pincode{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter Dealer Pincode"
                        onChange={(e) =>
                          handleFormData("pincode", e.target.value)
                        }
                        id="pincode"
                        value={currentData?.pincode}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>

                    <div>
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
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
                        <Option value="Inactive">Inactive</Option>
                      </Select>
                    </div>
                  </div>
                  <div className="relative  w-full mb-5 group">
                    <label class="block mb-2 text-sm font-medium text-gray-900 ">
                      Address{" "}  <span className="text-red-500 text-lg ml-1">*</span>
                    </label>
                    <textarea
                      type="text"
                      required
                      placeholder="Enter Dealer Address"
                      onChange={(e) =>
                        handleFormData("address", e.target.value)
                      }
                      rows={4}
                      id="address"
                      value={currentData?.address}
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                    />
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
                    {editModal ? "Update Dealer" : "Create Dealer"}
                  </button>
                </div>
              </form>
            </ModalDialog>
          </Modal>
          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              {/* Modal Content */}

              <div className="bg-gray-200 rounded-lg p-6 w-[80vh]  relative">
                <button
                  onClick={closeModal}
                  className="absolute top-3 text-3xl right-3 text-gray-400 hover:text-gray-600"
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
}

export default Dealer;
