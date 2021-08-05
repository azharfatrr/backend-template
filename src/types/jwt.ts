// jwtPayload is the interface for payload in a JWT.
export interface jwtPayload {
  data: {
    user_id: number;
  };
  iat: number;
  exp: number;
}
