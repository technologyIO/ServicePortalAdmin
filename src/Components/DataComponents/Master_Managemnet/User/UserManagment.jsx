import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import StepNavigation from "./StepNavigation";
import Step1RoleInfo from "./steps/Step1RoleInfo";
import Step2UserDetails from "./steps/Step2UserDetails";
import Step3Skills from "./steps/Step3Skills";
import Step4LocationDetails from "./steps/Step4LocationDetails";
import { Autocomplete, TextField } from "@mui/joy";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserManagement() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState("Skanray");
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
  const navigate = useNavigate();
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
        .get(
          `${process.env.REACT_APP_BASE_URL}/collections/skillbyproductgroup/`
        )
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
    fetch(`${process.env.REACT_APP_BASE_URL}/collections/allbranch`)
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
    fetch(`${process.env.REACT_APP_BASE_URL}/collections/api/region`)
      .then((res) => res.json())
      .then((data) => {
        setRegionOptions(data.data.regionDropdown || []);
      });
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/collections/api/geo`)
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
    fetch(`${process.env.REACT_APP_BASE_URL}/collections/allcountry`)
      .then((res) => res.json())
      .then((data) => setCountries(data.countries || []))
      .catch((err) => console.error("Failed to fetch countries", err));
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/collections/allstate`)
      .then((res) => res.json())
      .then((data) => setStates(data))
      .catch((err) => console.error("Failed to load states", err));
  }, []);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/collections/allcity`)
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
      if (userType === "Dealer" && !selectedDealer)
        newErrors.dealer = "Dealer is required";
    } else if (currentStep === 2) {
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.employeeid)
        newErrors.employeeid = "Employee ID is required";
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
      if (!formData.mobile) {
        newErrors.mobile = "Mobile is required";
      } else if (!/^\d{10,15}$/.test(formData.mobile)) {
        newErrors.mobile = "Mobile number is invalid";
      }
      if (!formData.password) newErrors.password = "Password is required";
      if (!formData.manageremail)
        newErrors.manageremail = "Manager email is required";
    } else if (currentStep === 4) {
      permissions.demographicSelections.forEach((selection) => {
        if (selection.isEnabled) {
          let value;
          switch (selection.name.toLowerCase()) {
            case "geo":
              value =
                selection.selectionType === "multi"
                  ? selectedGeo
                  : selectedSingleGeo;
              break;
            case "country":
              value =
                selection.selectionType === "multi"
                  ? selectedCountries
                  : selectedSingleCountry;
              break;
            case "region":
              value =
                selection.selectionType === "multi"
                  ? selectedRegions
                  : selectedRegion;
              break;
            case "state":
              value =
                selection.selectionType === "multi"
                  ? selectedStates
                  : selectedSingleState;
              break;
            case "city":
              value =
                selection.selectionType === "multi"
                  ? selectedCities
                  : selectedSingleCity;
              break;
            case "branch":
              value =
                selection.selectionType === "multi"
                  ? selectedBranches
                  : selectedBranch;
              break;
            default:
              value = null;
          }

          if (
            (Array.isArray(value) && value.length === 0) ||
            (!Array.isArray(value) && !value)
          ) {
            newErrors[selection.name] = `${selection.name} is required`;
          }
        }
      });
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
            navigate("/user");
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
  const filteredCountries = useMemo(() => {
    if (!permissions?.demographicSelections) return countries;

    const geoSelection = permissions.demographicSelections.find(
      (sel) => sel.name.toLowerCase() === "geo"
    );

    if (!geoSelection || !geoSelection.isEnabled) return countries;

    const selectedGeoValues =
      geoSelection.selectionType === "multi"
        ? selectedGeo.map((g) => g.geoName)
        : selectedSingleGeo
        ? [selectedSingleGeo.geoName]
        : [];

    return selectedGeoValues.length > 0
      ? countries.filter((country) => selectedGeoValues.includes(country.geo))
      : [];
  }, [selectedGeo, selectedSingleGeo, countries, permissions]);

  // Combined geo change handler
  const handleGeoChange = (event, newValue, selection) => {
    if (selection.selectionType === "multi") {
      setSelectedGeo(newValue);
    } else {
      setSelectedSingleGeo(newValue);
    }

    // Reset all dependent selections
    setSelectedCountries([]);
    setSelectedSingleCountry(null);
    setSelectedStates([]);
    setSelectedSingleState(null);
    setSelectedCities([]);
    setSelectedSingleCity(null);
    setSelectedRegions([]);
    setSelectedRegion(null);
    setSelectedBranches([]);
    setSelectedBranch(null);

    // Clear form fields
    setFormData((prev) => ({
      ...prev,
      country: "",
      state: "",
      city: "",
    }));
  };

  const renderLocationControls = () => {
    return permissions?.demographicSelections?.map((selection) => {
      if (!selection.isEnabled) return null;

      let options = [];
      let selectedValue = null;
      let onChangeHandler = () => {};
      let isDisabled = false;

      switch (selection.name.toLowerCase()) {
        case "geo":
          options = geoOptions;
          selectedValue =
            selection.selectionType === "multi"
              ? selectedGeo
              : selectedSingleGeo;
          onChangeHandler = (event, newValue) =>
            handleGeoChange(event, newValue, selection);
          break;

        case "country":
          options = filteredCountries;
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
          // Only disable if no geo is selected
          isDisabled =
            selection.selectionType === "multi"
              ? selectedGeo.length === 0
              : !selectedSingleGeo;
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
          // Only disable if no country is selected
          isDisabled =
            selection.selectionType === "multi"
              ? selectedCountries.length === 0
              : !selectedSingleCountry;
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
          // Only disable if no state is selected
          isDisabled =
            selection.selectionType === "multi"
              ? selectedStates.length === 0
              : !selectedSingleState;
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

        default:
          return null;
      }

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
              return option.name || option.geoName || option.regionName;
            }}
            value={selectedValue}
            onChange={onChangeHandler}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            disabled={isDisabled}
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
    });
  };

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
          <StepNavigation currentStep={currentStep} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {currentStep === 1 && (
              <Step1RoleInfo
                userType={userType}
                setUserType={setUserType}
                selectedDealer={selectedDealer}
                setSelectedDealer={setSelectedDealer}
                dealerList={dealerList}
                roles={roles}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                errors={errors}
                setErrors={setErrors}
                fetchRolePermissions={fetchRolePermissions}
              />
            )}

            <div className="overflow-y-auto">
              {currentStep === 2 && (
                <Step2UserDetails
                  formData={formData}
                  handleInputChange={handleInputChange}
                  errors={errors}
                />
              )}
            </div>

            {currentStep === 3 && (
              <Step3Skills
                Skill={Skill}
                selectedSkill={selectedSkill}
                setSelectedSkill={setSelectedSkill}
              />
            )}

            {currentStep === 4 && (
              <div className="">
                <h2 className="text-xl font-semibold text-blue-900 mb-6">
                  Assign locations to user
                </h2>
                <div>{renderLocationControls()}</div>
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
