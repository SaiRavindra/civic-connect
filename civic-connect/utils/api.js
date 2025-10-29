import axios from "axios";

const API = axios.create({
  baseURL: "http://10.89.17.225:5000/api", // Replace with your backend IP
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
