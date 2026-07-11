type Tokens = {
  accessToken: string;
  refreshToken: string;
};

const accessTokenKey = "accessToken";
const refreshTokenKey = "refreshToken";

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(accessTokenKey);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(refreshTokenKey);
}

export function storeTokens(tokens: Tokens): void {
  localStorage.setItem(accessTokenKey, tokens.accessToken);
  localStorage.setItem(refreshTokenKey, tokens.refreshToken);
}

export function storeAccessToken(accessToken: string): void {
  localStorage.setItem(accessTokenKey, accessToken);
}

export function clearStoredTokens(): void {
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
}
