import API from "./api";

export const getJobs = () => API.get("/jobs");
export const postJob = (jobData) => API.post("/jobs", jobData);
export const getEmployerJobs = () => API.get("/jobs/employer");
export const updateJob = (id, jobData) => API.put(`/jobs/${id}`, jobData);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);
export const getRecommendations = () => API.get("/jobs/recommendations");
export const getJobDetails = (id) => API.get(`/jobs/${id}`);
export const applyToJob = (id, applicationData) => API.post(`/applications/apply/${id}`, applicationData);
