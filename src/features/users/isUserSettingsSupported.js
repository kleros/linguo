const apiBaseUrls = JSON.parse(process.env.USER_SETTINGS_API_BASE_URLS);

export default function isUserSettingsSupported({ chainId }) {
  return Boolean(apiBaseUrls[chainId]);
}
