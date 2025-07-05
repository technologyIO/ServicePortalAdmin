"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import StepNavigation from "./StepNavigation";
import Step1RoleInfo from "./steps/Step1RoleInfo";
import Step2UserDetails from "./steps/Step2UserDetails";
import Step3Skills from "./steps/Step3Skills";
import { Autocomplete, TextField } from "@mui/joy";
import { ArrowLeft, ArrowRight, Save, UserPlus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";

export default function UserManagement() {
  const { userId } = useParams();
  const isEditMode = !!userId;
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState("Skanray");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
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
    manageremail: "",
    profileimage: null,
    deviceid: "",
    deviceregistereddate: "",
    department: "",
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch roles
        const rolesRes = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/roles`
        );
        setRoles(rolesRes.data);

        // Fetch dealers
        const dealersRes = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/alldealer`
        );
        setDealerList(dealersRes.data.dealers || []);

        // Fetch branches
        const branchesRes = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allbranch`
        );
        setBranches(branchesRes.data.branches || []);

        // Fetch regions
        const regionsRes = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/api/region`
        );
        setRegionOptions(regionsRes.data.data.regionDropdown || []);

        // Fetch geo
        const geoRes = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/api/geo`
        );
        setGeoOptions(geoRes.data.data.geoDropdown || []);

        // Fetch countries
        const countriesRes = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allcountry`
        );
        setCountries(countriesRes.data.countries || []);

        // Fetch states
        const statesRes = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allstate`
        );
        setStates(statesRes.data || []);

        // Fetch cities
        const citiesRes = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allcity`
        );
        setCities(citiesRes.data || []);

        // If in edit mode, fetch user data
        if (isEditMode) {
          const userRes = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/collections/user/${userId}`
          );
          const user = userRes.data;
          setUserType(user.usertype === "dealer" ? "Dealer" : "Skanray");
          setFormData({
            firstName: user.firstname || "",
            lastName: user.lastname || "",
            email: user.email || "",
            mobile: user.mobilenumber || "",
            address: user.address || "",
            city: user.city || "",
            state: user.state || "",
            zipCode: user.zipCode || "",
            loginexpirydate: user.loginexpirydate
              ? moment(user.loginexpirydate).format("YYYY-MM-DD")
              : "",
            employeeid: user.employeeid || "",
            manageremail: user.manageremail || "",
            profileimage: user.profileimage || "",
            deviceid: user.deviceid || "",
            department: user.department || "",
          });

          // Set role
          if (user.role) {
            const role = rolesRes.data.find(
              (r) => r.roleId === user.role.roleId
            );
            setSelectedRole(role);
            if (role) {
              fetchRolePermissions(role.roleId);
            }
          }

          // Set dealer if user is dealer
          if (user.usertype === "dealer" && user.dealerInfo) {
            const dealer = dealersRes.data.dealers.find(
              (d) => d._id === user.dealerInfo.dealerId
            );
            setSelectedDealer(dealer);
          }

          // Set skills
          if (user.skills && Array.isArray(user.skills)) {
            const skillsRes = await axios.get(
              `${process.env.REACT_APP_BASE_URL}/collections/skillbyproductgroup/`
            );
            setSkill(skillsRes.data);
            const skillsObj = {};
            skillsRes.data.forEach((skillGroup) => {
              skillGroup.products.forEach((product) => {
                if (
                  user.skills.some((s) => s.productName === product.product)
                ) {
                  skillsObj[product._id] = true;
                }
              });
            });
            setSelectedSkill(skillsObj);
          }

          // Set demographics
          if (user.demographics && Array.isArray(user.demographics)) {
            user.demographics.forEach((demo) => {
              switch (demo.type) {
                case "geo":
                  if (demo.selectionType === "multiple") {
                    const geoValues = demo.values.map((v) => ({
                      _id: v.id,
                      geoName: v.name,
                    }));
                    setSelectedGeo(geoValues);
                  } else {
                    setSelectedSingleGeo({
                      _id: demo.values[0].id,
                      geoName: demo.values[0].name,
                    });
                  }
                  break;
                case "country":
                  if (demo.selectionType === "multiple") {
                    const countryValues = demo.values.map((v) => ({
                      _id: v.id,
                      name: v.name,
                    }));
                    setSelectedCountries(countryValues);
                  } else {
                    setSelectedSingleCountry({
                      _id: demo.values[0].id,
                      name: demo.values[0].name,
                    });
                  }
                  break;
                case "region":
                  if (demo.selectionType === "multiple") {
                    const regionValues = demo.values.map((v) => ({
                      _id: v.id,
                      regionName: v.name,
                    }));
                    setSelectedRegions(regionValues);
                  } else {
                    setSelectedRegion({
                      _id: demo.values[0].id,
                      regionName: demo.values[0].name,
                    });
                  }
                  break;
                case "state":
                  if (demo.selectionType === "multiple") {
                    const stateValues = demo.values.map((v) => ({
                      _id: v.id,
                      name: v.name,
                    }));
                    setSelectedStates(stateValues);
                  } else {
                    setSelectedSingleState({
                      _id: demo.values[0].id,
                      name: demo.values[0].name,
                    });
                  }
                  break;
                case "city":
                  if (demo.selectionType === "multiple") {
                    const cityValues = demo.values.map((v) => ({
                      _id: v.id,
                      name: v.name,
                    }));
                    setSelectedCities(cityValues);
                  } else {
                    setSelectedSingleCity({
                      _id: demo.values[0].id,
                      name: demo.values[0].name,
                    });
                  }
                  break;
                case "branch":
                  if (demo.selectionType === "multiple") {
                    const branchValues = demo.values.map((v) => {
                      const branch = branchesRes.data.branches.find(
                        (b) => b.branchShortCode === v.name
                      );
                      return {
                        _id: v.id,
                        name: branch ? branch.name : v.name,
                        branchShortCode: v.name,
                      };
                    });
                    setSelectedBranches(branchValues);
                  } else {
                    const branchValue = demo.values[0];
                    const branch = branchesRes.data.branches.find(
                      (b) => b.branchShortCode === branchValue.name
                    );
                    setSelectedBranch({
                      _id: branchValue.id,
                      name: branch ? branch.name : branchValue.name,
                      branchShortCode: branchValue.name,
                    });
                  }
                  break;
              }
            });
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load initial data");
        if (isEditMode) {
          navigate("/user");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [userId, isEditMode, navigate]);

  const fetchRolePermissions = async (roleId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/roles/by-roleid/${roleId}`
      );
      setPermissions({
        features: response.data.features,
        demographicSelections: response.data.demographicSelections,
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

  const handleDealerSelect = (value) => {
    setSelectedDealer(value);
    setErrors((prev) => ({ ...prev, dealer: undefined }));
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!selectedRole) newErrors.role = "Role is required";
      if (userType === "Dealer" && !selectedDealer?._id) {
        newErrors.dealer = "Dealer is required";
      }
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
      if (!formData.manageremail)
        newErrors.manageremail = "Manager email is required";
    } else if (currentStep === 4) {
      permissions.demographicSelections.forEach((selection) => {
        if (selection.name.toLowerCase() === "city") return;
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

  const handleNext = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep === 4) {
      if (validateCurrentStep()) {
        setIsSubmitting(true);
        try {
          // Prepare skills array
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

          // Prepare demographics array
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

          if (
            (selectedCities.length > 0 || selectedSingleCity) &&
            permissions.demographicSelections.some(
              (s) => s.name.toLowerCase() === "city" && s.isEnabled
            )
          ) {
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
                      name: b.branchShortCode,
                    }))
                  : [
                      {
                        id: selectedBranch._id,
                        name: selectedBranch.branchShortCode,
                      },
                    ],
            });
          }

          // Create FormData object for file upload
          const formDataPayload = new FormData();

          // Append all simple fields
          formDataPayload.append("firstname", formData.firstName);
          formDataPayload.append("lastname", formData.lastName);
          formDataPayload.append("email", formData.email);
          formDataPayload.append("mobilenumber", formData.mobile);
          formDataPayload.append("address", formData.address);
          formDataPayload.append(
            "city",
            selectedSingleCity?.name || formData.city
          );
          formDataPayload.append(
            "state",
            selectedSingleState?.name || formData.state
          );
          formDataPayload.append("country", selectedSingleCountry?.name || "");
          formDataPayload.append("zipCode", formData.zipCode);
          formDataPayload.append("loginexpirydate", formData.loginexpirydate);
          formDataPayload.append("employeeid", formData.employeeid);
          formDataPayload.append("department", formData.department || "");
          formDataPayload.append("deviceid", formData.deviceid);
          formDataPayload.append("usertype", userType.toLowerCase());
          formDataPayload.append("status", "Active");
          formDataPayload.append("modifiedAt", new Date().toISOString());

          // Append the profile image if it exists
          if (formData.profileimage instanceof File) {
            formDataPayload.append("profileimage", formData.profileimage);
          } else if (formData.profileimage) {
            formDataPayload.append("profileimage", formData.profileimage);
          }

          // Append arrays as JSON strings
          formDataPayload.append("skills", JSON.stringify(skillsArray));
          formDataPayload.append(
            "demographics",
            JSON.stringify(demographicsArray)
          );

          // Handle manageremail (could be string or array)
          if (Array.isArray(formData.manageremail)) {
            formDataPayload.append(
              "manageremail",
              JSON.stringify(formData.manageremail)
            );
          } else {
            formDataPayload.append("manageremail", formData.manageremail || "");
          }

          // Append role data
          formDataPayload.append("role[roleName]", selectedRole?.name || "");
          formDataPayload.append("role[roleId]", selectedRole?.roleId || "");

          // Append dealer info if needed
          if (userType.toLowerCase() === "dealer" && selectedDealer) {
            formDataPayload.append(
              "dealerInfo[dealerName]",
              selectedDealer.name
            );
            formDataPayload.append("dealerInfo[dealerId]", selectedDealer._id);
            formDataPayload.append(
              "dealerInfo[dealerEmail]",
              selectedDealer.email
            );
            formDataPayload.append(
              "dealerInfo[dealerCode]",
              selectedDealer.dealercode
            );
          }

          // Prepare axios config
          const config = {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          };

          let response;
          if (isEditMode) {
            response = await axios.put(
              `${process.env.REACT_APP_BASE_URL}/collections/user/${userId}`,
              formDataPayload,
              config
            );
          } else {
            response = await axios.post(
              `${process.env.REACT_APP_BASE_URL}/collections/user`,
              formDataPayload,
              config
            );
          }

          if (response.status === (isEditMode ? 200 : 201)) {
            toast.success(
              `User ${isEditMode ? "updated" : "created"} successfully!`
            );
            navigate("/user");
          } else {
            throw new Error(
              response.data.message ||
                `Failed to ${isEditMode ? "update" : "create"} user`
            );
          }
        } catch (error) {
          console.error(
            `Error ${isEditMode ? "updating" : "creating"} user:`,
            error
          );
          toast.error(
            error.response?.data?.message ||
              error.message ||
              `Failed to ${isEditMode ? "update" : "create"} user`
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

  // Filter countries based on selected geo
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

  // Filter regions based on selected countries
  const filteredRegions = useMemo(() => {
    if (!permissions?.demographicSelections) return regionOptions;
    const countrySelection = permissions.demographicSelections.find(
      (sel) => sel.name.toLowerCase() === "country"
    );
    if (!countrySelection || !countrySelection.isEnabled) return regionOptions;

    const selectedCountryValues =
      countrySelection.selectionType === "multi"
        ? selectedCountries.map((c) => c.name)
        : selectedSingleCountry
        ? [selectedSingleCountry.name]
        : [];

    return selectedCountryValues.length > 0
      ? regionOptions.filter((region) =>
          selectedCountryValues.includes(region.country)
        )
      : [];
  }, [selectedCountries, selectedSingleCountry, regionOptions, permissions]);

  // Filter states based on selected regions
  const filteredStates = useMemo(() => {
    if (!permissions?.demographicSelections) return states;
    const regionSelection = permissions.demographicSelections.find(
      (sel) => sel.name.toLowerCase() === "region"
    );
    if (!regionSelection || !regionSelection.isEnabled) return states;

    const selectedRegionValues =
      regionSelection.selectionType === "multi"
        ? selectedRegions.map((r) => r.regionName)
        : selectedRegion
        ? [selectedRegion.regionName]
        : [];

    return selectedRegionValues.length > 0
      ? states.filter((state) => selectedRegionValues.includes(state.region))
      : [];
  }, [selectedRegions, selectedRegion, states, permissions]);

  // Filter branches based on selected states
  const filteredBranches = useMemo(() => {
    if (!permissions?.demographicSelections) return branches;
    const stateSelection = permissions.demographicSelections.find(
      (sel) => sel.name.toLowerCase() === "state"
    );
    if (!stateSelection || !stateSelection.isEnabled) return branches;

    const selectedStateValues =
      stateSelection.selectionType === "multi"
        ? selectedStates.map((s) => s.name)
        : selectedSingleState
        ? [selectedSingleState.name]
        : [];

    return selectedStateValues.length > 0
      ? branches
          .filter((branch) => selectedStateValues.includes(branch.state))
          .map((branch) => ({
            ...branch,
            name: branch.name,
            branchShortCode: branch.branchShortCode,
          }))
      : [];
  }, [selectedStates, selectedSingleState, branches, permissions]);

  // Filter cities based on selected branches
  const filteredCities = useMemo(() => {
    if (!permissions?.demographicSelections) return cities;
    const branchSelection = permissions.demographicSelections.find(
      (sel) => sel.name.toLowerCase() === "branch"
    );
    if (!branchSelection || !branchSelection.isEnabled) return cities;

    const selectedBranchValues =
      branchSelection.selectionType === "multi"
        ? selectedBranches.map((b) => b.name)
        : selectedBranch
        ? [selectedBranch.name]
        : [];

    return selectedBranchValues.length > 0
      ? cities.filter((city) => selectedBranchValues.includes(city.branch))
      : [];
  }, [selectedBranches, selectedBranch, cities, permissions]);

  // Helper to pluralize properly
  const pluralize = (word) => {
    if (!word) return "";
    const lower = word.toLowerCase();
    switch (lower) {
      case "country":
        return "countries";
      case "city":
        return "cities";
      case "branch":
        return "branches";
      case "geo":
        return "geos";
      case "region":
        return "regions";
      case "state":
        return "states";
      default:
        return word + "s";
    }
  };

  const renderLocationControls = () => {
    return permissions?.demographicSelections?.map((selection) => {
      if (!selection.isEnabled) return null;

      let options = [];
      let selectedValue = null;
      let onChangeHandler = () => {};
      let isDisabled = false;
      let dependsOn = null;

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
            // Reset all dependent fields
            setSelectedCountries([]);
            setSelectedSingleCountry(null);
            setSelectedRegions([]);
            setSelectedRegion(null);
            setSelectedStates([]);
            setSelectedSingleState(null);
            setSelectedBranches([]);
            setSelectedBranch(null);
            setSelectedCities([]);
            setSelectedSingleCity(null);
          };
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
            // Reset dependent fields
            setSelectedRegions([]);
            setSelectedRegion(null);
            setSelectedStates([]);
            setSelectedSingleState(null);
            setSelectedBranches([]);
            setSelectedBranch(null);
            setSelectedCities([]);
            setSelectedSingleCity(null);
          };
          dependsOn = "geo";
          break;

        case "region":
          options = filteredRegions;
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
            // Reset dependent fields
            setSelectedStates([]);
            setSelectedSingleState(null);
            setSelectedBranches([]);
            setSelectedBranch(null);
            setSelectedCities([]);
            setSelectedSingleCity(null);
          };
          dependsOn = "country";
          break;

        case "state":
          options = filteredStates;
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
            // Reset dependent fields
            setSelectedBranches([]);
            setSelectedBranch(null);
            setSelectedCities([]);
            setSelectedSingleCity(null);
          };
          dependsOn = "region";
          break;

        case "branch":
          options = filteredBranches;
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
            // Reset dependent fields
            setSelectedCities([]);
            setSelectedSingleCity(null);
          };
          dependsOn = "state";
          break;

        case "city":
          options = filteredCities;
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
          dependsOn = "branch";
          break;

        default:
          return null;
      }

      // Handle disable based on dependency
      if (dependsOn) {
        const dependency = permissions.demographicSelections.find(
          (s) => s.name.toLowerCase() === dependsOn
        );
        if (dependency) {
          if (dependency.selectionType === "multi") {
            isDisabled =
              dependsOn === "geo"
                ? selectedGeo.length === 0
                : dependsOn === "country"
                ? selectedCountries.length === 0
                : dependsOn === "region"
                ? selectedRegions.length === 0
                : dependsOn === "state"
                ? selectedStates.length === 0
                : selectedBranches.length === 0;
          } else {
            isDisabled =
              dependsOn === "geo"
                ? !selectedSingleGeo
                : dependsOn === "country"
                ? !selectedSingleCountry
                : dependsOn === "region"
                ? !selectedRegion
                : dependsOn === "state"
                ? !selectedSingleState
                : !selectedBranch;
          }
        }
      }

      return (
        <div key={selection.name} className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {selection.selectionType === "multi"
              ? `Select Multiple ${pluralize(selection.name)}`
              : `Select a ${selection.name}`}{" "}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <Autocomplete
              multiple={selection.selectionType === "multi"}
              options={options}
              getOptionLabel={(option) => {
                if (selection.name.toLowerCase() === "branch") {
                  return option.name || option.branchShortCode;
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
                      ? `Search and select ${pluralize(
                          selection.name.toLowerCase()
                        )}`
                      : `Search and select a ${selection.name.toLowerCase()}`
                  }
                  className={`transition-all duration-300 ${
                    errors[selection.name]
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                />
              )}
            />
            {selectedValue && (
              <div className="absolute top-1/2 right-12 transform -translate-y-1/2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
          {errors[selection.name] && (
            <div className="mt-2 flex items-center text-red-500 text-sm">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors[selection.name]}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        {/* Fixed Sidebar Placeholder */}
        <div className=" bg-gray-100 border-r border-gray-200"></div>

        {/* Main Content Loading */}
        <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-700 font-medium">
              Loading user management...
            </p>
            <p className="text-gray-500 text-sm text-center">
              Please wait while we prepare everything for you
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Fixed Sidebar */}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Fixed Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0 z-30">
          <div className="px-3 py-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/user")}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {isEditMode ? "Edit User" : "Add New User"}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {isEditMode
                      ? "Update user information and permissions"
                      : "Create a new user account with roles and permissions"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isEditMode ? (
                  <Save className="w-5 h-5 text-blue-600" />
                ) : (
                  <UserPlus className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Step Navigation */}
        <div className="bg-white border-b border-gray-200 flex-shrink-0 z-20">
          <div className="px-6 py-4">
            <StepNavigation currentStep={currentStep} steps={steps} />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step Content */}
              <div className="min-h-[600px]">
                {currentStep === 1 && (
                  <Step1RoleInfo
                    userType={userType}
                    setUserType={setUserType}
                    selectedDealer={selectedDealer}
                    setSelectedDealer={handleDealerSelect}
                    dealerList={dealerList}
                    roles={roles}
                    selectedRole={selectedRole}
                    setSelectedRole={setSelectedRole}
                    errors={errors}
                    setErrors={setErrors}
                    fetchRolePermissions={fetchRolePermissions}
                    isEditMode={isEditMode}
                  />
                )}

                {currentStep === 2 && (
                  <Step2UserDetails
                    formData={formData}
                    handleInputChange={handleInputChange}
                    errors={errors}
                    isEditMode={isEditMode}
                    setFormData={setFormData}
                  />
                )}

                {currentStep === 3 && (
                  <Step3Skills
                    Skill={Skill}
                    selectedSkill={selectedSkill}
                    setSelectedSkill={setSelectedSkill}
                  />
                )}

                {currentStep === 4 && (
                  <div className="bg-white/80 bg-white   p-8 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center   gap-4">
                      <div>
                        <h2 className="text-3xl font-bold text-blue-900 mb-2">
                          Location Assignment
                        </h2>
                        <p className="text-gray-600">
                          Assign geographical locations and access areas for
                          this user
                        </p>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {renderLocationControls()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Fixed Navigation Footer */}
        <div className="bg-white border-t border-gray-200 p-6 flex-shrink-0 z-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-8 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center"
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
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center ml-auto"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className={`px-8 py-3 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center ml-auto ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                }`}
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
                  <>
                    {isEditMode ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update User
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create User
                      </>
                    )}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
