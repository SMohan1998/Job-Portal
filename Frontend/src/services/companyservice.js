import API from "./api";

export const getMyCompany = () => API.get("/companies/mine");

export const updateCompany = (id, companyData) =>
  API.put(`/companies/${id}`, companyData);

export const uploadCompanyLogo = (id, formData) =>
  API.post(`/companies/${id}/logo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getCompanyById = (id) => API.get(`/companies/${id}`);
export const listCompanies = () => API.get("/companies");
