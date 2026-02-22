export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number; // Fecha de creación (lo agrega JWT automáticamente)
  exp?: number; // Fecha de expiración (lo agrega JWT automáticamente)
}
