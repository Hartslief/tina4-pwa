import { api } from "tina4js";

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    in_stock: boolean;
}

interface ProductsResponse {
    records: Product[];
}

export async function getProducts(): Promise<Product[]> {
    const response = (await api.get("/products")) as ProductsResponse;

    return response.records;
}
