import React from "react";
import { Autocomplete, TextField } from "@mui/joy";

export default function Step4LocationDetails({
  permissions,
  errors,
  geoOptions,
  selectedGeo,
  setSelectedGeo,
  selectedSingleGeo,
  setSelectedSingleGeo,
  countries,
  selectedCountries,
  setSelectedCountries,
  selectedSingleCountry,
  setSelectedSingleCountry,
  regionOptions,
  selectedRegions,
  setSelectedRegions,
  selectedRegion,
  setSelectedRegion,
  states,
  selectedStates,
  setSelectedStates,
  selectedSingleState,
  setSelectedSingleState,
  branches,
  selectedBranches,
  setSelectedBranches,
  selectedBranch,
  setSelectedBranch,
  cities,
  selectedCities,
  setSelectedCities,
  selectedSingleCity,
  setSelectedSingleCity
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-blue-900 mb-6">
        Assign locations to user
      </h2>
      <div>
        {permissions?.demographicSelections?.map((selection) => {
          if (!selection.isEnabled) return null;
          
          let options = [];
          let selectedValue = null;
          let onChangeHandler = () => {};
          let label = selection.name;

          switch (selection.name.toLowerCase()) {
            case "geo":
              options = geoOptions;
              selectedValue = selection.selectionType === "multi" 
                ? selectedGeo : selectedSingleGeo;
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
              selectedValue = selection.selectionType === "multi" 
                ? selectedCountries : selectedSingleCountry;
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
              selectedValue = selection.selectionType === "multi" 
                ? selectedRegions : selectedRegion;
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
              selectedValue = selection.selectionType === "multi" 
                ? selectedStates : selectedSingleState;
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
              selectedValue = selection.selectionType === "multi" 
                ? selectedBranches : selectedBranch;
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
              selectedValue = selection.selectionType === "multi" 
                ? selectedCities : selectedSingleCity;
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

          return (
            <div key={selection.name} className="mb-8">
              <label className="block text-sm font-medium text-blue-800 mb-2">
                {selection.selectionType === "multi"
                  ? `Select Multiple ${selection.name}s`
                  : `Select a ${selection.name}`}
                <span className="text-red-500">*</span>
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
              {errors[selection.name] && (
                <p className="mt-1 text-sm text-red-700">
                  {errors[selection.name]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}