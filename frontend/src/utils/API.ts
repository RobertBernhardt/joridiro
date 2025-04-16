// API.ts
import axios from "axios";

// Determine the base URL based on the environment
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Check for production domains
    if (window.location.hostname.includes('joridiro.com') || 
        window.location.hostname.includes('vercel.app')) {
      return "https://backend-dot-joridiro.ew.r.appspot.com";
    }
  }
  // Fallback to local development (using HTTP instead of HTTPS for local)
  return "http://localhost:8000";
};

const baseURL = getBaseURL();

// Set cookies from response
axios.defaults.withCredentials = true;

// Create instance with base URL
const axiosAPI = axios.create({
  baseURL
});

// implement a method to execute all the request from here.
const apiRequest = (method: 'get' | 'post' | 'put' | 'delete' | 'patch', url: string, request?: any) => {
  const headers = {
    credentials: "include",
    "Content-Type": "application/json",
  };
  //using the axios instance to perform the request that received from each http method
  return axiosAPI({
    method,
    url,
    data: request,
    headers,
    withCredentials: true,
  }).then((res) => {
    return Promise.resolve(res.data);
  })
    .catch((err) => {
      return Promise.reject(err);
    });
};

// function to execute the http get request
const get = (url: string, request: any) => apiRequest("get", url, request);

// function to execute the http delete request
const deleteRequest = (url: string, request: any) => apiRequest("delete", url, request);

// function to execute the http post request
const post = (url: string, request: any) => apiRequest("post", url, request);

// function to execute the http put request
const put = (url: string, request: any) => apiRequest("put", url, request);

// function to execute the http path request
const patch = (url: string, request: any) => apiRequest("patch", url, request);

// Calculate socket URL based on the baseURL
const socketURLParts = baseURL.replace(/^https?:\/\//, '').split(':');
const socketURL = socketURLParts[0];
const socketPort = socketURLParts[1] || "";

// expose your method to other services or actions
const API = {
  baseURL,
  socketURL,
  socketPort,
  get,
  delete: deleteRequest,
  post,
  put,
  patch
};

export default API;