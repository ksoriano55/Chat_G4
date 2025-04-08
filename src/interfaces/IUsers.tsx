export interface IUsers {
    id: number,
    usuario: string,
    nombre: string,
    password: string,
    confirmarPassword?: string,
}

export interface ICredentials {
    usuario: string,
    password: string
}