import axios from "axios";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_FOREWARE_API_URL!,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const createResourceApi = <T, CreateDTO = Partial<T>>(
  resource: string,
) => ({
  getAll: async (): Promise<ApiResponse<T[]>> => {
    const response = await apiClient.get<ApiResponse<T[]>>(`/${resource}`);
    return response.data;
  },

  getOne: async (id: string | number): Promise<T> => {
    const response = await apiClient.get<ApiResponse<T>>(`/${resource}/${id}`);
    return response.data.data;
  },

  create: async (
    payload: CreateDTO,
    config?: { path?: string },
  ): Promise<T> => {
    const response = await apiClient.post<ApiResponse<T>>(
      `/${resource}/${config?.path ? config?.path : ""}`,
      payload,
    );

    return response.data.data;
  },

  update: async (
    id: string | number,
    payload: Partial<T>,
    config?: { path?: string },
  ): Promise<T> => {
    const response = await apiClient.patch<ApiResponse<T>>(
      `/${resource}/${id}/${config?.path ? config?.path : ""}`,
      payload,
    );
    return response.data.data;
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
