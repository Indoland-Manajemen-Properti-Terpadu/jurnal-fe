export interface LoginModelResponse {
    user: User;
    tokens: Tokens;
}

export interface Tokens {
    access: Access;
    refresh: Access;
}

export interface Access {
    token: string;
    expires: Date;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    accessRole: any[];
    isEmailVerified: boolean;
    site: Site;
    createdAt: Date;
    updatedAt: Date;
}

export interface Site {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
