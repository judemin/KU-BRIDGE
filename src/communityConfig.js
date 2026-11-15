export const COUNTRY_CODES =
  `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(
    " ",
  );
export const USER_ID_PATTERN = /^[a-z][a-z0-9_]{2,19}$/;
export const RESERVED_IDS = [
  "admin",
  "administrator",
  "moderator",
  "support",
  "system",
  "konkuk",
  "kubridge",
  "ku_bridge",
  "official",
  "deleted",
];
export function normalizeUserId(value = "") {
  return String(value).trim().toLowerCase();
}
export function validUserId(value) {
  return USER_ID_PATTERN.test(value) && !RESERVED_IDS.includes(value);
}
export function identityReady(profile) {
  return (
    !!profile &&
    validUserId(profile.userId) &&
    COUNTRY_CODES.includes(profile.nationality)
  );
}
const regionNames = new Map();
export function countryName(code, locale = "en") {
  try {
    if (!regionNames.has(locale))
      regionNames.set(
        locale,
        new Intl.DisplayNames([locale], { type: "region" }),
      );
    return regionNames.get(locale).of(code) || code;
  } catch {
    return code;
  }
}
export const ROOM_IDS = [
  "global",
  "anglophone",
  "country-cn",
  "country-jp",
  "country-kr",
];
export function roomForCountry(code) {
  return ["CN", "JP", "KR"].includes(code)
    ? `country-${code.toLowerCase()}`
    : ["US", "GB", "CA", "AU", "NZ", "IE"].includes(code)
      ? "anglophone"
      : "global";
}
export function validRoom(room) {
  return ROOM_IDS.includes(room);
}
export function contentKey(room, kind, parent, id) {
  return [room, kind, parent || "root", id].join("~");
}
export const COMMUNITY_LIMITS = Object.freeze({
  post: 60,
  comment: 3,
  message: 2,
  report: 30,
});
