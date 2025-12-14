export interface CountryInfo {
  code: string;
  name: string;
  region: 'Americas' | 'Europe' | 'Asia' | 'Africa' | 'Oceania';
  flag: string;
}

const countryMap: Record<string, CountryInfo> = {
  AD: { code: 'AD', name: 'Andorra', region: 'Europe', flag: '🇦🇩' },
  AF: { code: 'AF', name: 'Afghanistan', region: 'Asia', flag: '🇦🇫' },
  AL: { code: 'AL', name: 'Albania', region: 'Europe', flag: '🇦🇱' },
  DZ: { code: 'DZ', name: 'Algeria', region: 'Africa', flag: '🇩🇿' },
  AO: { code: 'AO', name: 'Angola', region: 'Africa', flag: '🇦🇴' },
  AR: { code: 'AR', name: 'Argentina', region: 'Americas', flag: '🇦🇷' },
  AM: { code: 'AM', name: 'Armenia', region: 'Asia', flag: '🇦🇲' },
  AU: { code: 'AU', name: 'Australia', region: 'Oceania', flag: '🇦🇺' },
  AT: { code: 'AT', name: 'Austria', region: 'Europe', flag: '🇦🇹' },
  AZ: { code: 'AZ', name: 'Azerbaijan', region: 'Asia', flag: '🇦🇿' },
  BS: { code: 'BS', name: 'Bahamas', region: 'Americas', flag: '🇧🇸' },
  BH: { code: 'BH', name: 'Bahrain', region: 'Asia', flag: '🇧🇭' },
  BD: { code: 'BD', name: 'Bangladesh', region: 'Asia', flag: '🇧🇩' },
  BB: { code: 'BB', name: 'Barbados', region: 'Americas', flag: '🇧🇧' },
  BY: { code: 'BY', name: 'Belarus', region: 'Europe', flag: '🇧🇾' },
  BE: { code: 'BE', name: 'Belgium', region: 'Europe', flag: '🇧🇪' },
  BZ: { code: 'BZ', name: 'Belize', region: 'Americas', flag: '🇧🇿' },
  BO: { code: 'BO', name: 'Bolivia', region: 'Americas', flag: '🇧🇴' },
  BA: { code: 'BA', name: 'Bosnia and Herzegovina', region: 'Europe', flag: '🇧🇦' },
  BW: { code: 'BW', name: 'Botswana', region: 'Africa', flag: '🇧🇼' },
  BR: { code: 'BR', name: 'Brazil', region: 'Americas', flag: '🇧🇷' },
  BN: { code: 'BN', name: 'Brunei', region: 'Asia', flag: '🇧🇳' },
  BG: { code: 'BG', name: 'Bulgaria', region: 'Europe', flag: '🇧🇬' },
  KH: { code: 'KH', name: 'Cambodia', region: 'Asia', flag: '🇰🇭' },
  CM: { code: 'CM', name: 'Cameroon', region: 'Africa', flag: '🇨🇲' },
  CA: { code: 'CA', name: 'Canada', region: 'Americas', flag: '🇨🇦' },
  CL: { code: 'CL', name: 'Chile', region: 'Americas', flag: '🇨🇱' },
  CN: { code: 'CN', name: 'China', region: 'Asia', flag: '🇨🇳' },
  CO: { code: 'CO', name: 'Colombia', region: 'Americas', flag: '🇨🇴' },
  CR: { code: 'CR', name: 'Costa Rica', region: 'Americas', flag: '🇨🇷' },
  HR: { code: 'HR', name: 'Croatia', region: 'Europe', flag: '🇭🇷' },
  CU: { code: 'CU', name: 'Cuba', region: 'Americas', flag: '🇨🇺' },
  CY: { code: 'CY', name: 'Cyprus', region: 'Europe', flag: '🇨🇾' },
  CZ: { code: 'CZ', name: 'Czech Republic', region: 'Europe', flag: '🇨🇿' },
  DK: { code: 'DK', name: 'Denmark', region: 'Europe', flag: '🇩🇰' },
  DO: { code: 'DO', name: 'Dominican Republic', region: 'Americas', flag: '🇩🇴' },
  EC: { code: 'EC', name: 'Ecuador', region: 'Americas', flag: '🇪🇨' },
  EG: { code: 'EG', name: 'Egypt', region: 'Africa', flag: '🇪🇬' },
  SV: { code: 'SV', name: 'El Salvador', region: 'Americas', flag: '🇸🇻' },
  EE: { code: 'EE', name: 'Estonia', region: 'Europe', flag: '🇪🇪' },
  ET: { code: 'ET', name: 'Ethiopia', region: 'Africa', flag: '🇪🇹' },
  FJ: { code: 'FJ', name: 'Fiji', region: 'Oceania', flag: '🇫🇯' },
  FI: { code: 'FI', name: 'Finland', region: 'Europe', flag: '🇫🇮' },
  FR: { code: 'FR', name: 'France', region: 'Europe', flag: '🇫🇷' },
  GE: { code: 'GE', name: 'Georgia', region: 'Asia', flag: '🇬🇪' },
  DE: { code: 'DE', name: 'Germany', region: 'Europe', flag: '🇩🇪' },
  GH: { code: 'GH', name: 'Ghana', region: 'Africa', flag: '🇬🇭' },
  GR: { code: 'GR', name: 'Greece', region: 'Europe', flag: '🇬🇷' },
  GT: { code: 'GT', name: 'Guatemala', region: 'Americas', flag: '🇬🇹' },
  HN: { code: 'HN', name: 'Honduras', region: 'Americas', flag: '🇭🇳' },
  HK: { code: 'HK', name: 'Hong Kong', region: 'Asia', flag: '🇭🇰' },
  HU: { code: 'HU', name: 'Hungary', region: 'Europe', flag: '🇭🇺' },
  IS: { code: 'IS', name: 'Iceland', region: 'Europe', flag: '🇮🇸' },
  IN: { code: 'IN', name: 'India', region: 'Asia', flag: '🇮🇳' },
  ID: { code: 'ID', name: 'Indonesia', region: 'Asia', flag: '🇮🇩' },
  IR: { code: 'IR', name: 'Iran', region: 'Asia', flag: '🇮🇷' },
  IQ: { code: 'IQ', name: 'Iraq', region: 'Asia', flag: '🇮🇶' },
  IE: { code: 'IE', name: 'Ireland', region: 'Europe', flag: '🇮🇪' },
  IL: { code: 'IL', name: 'Israel', region: 'Asia', flag: '🇮🇱' },
  IT: { code: 'IT', name: 'Italy', region: 'Europe', flag: '🇮🇹' },
  JM: { code: 'JM', name: 'Jamaica', region: 'Americas', flag: '🇯🇲' },
  JP: { code: 'JP', name: 'Japan', region: 'Asia', flag: '🇯🇵' },
  JO: { code: 'JO', name: 'Jordan', region: 'Asia', flag: '🇯🇴' },
  KZ: { code: 'KZ', name: 'Kazakhstan', region: 'Asia', flag: '🇰🇿' },
  KE: { code: 'KE', name: 'Kenya', region: 'Africa', flag: '🇰🇪' },
  KR: { code: 'KR', name: 'South Korea', region: 'Asia', flag: '🇰🇷' },
  KW: { code: 'KW', name: 'Kuwait', region: 'Asia', flag: '🇰🇼' },
  KG: { code: 'KG', name: 'Kyrgyzstan', region: 'Asia', flag: '🇰🇬' },
  LA: { code: 'LA', name: 'Laos', region: 'Asia', flag: '🇱🇦' },
  LV: { code: 'LV', name: 'Latvia', region: 'Europe', flag: '🇱🇻' },
  LB: { code: 'LB', name: 'Lebanon', region: 'Asia', flag: '🇱🇧' },
  LT: { code: 'LT', name: 'Lithuania', region: 'Europe', flag: '🇱🇹' },
  LU: { code: 'LU', name: 'Luxembourg', region: 'Europe', flag: '🇱🇺' },
  MO: { code: 'MO', name: 'Macao', region: 'Asia', flag: '🇲🇴' },
  MK: { code: 'MK', name: 'North Macedonia', region: 'Europe', flag: '🇲🇰' },
  MY: { code: 'MY', name: 'Malaysia', region: 'Asia', flag: '🇲🇾' },
  MV: { code: 'MV', name: 'Maldives', region: 'Asia', flag: '🇲🇻' },
  MT: { code: 'MT', name: 'Malta', region: 'Europe', flag: '🇲🇹' },
  MX: { code: 'MX', name: 'Mexico', region: 'Americas', flag: '🇲🇽' },
  MD: { code: 'MD', name: 'Moldova', region: 'Europe', flag: '🇲🇩' },
  MC: { code: 'MC', name: 'Monaco', region: 'Europe', flag: '🇲🇨' },
  MN: { code: 'MN', name: 'Mongolia', region: 'Asia', flag: '🇲🇳' },
  ME: { code: 'ME', name: 'Montenegro', region: 'Europe', flag: '🇲🇪' },
  MA: { code: 'MA', name: 'Morocco', region: 'Africa', flag: '🇲🇦' },
  MZ: { code: 'MZ', name: 'Mozambique', region: 'Africa', flag: '🇲🇿' },
  MM: { code: 'MM', name: 'Myanmar', region: 'Asia', flag: '🇲🇲' },
  NA: { code: 'NA', name: 'Namibia', region: 'Africa', flag: '🇳🇦' },
  NP: { code: 'NP', name: 'Nepal', region: 'Asia', flag: '🇳🇵' },
  NL: { code: 'NL', name: 'Netherlands', region: 'Europe', flag: '🇳🇱' },
  NZ: { code: 'NZ', name: 'New Zealand', region: 'Oceania', flag: '🇳🇿' },
  NI: { code: 'NI', name: 'Nicaragua', region: 'Americas', flag: '🇳🇮' },
  NG: { code: 'NG', name: 'Nigeria', region: 'Africa', flag: '🇳🇬' },
  NO: { code: 'NO', name: 'Norway', region: 'Europe', flag: '🇳🇴' },
  OM: { code: 'OM', name: 'Oman', region: 'Asia', flag: '🇴🇲' },
  PK: { code: 'PK', name: 'Pakistan', region: 'Asia', flag: '🇵🇰' },
  PA: { code: 'PA', name: 'Panama', region: 'Americas', flag: '🇵🇦' },
  PY: { code: 'PY', name: 'Paraguay', region: 'Americas', flag: '🇵🇾' },
  PE: { code: 'PE', name: 'Peru', region: 'Americas', flag: '🇵🇪' },
  PH: { code: 'PH', name: 'Philippines', region: 'Asia', flag: '🇵🇭' },
  PL: { code: 'PL', name: 'Poland', region: 'Europe', flag: '🇵🇱' },
  PT: { code: 'PT', name: 'Portugal', region: 'Europe', flag: '🇵🇹' },
  PR: { code: 'PR', name: 'Puerto Rico', region: 'Americas', flag: '🇵🇷' },
  QA: { code: 'QA', name: 'Qatar', region: 'Asia', flag: '🇶🇦' },
  RO: { code: 'RO', name: 'Romania', region: 'Europe', flag: '🇷🇴' },
  RU: { code: 'RU', name: 'Russia', region: 'Europe', flag: '🇷🇺' },
  RW: { code: 'RW', name: 'Rwanda', region: 'Africa', flag: '🇷🇼' },
  SA: { code: 'SA', name: 'Saudi Arabia', region: 'Asia', flag: '🇸🇦' },
  SN: { code: 'SN', name: 'Senegal', region: 'Africa', flag: '🇸🇳' },
  RS: { code: 'RS', name: 'Serbia', region: 'Europe', flag: '🇷🇸' },
  SG: { code: 'SG', name: 'Singapore', region: 'Asia', flag: '🇸🇬' },
  SK: { code: 'SK', name: 'Slovakia', region: 'Europe', flag: '🇸🇰' },
  SI: { code: 'SI', name: 'Slovenia', region: 'Europe', flag: '🇸🇮' },
  ZA: { code: 'ZA', name: 'South Africa', region: 'Africa', flag: '🇿🇦' },
  ES: { code: 'ES', name: 'Spain', region: 'Europe', flag: '🇪🇸' },
  LK: { code: 'LK', name: 'Sri Lanka', region: 'Asia', flag: '🇱🇰' },
  SE: { code: 'SE', name: 'Sweden', region: 'Europe', flag: '🇸🇪' },
  CH: { code: 'CH', name: 'Switzerland', region: 'Europe', flag: '🇨🇭' },
  TW: { code: 'TW', name: 'Taiwan', region: 'Asia', flag: '🇹🇼' },
  TJ: { code: 'TJ', name: 'Tajikistan', region: 'Asia', flag: '🇹🇯' },
  TZ: { code: 'TZ', name: 'Tanzania', region: 'Africa', flag: '🇹🇿' },
  TH: { code: 'TH', name: 'Thailand', region: 'Asia', flag: '🇹🇭' },
  TN: { code: 'TN', name: 'Tunisia', region: 'Africa', flag: '🇹🇳' },
  TR: { code: 'TR', name: 'Turkey', region: 'Asia', flag: '🇹🇷' },
  TM: { code: 'TM', name: 'Turkmenistan', region: 'Asia', flag: '🇹🇲' },
  UG: { code: 'UG', name: 'Uganda', region: 'Africa', flag: '🇺🇬' },
  UA: { code: 'UA', name: 'Ukraine', region: 'Europe', flag: '🇺🇦' },
  AE: { code: 'AE', name: 'United Arab Emirates', region: 'Asia', flag: '🇦🇪' },
  GB: { code: 'GB', name: 'United Kingdom', region: 'Europe', flag: '🇬🇧' },
  US: { code: 'US', name: 'United States', region: 'Americas', flag: '🇺🇸' },
  UY: { code: 'UY', name: 'Uruguay', region: 'Americas', flag: '🇺🇾' },
  UZ: { code: 'UZ', name: 'Uzbekistan', region: 'Asia', flag: '🇺🇿' },
  VE: { code: 'VE', name: 'Venezuela', region: 'Americas', flag: '🇻🇪' },
  VN: { code: 'VN', name: 'Vietnam', region: 'Asia', flag: '🇻🇳' },
  ZM: { code: 'ZM', name: 'Zambia', region: 'Africa', flag: '🇿🇲' },
  ZW: { code: 'ZW', name: 'Zimbabwe', region: 'Africa', flag: '🇿🇼' },
};

export function getCountryInfo(countryCode: string): CountryInfo | null {
  const code = countryCode.toUpperCase();
  return countryMap[code] || null;
}

export function getCountryName(countryCode: string): string {
  const info = getCountryInfo(countryCode);
  return info?.name || countryCode;
}

export function getCountryFlag(countryCode: string): string {
  const info = getCountryInfo(countryCode);
  return info?.flag || '🌍';
}

export function getCountryRegion(countryCode: string): string {
  const info = getCountryInfo(countryCode);
  return info?.region || 'Unknown';
}

export function parseLocationCode(locationCode: string): string[] {
  if (!locationCode) return [];

  if (locationCode.toLowerCase() === 'global') {
    return [];
  }

  if (locationCode.includes(',')) {
    return locationCode.split(',').map(c => c.trim().toUpperCase());
  }

  return [locationCode.toUpperCase()];
}

export function getAllCountries(): CountryInfo[] {
  return Object.values(countryMap);
}
