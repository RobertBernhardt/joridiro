// Api.js
import axios from "axios";

// Determine the base URL based on the environment
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Check if we're in production (Vercel)
    if (window.location.hostname !== 'localhost') {
      return "https://backend-dot-joridiro.ew.r.appspot.com";
    }
  }
  // Fallback to local development
  return "https://localhost:8000";
};

const baseURL = getBaseURL();

// Create a instance of axios to use the same base url.
const axiosAPI = axios.create({
  baseURL
});

// Set cookies from response
axios.defaults.withCredentials = true;

// implement a method to execute all the request from here.
const apiRequest = (method: string, url: any, request: any) => {
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
  }).then((res:any) => {
    return Promise.resolve(res.data);
  })
    .catch((err:any) => {
      return Promise.reject(err);
    });
};

// function to execute the http get request
const get = (url: any, request: any) => apiRequest("get", url, request);

// function to execute the http delete request
const deleteRequest = (url: any, request: any) => apiRequest("delete", url, request);

// function to execute the http post request
const post = (url: any, request: any) => apiRequest("post", url, request);

// function to execute the http put request
const put = (url: any, request: any) => apiRequest("put", url, request);

// function to execute the http path request
const patch = (url: any, request: any) => apiRequest("patch", url, request);

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