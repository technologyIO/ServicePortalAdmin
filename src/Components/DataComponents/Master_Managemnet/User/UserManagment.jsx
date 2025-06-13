import React, { useEffect, useState } from "react";
import { ChevronDown, ArrowLeft, ArrowRight } from "lucide-react";
import axios from "axios";
import { Autocomplete, TextField } from "@mui/joy";
import toast from "react-hot-toast";

export default function UserManagement() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState("Skanray");
  const [skills, setSkills] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState("");

  const [states, setStates] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);

  const [selectedState, setSelectedState] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [geoOptions, setGeoOptions] = useState([]);
  const [selectedGeo, setSelectedGeo] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [roles, setRoles] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [Skill, setSkill] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({
    features: [],
    demographicSelections: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSingleGeo, setSelectedSingleGeo] = useState(null);
  const [selectedSingleCountry, setSelectedSingleCountry] = useState(null);
  const [selectedSingleState, setSelectedSingleState] = useState(null);
  const [selectedSingleCity, setSelectedSingleCity] = useState(null);
  const [selectedCities, setSelectedCities] = useState([]);

  const fetchRolePermissions = async (roleId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/roles/by-roleid/${roleId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch permissions: ${response.status}`);
      }

      const data = await response.json();
      setPermissions({
        features: data.features,
        demographicSelections: data.demographicSelections,
      });
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setError(error.message);
      setPermissions({ features: [], demographicSelections: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRole?.roleId) {
      fetchRolePermissions(selectedRole.roleId);
    }
  }, [selectedRole]);

  useEffect(() => {
    if (currentStep === 3) {
      axios
        .get("http://localhost:5000/collections/skillbyproductgroup/")
        .then((res) => {
          setSkill(res.data);
        })
        .catch((err) => {
          console.error("Error fetching product groups:", err);
        });
    }
  }, [currentStep]);

  const isskillFullySelected = (skill) => {
    return (
      Array.isArray(skill.products) &&
      skill.products.every((p) => selectedSkill[p._id])
    );
  };

  const handleskillCheckboxChange = (skill, isChecked) => {
    const newSelections = { ...selectedSkill };
    if (Array.isArray(skill.products)) {
      skill.products.forEach((product) => {
        newSelections[product._id] = isChecked;
      });
    }
    setSelectedSkill(newSelections);
  };

  const handleProductCheckboxChange = (productId, isChecked) => {
    setSelectedSkill((prev) => ({
      ...prev,
      [productId]: isChecked,
    }));
  };

  const fetchParentRoles = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/roles`);
      setRoles(res.data);
    } catch (err) {
      toast.error("Failed to fetch parent roles");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchParentRoles();
  }, []);

  useEffect(() => {
    const getDealers = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/alldealer`
        );
        setDealerList(res.data.dealers || []);
      } catch (err) {
        console.error(err);
      }
    };
    getDealers();
  }, []);

  useEffect(() => {
    if (userType === "Dealer" && dealerList.length > 0 && roles.length > 0) {
      const serviceEngineerRole = roles.find(
        (role) => role.name === "Service Engineer"
      );
      if (serviceEngineerRole) {
        setSelectedRole(serviceEngineerRole);
        fetchRolePermissions(serviceEngineerRole.roleId);
      }
    }
  }, [userType, dealerList, roles]);

  useEffect(() => {
    fetch("http://localhost:5000/collections/allbranch")
      .then((res) => res.json())
      .then((data) => {
        const cleanBranches = data.branches.map((branch) => ({
          ...branch,
          name: branch.name.trim(),
          branchShortCode: branch.branchShortCode.trim(),
        }));
        setBranches(cleanBranches);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/collections/api/region")
      .then((res) => res.json())
      .then((data) => {
        setRegionOptions(data.data.regionDropdown || []);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/collections/api/geo")
      .then((res) => res.json())
      .then((data) => {
        setGeoOptions(data.data.geoDropdown || []);
      });
  }, []);

  const handleSingleCountrySelect = (event, value) => {
    setSelectedCountry(value);
    if (value) {
      setFormData((prev) => ({ ...prev, country: value.name }));
    }
  };
  const handleSingleStateSelect = (event, value) => {
    setSelectedState(value);
    if (value) {
      setFormData((prev) => ({ ...prev, state: value.name }));
    }
  };

  useEffect(() => {
    fetch("http://localhost:5000/collections/allcountry")
      .then((res) => res.json())
      .then((data) => setCountries(data.countries || []))
      .catch((err) => console.error("Failed to fetch countries", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/collections/allstate")
      .then((res) => res.json())
      .then((data) => setStates(data))
      .catch((err) => console.error("Failed to load states", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/collections/allcity")
      .then((res) => {
        setCities(res.data);
      })
      .catch((err) => console.error("Error fetching cities:", err));
  }, []);

  const handleSingleSelect = (event, newValue) => {
    setFormData({ ...formData, city: newValue?.name || "" });
  };
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    startDate: "",
    endDate: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    loginexpirydate: "",
    employeeid: "",
    password: "",
    manageremail: "",
    profileimage: "",
    deviceid: "",
    deviceregistereddate: "",
  });

  const validateCurrentStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!selectedRole) newErrors.role = "Role is required";
    } else if (currentStep === 2) {
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
      if (formData.mobile && !/^\d{10,15}$/.test(formData.mobile)) {
        newErrors.mobile = "mobile number is invalid";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only submit if we're on the final step (4)
    if (currentStep === 4) {
      if (validateCurrentStep()) {
        setIsSubmitting(true);

        try {
          if (!formData.password) {
            throw new Error("Password is required");
          }

          const skillsArray = [];
          Skill.forEach((skillGroup) => {
            skillGroup.products.forEach((product) => {
              if (selectedSkill[product._id]) {
                skillsArray.push({
                  productName: product.product,
                  partNumbers: product.partnoid,
                  productGroup: skillGroup.productgroup,
                });
              }
            });
          });

          const demographicsArray = [];

          if (selectedGeo.length > 0 || selectedSingleGeo) {
            demographicsArray.push({
              type: "geo",
              selectionType: selectedGeo.length > 0 ? "multiple" : "single",
              values:
                selectedGeo.length > 0
                  ? selectedGeo.map((g) => ({ id: g._id, name: g.geoName }))
                  : [
                      {
                        id: selectedSingleGeo._id,
                        name: selectedSingleGeo.geoName,
                      },
                    ],
            });
          }

          if (selectedRegions.length > 0 || selectedRegion) {
            demographicsArray.push({
              type: "region",
              selectionType: selectedRegions.length > 0 ? "multiple" : "single",
              values:
                selectedRegions.length > 0
                  ? selectedRegions.map((r) => ({
                      id: r._id,
                      name: r.regionName,
                    }))
                  : [
                      {
                        id: selectedRegion._id,
                        name: selectedRegion.regionName,
                      },
                    ],
            });
          }

          if (selectedCountries.length > 0 || selectedSingleCountry) {
            demographicsArray.push({
              type: "country",
              selectionType:
                selectedCountries.length > 0 ? "multiple" : "single",
              values:
                selectedCountries.length > 0
                  ? selectedCountries.map((c) => ({ id: c._id, name: c.name }))
                  : [
                      {
                        id: selectedSingleCountry._id,
                        name: selectedSingleCountry.name,
                      },
                    ],
            });
          }

          if (selectedStates.length > 0 || selectedSingleState) {
            demographicsArray.push({
              type: "state",
              selectionType: selectedStates.length > 0 ? "multiple" : "single",
              values:
                selectedStates.length > 0
                  ? selectedStates.map((s) => ({ id: s._id, name: s.name }))
                  : [
                      {
                        id: selectedSingleState._id,
                        name: selectedSingleState.name,
                      },
                    ],
            });
          }

          if (selectedCities.length > 0 || selectedSingleCity) {
            demographicsArray.push({
              type: "city",
              selectionType: selectedCities.length > 0 ? "multiple" : "single",
              values:
                selectedCities.length > 0
                  ? selectedCities.map((c) => ({ id: c._id, name: c.name }))
                  : [
                      {
                        id: selectedSingleCity._id,
                        name: selectedSingleCity.name,
                      },
                    ],
            });
          }

          if (selectedBranches.length > 0 || selectedBranch) {
            demographicsArray.push({
              type: "branch",
              selectionType:
                selectedBranches.length > 0 ? "multiple" : "single",
              values:
                selectedBranches.length > 0
                  ? selectedBranches.map((b) => ({
                      id: b._id,
                      name: `${b.name} (${b.branchShortCode})`,
                    }))
                  : [
                      {
                        id: selectedBranch._id,
                        name: `${selectedBranch.name} (${selectedBranch.branchShortCode})`,
                      },
                    ],
            });
          }

          const userData = {
            firstname: formData.firstName,
            lastname: formData.lastName,
            email: formData.email,
            mobilenumber: formData.mobile,
            address: formData.address,
            city: selectedSingleCity?.name || formData.city,
            state: selectedSingleState?.name || formData.state,
            country: selectedSingleCountry?.name || "",
            zipCode: formData.zipCode,
            loginexpirydate: formData.loginexpirydate,
            employeeid: formData.employeeid,
            department: formData.department || "",
            password: formData.password,
            manageremail: formData.manageremail,
            profileimage: formData.profileimage,
            deviceid: formData.deviceid,
            usertype: userType.toLowerCase(),
            skills: skillsArray,
            demographics: demographicsArray,
          };

          if (userType === "Skanray") {
            userData.role = {
              roleName: selectedRole?.name || "",
              roleId: selectedRole?.roleId || "",
            };
          } else if (userType === "Dealer") {
            const dealer = dealerList.find((d) => d.name === selectedDealer);
            userData.dealerInfo = {
              dealerName: selectedDealer,
              dealerId: dealer?._id || "",
            };
          }

          const response = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/collections/user`,
            userData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.status === 201) {
            toast.success("User created successfully!");
          } else {
            throw new Error(response.data.message || "Failed to create user");
          }
        } catch (error) {
          console.error("Error creating user:", error);
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to create user"
          );
        } finally {
          setIsSubmitting(false);
        }
      }
    } else {
      handleNext();
    }
  };

  const steps = [
    { id: 1, name: "Role Information" },
    { id: 2, name: "User Details" },
    { id: 3, name: "Skills" },
    { id: 4, name: "Location Details" },
  ];

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br">
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Add New User</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav
            className="flex items-center justify-center"
            aria-label="Progress"
          >
            <ol className="flex items-center space-x-8 w-full">
              {steps.map((step) => (
                <li key={step.name} className="flex-1">
                  {step.id < currentStep ? (
                    <div className="group flex flex-col border-t-4 border-blue-700 pt-4 pb-2">
                      <span className="text-sm font-medium text-blue-700">
                        {step.name}
                      </span>
                    </div>
                  ) : step.id === currentStep ? (
                    <div
                      className="flex flex-col border-t-4 border-blue-700 pt-4 pb-2"
                      aria-current="step"
                    >
                      <span className="text-sm font-medium text-blue-700">
                        {step.name}
                      </span>
                    </div>
                  ) : (
                    <div className="group flex flex-col border-t-4 border-gray-200 pt-4 pb-2">
                      <span className="text-sm font-medium text-gray-500">
                        {step.name}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {currentStep === 1 && (
              <div className="h-[440px] overflow-y-auto">
                <div className="bg-white rounded-lg shadow-md p-6 border border-blue-100">
                  <h2 className="text-xl font-semibold text-blue-900 mb-6">
                    Role Information
                  </h2>

                  <div
                    className={`grid grid-cols-1 ${
                      userType === "Dealer"
                        ? "lg:grid-cols-3"
                        : "lg:grid-cols-2"
                    } gap-6`}
                  >
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        User Type
                      </label>
                      <div className="flex flex-wrap gap-4">
                        {["Skanray", "Dealer"].map((type) => (
                          <label key={type} className="flex items-center">
                            <input
                              type="radio"
                              name="userType"
                              value={type}
                              checked={userType === type}
                              onChange={(e) => {
                                setUserType(e.target.value);
                                if (e.target.value === "Dealer") {
                                  const serviceEngineerRole = roles.find(
                                    (role) => role.name === "Service Engineer"
                                  );
                                  if (serviceEngineerRole) {
                                    setSelectedRole(serviceEngineerRole);
                                    fetchRolePermissions(
                                      serviceEngineerRole.roleId
                                    );
                                  }
                                } else {
                                  setSelectedRole(null);
                                }
                              }}
                              className="w-5 h-5 text-blue-700 border-blue-300 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-lg text-blue-700">
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {userType === "Dealer" && (
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          Dealer <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={selectedDealer}
                            onChange={(e) => setSelectedDealer(e.target.value)}
                            className="w-full px-4 py-3 border border-blue-200 rounded-lg appearance-none bg-white"
                          >
                            <option value="">Select dealer</option>
                            {dealerList.map((dealer) => (
                              <option key={dealer._id} value={dealer.name}>
                                {dealer.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
                        </div>
                      </div>
                    )}

                    <div className="w-full">
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedRole?._id || ""}
                          onChange={(e) => {
                            const selected = roles.find(
                              (role) => role._id === e.target.value
                            );
                            setSelectedRole(selected);
                            if (errors.role) {
                              setErrors({ ...errors, role: null });
                            }
                            if (selected) {
                              fetchRolePermissions(selected.roleId);
                            }
                          }}
                          className={`w-full px-4 py-3 border ${
                            errors.role ? "border-red-500" : "border-blue-200"
                          } rounded-lg appearance-none bg-white`}
                          disabled={userType === "Dealer"}
                        >
                          <option value="">
                            {userType === "Dealer"
                              ? "Service Engineer"
                              : "Select role"}
                          </option>
                          {(userType === "Dealer"
                            ? roles.filter(
                                (role) => role.name === "Service Engineer"
                              )
                            : roles
                          ).map((role) => (
                            <option key={role._id} value={role._id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
                      </div>
                      {errors.role && (
                        <p className="mt-1 text-sm text-red-700">
                          {errors.role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-y-auto">
              {currentStep === 2 && (
                <div className="bg-white rounded-lg shadow-md p-6 border border-blue-100">
                  <h2 className="text-xl font-semibold text-blue-900 mb-6">
                    User Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-blue-200"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter first name"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-700">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${
                          errors.lastName ? "border-red-500" : "border-blue-200"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter last name"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-700">
                          {errors.lastName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${
                          errors.email ? "border-red-500" : "border-blue-200"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-700">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Mobile
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${
                          errors.mobile ? "border-red-500" : "border-blue-200"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter Mobile number"
                      />
                      {errors.mobile && (
                        <p className="mt-1 text-sm text-red-700">
                          {errors.mobile}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Login Expiry Date
                      </label>
                      <input
                        type="date"
                        name="loginexpirydate"
                        value={formData.loginexpirydate}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${
                          errors.loginexpirydate
                            ? "border-red-500"
                            : "border-blue-200"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter Mobile number"
                      />
                      {errors.loginexpirydate && (
                        <p className="mt-1 text-sm text-red-700">
                          {errors.loginexpirydate}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${
                          errors.zipCode ? "border-red-500" : "border-blue-200"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter zip code"
                      />
                      {errors.zipCode && (
                        <p className="mt-1 text-sm text-red-700">
                          {errors.zipCode}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        name="employeeid"
                        value={formData.employeeid}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${
                          errors.employeeid
                            ? "border-red-500"
                            : "border-blue-200"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter Employee Id"
                      />
                      {errors.employeeid && (
                        <p className="mt-1 text-sm text-red-700">
                          {errors.employeeid}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Password
                      </label>
                      <input
                        type="text"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${
                          errors.password ? "border-red-500" : "border-blue-200"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter Password"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-700">
                          {errors.password}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Manager Email
                      </label>
                      <input
                        type="text"
                        name="manageremail"
                        value={formData.manageremail}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${
                          errors.manageremail
                            ? "border-red-500"
                            : "border-blue-200"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter Manager Email"
                      />
                      {errors.manageremail && (
                        <p className="mt-1 text-sm text-red-700">
                          {errors.manageremail}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Profile Image
                      </label>
                      <input
                        type="text"
                        name="profileimage"
                        value={formData.profileimage}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${
                          errors.profileimage
                            ? "border-red-500"
                            : "border-blue-200"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter Profile Image "
                      />
                      {errors.profileimage && (
                        <p className="mt-1 text-sm text-red-700">
                          {errors.profileimage}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Device Id
                      </label>
                      <input
                        type="text"
                        name="deviceid"
                        value={formData.deviceid}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${
                          errors.deviceid ? "border-red-500" : "border-blue-200"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter Device Id"
                      />
                      {errors.deviceid && (
                        <p className="mt-1 text-sm text-red-700">
                          {errors.deviceid}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Device Registered Date
                      </label>
                      <input
                        type="date"
                        name="deviceregistereddate"
                        value={formData.deviceregistereddate}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${
                          errors.deviceregistereddate
                            ? "border-red-500"
                            : "border-blue-200"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter Manager Email"
                      />
                      {errors.deviceregistereddate && (
                        <p className="mt-1 text-sm text-red-700">
                          {errors.deviceregistereddate}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter full address"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {currentStep === 3 && (
              <div className="">
                <h2 className="text-xl font-semibold text-blue-900 mb-6">
                  Skills & Expertise
                </h2>
                <div className="grid grid-cols-3">
                  {Array.isArray(Skill) &&
                    Skill.map((skill) => (
                      <div
                        key={skill.productgroup}
                        className="mb-6 border-b pb-4"
                      >
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={isskillFullySelected(skill)}
                            onChange={(e) =>
                              handleskillCheckboxChange(skill, e.target.checked)
                            }
                            className="mr-2"
                          />
                          <label className="text-lg font-bold text-blue-800">
                            {skill.productgroup}
                          </label>
                        </div>
                        <ul className="pl-6 space-y-1">
                          {Array.isArray(skill.products) &&
                            skill.products.map((product) => (
                              <li
                                key={product._id}
                                className="flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  checked={!!selectedSkill[product._id]}
                                  onChange={(e) =>
                                    handleProductCheckboxChange(
                                      product._id,
                                      e.target.checked
                                    )
                                  }
                                  className="mr-2"
                                />
                                <span>{product.product}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="">
                <h2 className="text-xl font-semibold text-blue-900 mb-6">
                  Assign locations to user
                </h2>
                <div>
                  {permissions?.demographicSelections?.map((selection) => {
                    let options = [];
                    let selectedValue = null;
                    let onChangeHandler = () => {};
                    let label = selection.name;

                    switch (selection.name.toLowerCase()) {
                      case "geo":
                        options = geoOptions;
                        selectedValue =
                          selection.selectionType === "multi"
                            ? selectedGeo
                            : selectedSingleGeo;
                        onChangeHandler = (event, newValue) => {
                          if (selection.selectionType === "multi") {
                            setSelectedGeo(newValue);
                          } else {
                            setSelectedSingleGeo(newValue);
                          }
                        };
                        break;
                      case "country":
                        options = countries;
                        selectedValue =
                          selection.selectionType === "multi"
                            ? selectedCountries
                            : selectedSingleCountry;
                        onChangeHandler = (event, newValue) => {
                          if (selection.selectionType === "multi") {
                            setSelectedCountries(newValue);
                          } else {
                            setSelectedSingleCountry(newValue);
                          }
                        };
                        break;
                      case "region":
                        options = regionOptions;
                        selectedValue =
                          selection.selectionType === "multi"
                            ? selectedRegions
                            : selectedRegion;
                        onChangeHandler = (event, newValue) => {
                          if (selection.selectionType === "multi") {
                            setSelectedRegions(newValue);
                          } else {
                            setSelectedRegion(newValue);
                          }
                        };
                        break;
                      case "state":
                        options = states;
                        selectedValue =
                          selection.selectionType === "multi"
                            ? selectedStates
                            : selectedSingleState;
                        onChangeHandler = (event, newValue) => {
                          if (selection.selectionType === "multi") {
                            setSelectedStates(newValue);
                          } else {
                            setSelectedSingleState(newValue);
                          }
                        };
                        break;
                      case "branch":
                        options = branches;
                        selectedValue =
                          selection.selectionType === "multi"
                            ? selectedBranches
                            : selectedBranch;
                        onChangeHandler = (event, newValue) => {
                          if (selection.selectionType === "multi") {
                            setSelectedBranches(newValue);
                          } else {
                            setSelectedBranch(newValue);
                          }
                        };
                        break;
                      case "city":
                        options = cities;
                        selectedValue =
                          selection.selectionType === "multi"
                            ? selectedCities
                            : selectedSingleCity;
                        onChangeHandler = (event, newValue) => {
                          if (selection.selectionType === "multi") {
                            setSelectedCities(newValue);
                          } else {
                            setSelectedSingleCity(newValue);
                          }
                        };
                        break;
                      default:
                        return null;
                    }

                    if (!selection.isEnabled) return null;

                    return (
                      <div key={selection.name} className="mb-8">
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          {selection.selectionType === "multi"
                            ? `Select Multiple ${selection.name}s`
                            : `Select a ${selection.name}`}
                        </label>

                        <Autocomplete
                          multiple={selection.selectionType === "multi"}
                          options={options}
                          getOptionLabel={(option) => {
                            if (selection.name.toLowerCase() === "branch") {
                              return `${option.name} (${option.branchShortCode}) - ${option.city}, ${option.state}`;
                            }
                            return (
                              option.name || option.geoName || option.regionName
                            );
                          }}
                          value={selectedValue}
                          onChange={onChangeHandler}
                          isOptionEqualToValue={(option, value) =>
                            option._id === value._id
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              placeholder={
                                selection.selectionType === "multi"
                                  ? `Search and select ${selection.name.toLowerCase()}s`
                                  : `Search and select a ${selection.name.toLowerCase()}`
                              }
                            />
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 py-10">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center ml-auto"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 ${
                    isSubmitting
                      ? "bg-blue-400"
                      : "bg-blue-700 hover:bg-blue-700"
                  } text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center ml-auto`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Processing...
                    </>
                  ) : (
                    "Create User"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
