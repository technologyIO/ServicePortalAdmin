import React, { useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/joy';

export default function Step4LocationDetails({
  permissions,
  geoOptions,
  countries,
  regionOptions,
  states,
  branches,
  cities,
  selectedGeo,
  setSelectedGeo,
  selectedSingleGeo,
  setSelectedSingleGeo,
  selectedCountries,
  setSelectedCountries,
  selectedSingleCountry,
  setSelectedSingleCountry,
  selectedRegions,
  setSelectedRegions,
  selectedRegion,
  setSelectedRegion,
  selectedStates,
  setSelectedStates,
  selectedSingleState,
  setSelectedSingleState,
  selectedBranches,
  setSelectedBranches,
  selectedBranch,
  setSelectedBranch,
  selectedCities,
  setSelectedCities,
  selectedSingleCity,
  setSelectedSingleCity,
  errors
}) {
  const pluralize = (word) => {
    if (!word) return "";
    const lower = word.toLowerCase();

    switch (lower) {
      case "country": return "countries";
      case "city": return "cities";
      case "branch": return "branches";
      case "geo": return "geos";
      case "region": return "regions";
      case "state": return "states";
      default: return word + "s";
    }
  };

  // Filter countries based on selected geo
  const filteredCountries = useMemo(() => {
    const geoSelection = permissions?.demographicSelections?.find(
      (sel) => sel.name.toLowerCase() === "geo"
    );

    if (!geoSelection || !geoSelection.isEnabled) return countries;

    const selectedGeoValues = geoSelection.selectionType === "multi"
      ? selectedGeo.map((g) => g.geoName)
      : selectedSingleGeo ? [selectedSingleGeo.geoName] : [];

    return selectedGeoValues.length > 0
      ? countries.filter((country) => selectedGeoValues.includes(country.geo))
      : [];
  }, [selectedGeo, selectedSingleGeo, countries, permissions]);

  // Filter regions based on selected countries
  const filteredRegions = useMemo(() => {
    const countrySelection = permissions?.demographicSelections?.find(
      (sel) => sel.name.toLowerCase() === "country"
    );

    if (!countrySelection || !countrySelection.isEnabled) return regionOptions;

    const selectedCountryValues = countrySelection.selectionType === "multi"
      ? selectedCountries.map((c) => c.name)
      : selectedSingleCountry ? [selectedSingleCountry.name] : [];

    return selectedCountryValues.length > 0
      ? regionOptions.filter((region) => selectedCountryValues.includes(region.country))
      : [];
  }, [selectedCountries, selectedSingleCountry, regionOptions, permissions]);

  // Filter states based on selected regions
  const filteredStates = useMemo(() => {
    const regionSelection = permissions?.demographicSelections?.find(
      (sel) => sel.name.toLowerCase() === "region"
    );

    if (!regionSelection || !regionSelection.isEnabled) return states;

    const selectedRegionValues = regionSelection.selectionType === "multi"
      ? selectedRegions.map((r) => r.regionName)
      : selectedRegion ? [selectedRegion.regionName] : [];

    return selectedRegionValues.length > 0
      ? states.filter((state) => selectedRegionValues.includes(state.region))
      : [];
  }, [selectedRegions, selectedRegion, states, permissions]);

  // Filter branches based on selected states
  const filteredBranches = useMemo(() => {
    const stateSelection = permissions?.demographicSelections?.find(
      (sel) => sel.name.toLowerCase() === "state"
    );

    if (!stateSelection || !stateSelection.isEnabled) return branches;

    const selectedStateValues = stateSelection.selectionType === "multi"
      ? selectedStates.map((s) => s.name)
      : selectedSingleState ? [selectedSingleState.name] : [];

    return selectedStateValues.length > 0
      ? branches.filter((branch) => selectedStateValues.includes(branch.state))
      : [];
  }, [selectedStates, selectedSingleState, branches, permissions]);

  // Filter cities based on selected branches
  const filteredCities = useMemo(() => {
    const branchSelection = permissions?.demographicSelections?.find(
      (sel) => sel.name.toLowerCase() === "branch"
    );

    if (!branchSelection || !branchSelection.isEnabled) return cities;

    const selectedBranchValues = branchSelection.selectionType === "multi"
      ? selectedBranches.map((b) => b.name)
      : selectedBranch ? [selectedBranch.name] : [];

    return selectedBranchValues.length > 0
      ? cities.filter((city) => selectedBranchValues.includes(city.branch))
      : [];
  }, [selectedBranches, selectedBranch, cities, permissions]);

  const renderLocationControl = (selection) => {
    let options = [];
    let selectedValue = null;
    let onChangeHandler = () => {};
    let isDisabled = false;
    let dependsOn = null;

    switch (selection.name.toLowerCase()) {
      case "geo":
        options = geoOptions;
        selectedValue = selection.selectionType === "multi" ? selectedGeo : selectedSingleGeo;
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
        selectedValue = selection.selectionType === "multi" ? selectedCountries : selectedSingleCountry;
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
        selectedValue = selection.selectionType === "multi" ? selectedRegions : selectedRegion;
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
        selectedValue = selection.selectionType === "multi" ? selectedStates : selectedSingleState;
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
        selectedValue = selection.selectionType === "multi" ? selectedBranches : selectedBranch;
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
        selectedValue = selection.selectionType === "multi" ? selectedCities : selectedSingleCity;
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
            dependsOn === "geo" ? selectedGeo.length === 0 :
            dependsOn === "country" ? selectedCountries.length === 0 :
            dependsOn === "region" ? selectedRegions.length === 0 :
            dependsOn === "state" ? selectedStates.length === 0 :
            selectedBranches.length === 0;
        } else {
          isDisabled =
            dependsOn === "geo" ? !selectedSingleGeo :
            dependsOn === "country" ? !selectedSingleCountry :
            dependsOn === "region" ? !selectedRegion :
            dependsOn === "state" ? !selectedSingleState :
            !selectedBranch;
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
              return `${option.name} (${option.branchShortCode}) - ${option.state}`;
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
                  ? `Search and select ${pluralize(selection.name.toLowerCase())}`
                  : `Search and select a ${selection.name.toLowerCase()}`
              }
            />
          )}
        />
        {errors[selection.name] && (
          <p className="mt-1 text-sm text-red-600">{errors[selection.name]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="">
      <h2 className="text-xl font-semibold text-blue-900 mb-6">
        Assign locations to user
      </h2>
      <div>
        {permissions?.demographicSelections?.map((selection) => 
          selection.isEnabled ? renderLocationControl(selection) : null
        )}
      </div>
    </div>
  );
}