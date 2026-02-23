import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

export const createResourceApi = <T, CreateDTO = Partial<T>>(
  resource: string,
) => ({
  getAll: async (): Promise<T[]> => {
    const { data } = await apiClient.get(`/${resource}`);
    return data;
  },
  getOne: async (id: string | number): Promise<T> => {
    const { data } = await apiClient.get(`/${resource}/${id}`);
    return data;
  },
  create: async (payload: CreateDTO): Promise<T> => {
    const { data } = await apiClient.post(`/${resource}`, payload);
    return data;
  },
  update: async (id: string | number, payload: Partial<T>): Promise<T> => {
    const { data } = await apiClient.patch(`/${resource}/${id}`, payload);
    return data;
  },
  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/${resource}/${id}`);
  },
});

// Optional: Add interceptors for tokens
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });
