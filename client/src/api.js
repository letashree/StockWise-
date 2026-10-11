import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5001/api" });

export async function getItems(params = {}) {
  const { data } = await api.get("/items", { params });
  return data.items;
}
export async function createItem(item) {
  const { data } = await api.post("/items", item);
  return data.item;
}
export async function updateItem(id, item) {
  const { data } = await api.put(`/items/${id}`, item);
  return data.item;
}
export async function deleteItem(id) {
  const { data } = await api.delete(`/items/${id}`);
  return data;
}
