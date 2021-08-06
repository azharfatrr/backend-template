// jwtPayload is the interface for payload in a JWT.
export interface jwtPayload {
  // The data to be encoded in the JWT.
  data: {
    user_id: number;
  };
  // The time at which the JWT was issued.
  iat: number;
  // The time at which the JWT expires.
  exp: number;
}
