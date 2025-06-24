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
    password: "",
    manageremail: "",
    profileimage: "",
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
            password: "",
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
                    const branchValues = demo.values.map((v) => ({
                      _id: v.id,
                      name: v.name.split(" (")[0],
                      branchShortCode: v.name.match(/\(([^)]+)\)/)?.[1],
                    }));
                    setSelectedBranches(branchValues);
                  } else {
                    const branchValue = demo.values[0];
                    setSelectedBranch({
                      _id: branchValue.id,
                      name: branchValue.name.split(" (")[0],
                      branchShortCode:
                        branchValue.name.match(/\(([^)]+)\)/)?.[1],
                    });
                  }
                  break;
                default:
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
      if (!isEditMode && !formData.password)
        newErrors.password = "Password is required";
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

  const handleNext = (e) => {
    if (e?.preventDefault) e.preventDefault();

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

    if (currentStep === 4) {
      if (validateCurrentStep()) {
        setIsSubmitting(true);

        try {
          if (!isEditMode && !formData.password) {
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
            manageremail: formData.manageremail,
            profileimage: formData.profileimage,
            deviceid: formData.deviceid,
            usertype: userType.toLowerCase(),
            skills: skillsArray,
            demographics: demographicsArray,
            status: "Active",
            modifiedAt: new Date(),
            role: {
              roleName: selectedRole?.name || "",
              roleId: selectedRole?.roleId || "",
            },
          };

          // Only include password if it's set (for edit) or required (for create)
          if (formData.password) {
            userData.password = formData.password;
          }

          // Only add dealerInfo if user is a dealer AND dealer is selected
          if (userType.toLowerCase() === "dealer" && selectedDealer) {
            userData.dealerInfo = {
              dealerName: selectedDealer.name,
              dealerId: selectedDealer._id,
              dealerEmail: selectedDealer.email,
              dealerCode: selectedDealer.dealercode,
            };
          }

          let response;
          if (isEditMode) {
            response = await axios.put(
              `${process.env.REACT_APP_BASE_URL}/collections/user/${userId}`,
              userData
            );
          } else {
            response = await axios.post(
              `${process.env.REACT_APP_BASE_URL}/collections/user`,
              userData
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

  // Filter cities based on selected states
  const filteredCities = useMemo(() => {
    if (!permissions?.demographicSelections) return cities;

    const stateSelection = permissions.demographicSelections.find(
      (sel) => sel.name.toLowerCase() === "state"
    );

    if (!stateSelection || !stateSelection.isEnabled) return cities;

    const selectedStateValues =
      stateSelection.selectionType === "multi"
        ? selectedStates.map((s) => s.name)
        : selectedSingleState
        ? [selectedSingleState.name]
        : [];

    return selectedStateValues.length > 0
      ? cities.filter((city) => selectedStateValues.includes(city.state))
      : [];
  }, [selectedStates, selectedSingleState, cities, permissions]);

  // Filter branches based on selected regions
  const filteredBranches = useMemo(() => {
    if (!permissions?.demographicSelections) return branches;

    const regionSelection = permissions.demographicSelections.find(
      (sel) => sel.name.toLowerCase() === "region"
    );

    if (!regionSelection || !regionSelection.isEnabled) return branches;

    const selectedRegionValues =
      regionSelection.selectionType === "multi"
        ? selectedRegions.map((r) => r.regionName)
        : selectedRegion
        ? [selectedRegion.regionName]
        : [];

    return selectedRegionValues.length > 0
      ? branches.filter((branch) =>
          selectedRegionValues.includes(branch.region)
        )
      : [];
  }, [selectedRegions, selectedRegion, branches, permissions]);

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
            setSelectedCountries([]);
            setSelectedSingleCountry(null);
            setSelectedRegions([]);
            setSelectedRegion(null);
            setSelectedStates([]);
            setSelectedSingleState(null);
            setSelectedCities([]);
            setSelectedSingleCity(null);
            setSelectedBranches([]);
            setSelectedBranch(null);
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
            setSelectedRegions([]);
            setSelectedRegion(null);
            setSelectedStates([]);
            setSelectedSingleState(null);
            setSelectedCities([]);
            setSelectedSingleCity(null);
            setSelectedBranches([]);
            setSelectedBranch(null);
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
            setSelectedStates([]);
            setSelectedSingleState(null);
            setSelectedCities([]);
            setSelectedSingleCity(null);
            setSelectedBranches([]);
            setSelectedBranch(null);
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
            setSelectedCities([]);
            setSelectedSingleCity(null);
          };
          dependsOn = "region";
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
          dependsOn = "state";
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
          };
          dependsOn = "region";
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
                : selectedStates.length === 0;
          } else {
            isDisabled =
              dependsOn === "geo"
                ? !selectedSingleGeo
                : dependsOn === "country"
                ? !selectedSingleCountry
                : dependsOn === "region"
                ? !selectedRegion
                : !selectedSingleState;
          }
        }
      }

      return (
        <div key={selection.name} className="mb-8">
          <label className="block text-sm font-medium text-blue-800 mb-2">
            {selection.selectionType === "multi"
              ? `Select Multiple ${pluralize(selection.name)}`
              : `Select a ${selection.name}`}
          </label>

          <Autocomplete
            multiple={selection.selectionType === "multi"}
            options={options}
            getOptionLabel={(option) => {
              if (selection.name.toLowerCase() === "branch") {
                return `${option.name} (${option.branchShortCode})  - ${option.region}`;
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
              />
            )}
          />
          {errors[selection.name] && (
            <p className="mt-1 text-sm text-red-600">
              {errors[selection.name]}
            </p>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br">
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">
                {isEditMode ? "Edit User" : "Add New User"}
              </h1>
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

            <div className="overflow-y-auto">
              {currentStep === 2 && (
                <Step2UserDetails
                  formData={formData}
                  handleInputChange={handleInputChange}
                  errors={errors}
                  isEditMode={isEditMode}
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
                  ) : isEditMode ? (
                    "Update User"
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
