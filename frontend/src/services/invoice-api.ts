import { api } from "tina4js";

// Represents one item on an invoice.
export interface InvoiceItem {
	id: number;
	product_id: number;
	product_name: string;
	price: number;
	quantity: number;
}

// Represents a complete invoice.
export interface Invoice {
	id: number;
	user_id: number;
	cart_id: number;
	total: number;
	status: string;
	items: InvoiceItem[];
}

/* 
	Retrieve a specific invoice. 
	
	invoiceId identifies the invoice that should 
	be retrieved from the backend.
*/
export async function getInvoice(invoiceId: number): Promise<Invoice> {
	// Request the invoice using its ID.
	return (await api.get(`/invoices/${invoiceId}`)) as Invoice;
}
