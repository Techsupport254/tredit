export interface Business {
	id: string;
	name: string;
	logo?: string | null;
	description?: string | null;
	createdAt: Date | string;
	updatedAt: Date | string;
	status: string;
	type: string;
	category: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	country: string;
	postalCode: string;
	currency: string;
	timezone: string;
	businessModel: string;
	operationMode: string;
	paymentMethods: string[];
	businessHours: string[];
}

export interface TeamMember {
	id: string;
	userId: string;
	role: string;
	createdAt: Date | string;
	updatedAt: Date | string;
	isOnline?: boolean;
	user: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
}

export interface ChatSession {
	id: string;
	userId: string;
	userName: string;
	userEmail: string;
	lastMessageAt: Date | string;
	lastMessage: string | null;
	lastMessageUser: {
		id: string;
		name: string;
		email: string;
	} | null;
	status: string;
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface Message {
	id: string;
	content: string;
	userId: string;
	userName: string;
	userEmail: string;
	createdAt: Date | string;
	updatedAt: Date | string;
}
