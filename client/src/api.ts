import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1/users/OAuth2/google',
});
export const googleAuth = (code:string) => api.post(`?code=${code}`);