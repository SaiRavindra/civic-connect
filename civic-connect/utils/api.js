import axios from "axios";

const API = axios.create({
  baseURL: "http://10.161.238.225:5000/api", // Replace with your backend IP
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
