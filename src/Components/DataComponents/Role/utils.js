import axios from "axios";
import toast from "react-hot-toast";

export const fetchRoles = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/roles`);
    return res.data;
  } catch (err) {
    toast.error("Failed to fetch roles");
    console.error(err);
    return [];
  }
};

export const fetchStates = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/collections/allstate`);
    return res.data;
  } catch (err) {
    toast.error("Failed to fetch states");
    console.error(err);
    return [];
  }
};

export const fetchCities = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/collections/allcity`);
    return res.data;
  } catch (err) {
    toast.error("Failed to fetch cities");
    console.error(err);
    return [];
  }
};

export const fetchComponents = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/role/components`);
    return res.data || [];
  } catch (err) {
    toast.error("Failed to fetch components");
    console.error(err);
    return [];
  }
};

export const fetchParentRoles = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/roles`);
    return res.data;
  } catch (err) {
    toast.error("Failed to fetch parent roles");
    console.error(err);
    return [];
  }
};
