export enum ENV {
	production = 'production',
	development = 'development',
	test = 'test'
}

export enum HOST {
	productionServer = 'productionServer',
	developmentServer = 'developmentServer',
	testServer = 'testServer'
}

export enum LANGUAGE {
	sk = 'sk-SK',
	en = 'en-US',
	cz = 'cz-CZ',
	pl = 'pl-PL',
	de = 'de-DE',
	it = 'it-IT'
}

export enum DAY {
	MONDAY = 'MONDAY',
	TUESDAY = 'TUESDAY',
	WEDNESDAY = 'WEDNESDAY',
	THURSDAY = 'THURSDAY',
	FRIDAY = 'FRIDAY',
	SATURDAY = 'SATURDAY',
	SUNDAY = 'SUNDAY'
}

export enum DANGER {
	NONE = 'NONE',
	LOW = 'LOW',
	MODERATE = 'MODERATE',
	INCREASED = 'INCREASED',
	HIGH = 'HIGH',
	VERY_HIGH = 'VERY_HIGH'
}

export enum MESSAGE_TYPE {
	ERROR = 'ERROR',
	WARNING = 'WARNING',
	SUCCESS = 'SUCCESS',
	INFO = 'INFO'
}

export enum USER_STATE {
	ACTIVE = 'ACTIVE',
	DELETED = 'DELETED'
}

export enum OCCUPANCY {
	LOW = 'LOW',
	MEDIUM = 'MEDIUM',
	HIGH = 'HIGH'
}

export enum JWT_AUDIENCE {
	API = 'jwt-api',
	FORGOTTEN_PASSWORD = 'jwt-forgotten-password',
	INVITATION = 'jwt-invitation'
}

export enum STATUS {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED',
	LIMITED = 'LIMITED'
}

export enum DEPARTURE_TIME_TYPE {
	PUBLIC = 'PUBLIC',
	SERVIS = 'SERVIS'
}

export enum PERMISSION {
	SUPER_ADMIN = 'SUPER_ADMIN',
	ADMIN = 'ADMIN',
	USER = 'USER',
	USER_CREATE = 'USER_CREATE',
	USER_EDIT = 'USER_EDIT',
	USER_DELETE = 'USER_DELETE',
	USER_LIST = 'USER_LIST',
	RESORT_READ = 'RESORT_READ',
	RESORT_WRITE = 'RESORT_WRITE',
	SKILIFT_READ = 'SKILIFT_READ',
	SKILIFT_WRITE = 'SKILIFT_WRITE',
	SLOPE_READ = 'SLOPE_READ',
	SLOPE_WRITE = 'SLOPE_WRITE',
	BIKE_READ = 'BIKE_READ',
	BIKE_WRITE = 'BIKE_WRITE',
	CROSS_COUNTRY_READ = 'CROSS_COUNTRY_READ',
	CROSS_COUNTRY_WRITE = 'CROSS_COUNTRY_WRITE',
	THEME_PARK_READ = 'THEME_PARK_READ',
	THEME_PARK_WRITE = 'THEME_PARK_WRITE',
	AQUAPARK_POOL_READ = 'AQUAPARK_POOL_READ',
	AQUAPARK_POOL_WRITE = 'AQUAPARK_POOL_WRITE',
	AQUAPARK_ATTRACTION_READ = 'AQUAPARK_ATTRACTION_READ',
	AQUAPARK_ATTRACTION_WRITE = 'AQUAPARK_ATTRACTION_WRITE',
	SERVICE_READ = 'SERVICE_READ',
	SERVICE_WRITE = 'SERVICE_WRITE',
	ACCOMMODATION_READ = 'ACCOMMODATION_READ',
	ACCOMMODATION_WRITE = 'ACCOMMODATION_WRITE',
	RESTAURANT_READ = 'RESTAURANT_READ',
	RESTAURANT_WRITE = 'RESTAURANT_WRITE',
	EVENT_READ = 'EVENT_READ',
	EVENT_WRITE = 'EVENT_WRITE',
	CAMERA_READ = 'CAMERA_READ',
	CAMERA_WRITE = 'CAMERA_WRITE',
	DEPARTURE_READ = 'DEPARTURE_READ',
	DEPARTURE_WRITE = 'DEPARTURE_WRITE',
	INFO_READ = 'INFO_READ',
	INFO_WRITE = 'INFO_WRITE',
	WEATHER_READ = 'WEATHER_READ',
	WEATHER_WRITE = 'WEATHER_WRITE',
	PARKING_READ = 'PARKING_READ',
	PARKING_WRITE = 'PARKING_WRITE',
	ACCESSORY_WRITE = 'ACCESSORY_WRITE',
    LOCATION_WRITE = 'LOCATION_WRITE',
    LOCATION_READ = 'LOCATION_READ'
}

export enum PERMISSION_GROUP {
	SUPER_ADMIN = 'SUPER_ADMIN',
	ADMIN = 'ADMIN',
	USERS = 'USERS',
	RESORTS = 'RESORTS',
	SKILIFTS = 'SKILIFTS',
	SLOPES = 'SLOPES',
	BIKES = 'BIKES',
	CROSS_COUNTRIES = 'CROSS_COUNTRIES',
	THEME_PARKS = 'THEME_PARKS',
	AQUAPARK_POOLS = 'AQUAPARK_POOLS',
	AQUAPARK_ATTRACTIONS = 'AQUAPARK_ATTRACTIONS',
	SERVICES = 'SERVICES',
	ACCOMMODATIONS = 'ACCOMMODATIONS',
	RESTAURANTS = 'RESTAURANTS',
	EVENTS = 'EVENTS',
	CAMERAS = 'CAMERAS',
	DEPARTURES = 'DEPARTURES',
	WEATHER = 'WEATHER',
    PARKING = 'PARKING',
	INFO = 'INFO',
	ACCESSORY = 'ACCESSORY',
    LOCATION = 'LOCATION'
}

export enum SQL_OPERATION {
	INSERT = 'INSERT',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
	RESTORE = 'RESTORE'
}

export enum FILE_DATA_TYPE {
	PDF = 'PDF',
	IMAGE = 'IMAGE',
	DOC = 'DOC',
	EXCEL = 'EXCEL',
	ZIP = 'ZIP',
	RAR = 'RAR',
	OTHER = 'OTHER'
}

export enum ATTRACTION_TYPE {
	RESTAURANTS = 'RESTAURANTS',
	ACCOMMODATIONS = 'ACCOMMODATIONS',
	SKILIFTS = 'SKILIFTS',
	SLOPES = 'SLOPES',
	AQUAPARKS_POOLS = 'AQUAPARKS_POOLS',
	AQUAPARKS_ATTRACTIONS = 'AQUAPARKS_ATTRACTIONS',
	BIKES = 'BIKES',
	THEME_PARKS = 'THEME_PARKS',
	SERVICES = 'SERVICES',
	CROSS_COUNTRIES = 'CROSS_COUNTRIES'
}

export enum WATER_TYPE {
	CLEAR_WATER = 'CLEAR_WATER',
	SEA_WATER = 'SEA_WATER',
	THERMAL_WATER = 'THERMAL_WATER'
}

export enum SNOW_TYPE {
	NATURE = 'NATURE',
	ARTIFICIAL = 'ARTIFICIAL'
}

export enum RESORT_TYPE {
	GOLF = 'GOLF',
	SKI = 'SKI',
	MOUNTAIN = 'MOUNTAIN',
	SPA = 'SPA',
	WATER_PARK = 'WATER_PARK',
	THEME_PARK = 'THEME_PARK'
}

export enum CURRENCY_CODE {
	PLN = 'PLN',
	CZK = 'CZK',
	EUR = 'EUR',
	USD = 'USD',
	GBP = 'GBP'
}

export enum SKILIFT_TYPE {
	TWINLINER = 'TWINLINER',
	GONDOLA = 'GONDOLA',
	CHAIR = 'CHAIR',
	SKI = 'SKI',
	BELT = 'BELT',
	CABLE = 'CABLE',
	OVERLAND = 'OVERLAND'
}

export enum DIFFICULTY {
	EASY = 'EASY',
	MEDIUM = 'MEDIUM',
	HARD = 'HARD'
}

export enum CROSS_COUNTRY_DIFFICULTY {
	RED = 'RED',
	BLACK = 'BLACK',
	BLUE = 'BLUE'
}

export enum SURFACE_TYPE {
	MIX = 'MIX',
	CLASSIC = 'CLASSIC',
	SKATE = 'SKATE',
	NOT_SPECIFIED = 'NOT_SPECIFIED'
}

export enum SNOW_CONDITION {
	GOOD = 'GOOD',
	VERY_GOOD = 'VERY_GOOD',
	LIMITED = 'LIMITED',
	UNSUITABLE = 'UNSUITABLE'
}

export enum SLOPE_TYPE {
	CYCLE_TRACK = 'CYCLE_TRACE',
	FREERIDE = 'FREERIDE',
	SKIALP = 'SKIALP',
	TRAVERZ = 'TRAVERZ',
	SLOPE = 'SLOPE'
}

export enum PLACEMENT {
	OUTDOOR = 'OUTDOOR',
	INDOOR = 'INDOOR'
}

export enum SERVICE_TYPE {
	FUN_ZONE = 'FUN_ZONE',
	INFO_CENTER = 'INFO_CENTER',
	RENTAL = 'RENTAL'
}

export enum INFO_TYPE {
	TV = 'TV',
	WEB = 'WEB',
	LED = 'LED',
	MOBILE = 'MOBILE',
	DEVICE = 'DEVICE'
}

export enum INFO_MESSAGE_STATUS {
	ACTIVE = 'ACTIVE',
	WAITING = 'WAITING',
	EXPIRED = 'EXPIRED'
}

export enum EVENT_CATEGORY {
    CONCERT = 'CONCERT',
    SPORT = 'SPORT',
    GASTRO = 'GASTRO',
    WELLNESS = 'WELLNESS'
}

export enum WEATHER_TYPE {
	CLEAR = 'CLEAR',
	THUNDERSTORM_LIGHT = 'THUNDERSTORM_LIGHT',
	THUNDERSTORM_MODERATE = 'THUNDERSTORM_MODERATE',
	THUNDERSTORM_INTENSIVE = 'THUNDERSTORM_INTENSIVE',
	DRIZZLE = 'DRIZZLE',
	RAIN_MODERATE = 'RAIN_LIGHT',
	RAIN_INTENSIVE = 'RAIN_INTENSIVE',
	RAIN_FREEZING = 'RAIN_FREEZING',
	RAIN_SHOWER = 'RAIN_SHOWER',
	SNOW_LIGHT = 'SNOW_LIGHT',
	SNOW_WITH_RAIN = 'SNOW_WITH_RAIN',
	SNOW_MODERATE = 'SNOW_MODERATE',
	SNOW_HEAVY = 'SNOW_HEAVY',
	MIST = 'MIST',
	TORNADO = 'TORNADO',
	SAND = 'SAND',
	CLOUDS_FEW = 'CLOUDS_FEW',
	CLOUDS_MODERATE = 'CLOUDS_MODERATE',
	CLOUDS_HEAVY = 'CLOUDS_HEAVY',
	UNKNOWN = 'UNKNOWN'
}

export const timezones = [
	'Africa/Abidjan',
	'Africa/Accra',
	'Africa/Addis_Ababa',
	'Africa/Algiers',
	'Africa/Asmara',
	'Africa/Asmera',
	'Africa/Bamako',
	'Africa/Bangui',
	'Africa/Banjul',
	'Africa/Bissau',
	'Africa/Blantyre',
	'Africa/Brazzaville',
	'Africa/Bujumbura',
	'Africa/Cairo',
	'Africa/Casablanca',
	'Africa/Ceuta',
	'Africa/Conakry',
	'Africa/Dakar',
	'Africa/Dar_es_Salaam',
	'Africa/Djibouti',
	'Africa/Douala',
	'Africa/El_Aaiun',
	'Africa/Freetown',
	'Africa/Gaborone',
	'Africa/Harare',
	'Africa/Johannesburg',
	'Africa/Juba',
	'Africa/Kampala',
	'Africa/Khartoum',
	'Africa/Kigali',
	'Africa/Kinshasa',
	'Africa/Lagos',
	'Africa/Libreville',
	'Africa/Lome',
	'Africa/Luanda',
	'Africa/Lubumbashi',
	'Africa/Lusaka',
	'Africa/Malabo',
	'Africa/Maputo',
	'Africa/Maseru',
	'Africa/Mbabane',
	'Africa/Mogadishu',
	'Africa/Monrovia',
	'Africa/Nairobi',
	'Africa/Ndjamena',
	'Africa/Niamey',
	'Africa/Nouakchott',
	'Africa/Ouagadougou',
	'Africa/Porto-Novo',
	'Africa/Sao_Tome',
	'Africa/Timbuktu',
	'Africa/Tripoli',
	'Africa/Tunis',
	'Africa/Windhoek',
	'America/Adak',
	'America/Anchorage',
	'America/Anguilla',
	'America/Antigua',
	'America/Araguaina',
	'America/Argentina/Buenos_Aires',
	'America/Argentina/Catamarca',
	'America/Argentina/Cordoba',
	'America/Argentina/Jujuy',
	'America/Argentina/La_Rioja',
	'America/Argentina/Mendoza',
	'America/Argentina/Rio_Gallegos',
	'America/Argentina/Salta',
	'America/Argentina/San_Juan',
	'America/Argentina/San_Luis',
	'America/Argentina/Tucuman',
	'America/Argentina/Ushuaia',
	'America/Aruba',
	'America/Asuncion',
	'America/Atikokan',
	'America/Atka',
	'America/Bahia',
	'America/Bahia_Banderas',
	'America/Barbados',
	'America/Belem',
	'America/Belize',
	'America/Blanc-Sablon',
	'America/Boa_Vista',
	'America/Bogota',
	'America/Boise',
	'America/Buenos_Aires',
	'America/Cambridge_Bay',
	'America/Campo_Grande',
	'America/Cancun',
	'America/Caracas',
	'America/Catamarca',
	'America/Cayenne',
	'America/Cayman',
	'America/Chicago',
	'America/Chihuahua',
	'America/Coral_Harbour',
	'America/Cordoba',
	'America/Costa_Rica',
	'America/Creston',
	'America/Cuiaba',
	'America/Curacao',
	'America/Danmarkshavn',
	'America/Dawson',
	'America/Dawson_Creek',
	'America/Denver',
	'America/Detroit',
	'America/Dominica',
	'America/Edmonton',
	'America/Eirunepe',
	'America/El_Salvador',
	'America/Ensenada',
	'America/Fort_Nelson',
	'America/Fort_Wayne',
	'America/Fortaleza',
	'America/Glace_Bay',
	'America/Godthab',
	'America/Goose_Bay',
	'America/Grand_Turk',
	'America/Grenada',
	'America/Guadeloupe',
	'America/Guatemala',
	'America/Guayaquil',
	'America/Guyana',
	'America/Halifax',
	'America/Havana',
	'America/Hermosillo',
	'America/Indiana/Indianapolis',
	'America/Indiana/Knox',
	'America/Indiana/Marengo',
	'America/Indiana/Petersburg',
	'America/Indiana/Tell_City',
	'America/Indiana/Vevay',
	'America/Indiana/Vincennes',
	'America/Indiana/Winamac',
	'America/Indianapolis',
	'America/Inuvik',
	'America/Iqaluit',
	'America/Jamaica',
	'America/Jujuy',
	'America/Juneau',
	'America/Kentucky/Louisville',
	'America/Kentucky/Monticello',
	'America/Kralendijk',
	'America/La_Paz',
	'America/Lima',
	'America/Los_Angeles',
	'America/Louisville',
	'America/Lower_Princes',
	'America/Maceio',
	'America/Managua',
	'America/Manaus',
	'America/Marigot',
	'America/Martinique',
	'America/Matamoros',
	'America/Mazatlan',
	'America/Mendoza',
	'America/Menominee',
	'America/Merida',
	'America/Metlakatla',
	'America/Mexico_City',
	'America/Miquelon',
	'America/Moncton',
	'America/Monterrey',
	'America/Montevideo',
	'America/Montreal',
	'America/Montserrat',
	'America/Nassau',
	'America/New_York',
	'America/Nipigon',
	'America/Nome',
	'America/Noronha',
	'America/North_Dakota/Beulah',
	'America/North_Dakota/Center',
	'America/North_Dakota/New_Salem',
	'America/Ojinaga',
	'America/Panama',
	'America/Pangnirtung',
	'America/Paramaribo',
	'America/Phoenix',
	'America/Port-au-Prince',
	'America/Port_of_Spain',
	'America/Porto_Acre',
	'America/Porto_Velho',
	'America/Puerto_Rico',
	'America/Punta_Arenas',
	'America/Rainy_River',
	'America/Rankin_Inlet',
	'America/Recife',
	'America/Regina',
	'America/Resolute',
	'America/Rio_Branco',
	'America/Rosario',
	'America/Santa_Isabel',
	'America/Santarem',
	'America/Santiago',
	'America/Santo_Domingo',
	'America/Sao_Paulo',
	'America/Scoresbysund',
	'America/Shiprock',
	'America/Sitka',
	'America/St_Barthelemy',
	'America/St_Johns',
	'America/St_Kitts',
	'America/St_Lucia',
	'America/St_Thomas',
	'America/St_Vincent',
	'America/Swift_Current',
	'America/Tegucigalpa',
	'America/Thule',
	'America/Thunder_Bay',
	'America/Tijuana',
	'America/Toronto',
	'America/Tortola',
	'America/Vancouver',
	'America/Virgin',
	'America/Whitehorse',
	'America/Winnipeg',
	'America/Yakutat',
	'America/Yellowknife',
	'Antarctica/Casey',
	'Antarctica/Davis',
	'Antarctica/DumontDUrville',
	'Antarctica/Macquarie',
	'Antarctica/Mawson',
	'Antarctica/Palmer',
	'Antarctica/Rothera',
	'Antarctica/South_Pole',
	'Antarctica/Syowa',
	'Antarctica/Troll',
	'Antarctica/Vostok',
	'Arctic/Longyearbyen',
	'Asia/Aden',
	'Asia/Almaty',
	'Asia/Amman',
	'Asia/Anadyr',
	'Asia/Aqtau',
	'Asia/Aqtobe',
	'Asia/Ashgabat',
	'Asia/Ashkhabad',
	'Asia/Atyrau',
	'Asia/Baghdad',
	'Asia/Bahrain',
	'Asia/Baku',
	'Asia/Bangkok',
	'Asia/Barnaul',
	'Asia/Beirut',
	'Asia/Bishkek',
	'Asia/Brunei',
	'Asia/Calcutta',
	'Asia/Chita',
	'Asia/Choibalsan',
	'Asia/Chongqing',
	'Asia/Chungking',
	'Asia/Colombo',
	'Asia/Dacca',
	'Asia/Damascus',
	'Asia/Dhaka',
	'Asia/Dili',
	'Asia/Dubai',
	'Asia/Dushanbe',
	'Asia/Famagusta',
	'Asia/Gaza',
	'Asia/Harbin',
	'Asia/Hebron',
	'Asia/Ho_Chi_Minh',
	'Asia/Hong_Kong',
	'Asia/Hovd',
	'Asia/Irkutsk',
	'Asia/Istanbul',
	'Asia/Jakarta',
	'Asia/Jayapura',
	'Asia/Jerusalem',
	'Asia/Kabul',
	'Asia/Kamchatka',
	'Asia/Karachi',
	'Asia/Kashgar',
	'Asia/Kathmandu',
	'Asia/Katmandu',
	'Asia/Khandyga',
	'Asia/Kolkata',
	'Asia/Krasnoyarsk',
	'Asia/Kuala_Lumpur',
	'Asia/Kuching',
	'Asia/Kuwait',
	'Asia/Macao',
	'Asia/Macau',
	'Asia/Magadan',
	'Asia/Makassar',
	'Asia/Manila',
	'Asia/Muscat',
	'Asia/Nicosia',
	'Asia/Novokuznetsk',
	'Asia/Novosibirsk',
	'Asia/Omsk',
	'Asia/Oral',
	'Asia/Phnom_Penh',
	'Asia/Pontianak',
	'Asia/Pyongyang',
	'Asia/Qatar',
	'Asia/Qyzylorda',
	'Asia/Rangoon',
	'Asia/Riyadh',
	'Asia/Saigon',
	'Asia/Sakhalin',
	'Asia/Samarkand',
	'Asia/Seoul',
	'Asia/Shanghai',
	'Asia/Singapore',
	'Asia/Srednekolymsk',
	'Asia/Taipei',
	'Asia/Tashkent',
	'Asia/Tbilisi',
	'Asia/Tehran',
	'Asia/Tel_Aviv',
	'Asia/Thimbu',
	'Asia/Thimphu',
	'Asia/Tokyo',
	'Asia/Tomsk',
	'Asia/Ujung_Pandang',
	'Asia/Ulaanbaatar',
	'Asia/Ulan_Bator',
	'Asia/Urumqi',
	'Asia/Ust-Nera',
	'Asia/Vientiane',
	'Asia/Vladivostok',
	'Asia/Yakutsk',
	'Asia/Yangon',
	'Asia/Yekaterinburg',
	'Asia/Yerevan',
	'Atlantic/Azores',
	'Atlantic/Bermuda',
	'Atlantic/Canary',
	'Atlantic/Cape_Verde',
	'Atlantic/Faeroe',
	'Atlantic/Faroe',
	'Atlantic/Jan_Mayen',
	'Atlantic/Madeira',
	'Atlantic/Reykjavik',
	'Atlantic/South_Georgia',
	'Atlantic/St_Helena',
	'Atlantic/Stanley',
	'Australia/Adelaide',
	'Australia/Brisbane',
	'Australia/Broken_Hill',
	'Australia/Canberra',
	'Australia/Currie',
	'Australia/Darwin',
	'Australia/Eucla',
	'Australia/Hobart',
	'Australia/Lindeman',
	'Australia/Lord_Howe',
	'Australia/Melbourne',
	'Australia/North',
	'Australia/Perth',
	'Australia/Queensland',
	'Australia/South',
	'Australia/Sydney',
	'Australia/Tasmania',
	'Australia/Victoria',
	'Australia/West',
	'Australia/Yancowinna',
	'Brazil/Acre',
	'Brazil/East',
	'Brazil/West',
	'Canada/Atlantic',
	'Canada/Central',
	'Canada/Eastern',
	'Canada/Mountain',
	'Canada/Newfoundland',
	'Canada/Pacific',
	'Canada/Saskatchewan',
	'Canada/Yukon',
	'Chile/Continental',
	'Cuba',
	'Egypt',
	'Eire',
	'Europe/Amsterdam',
	'Europe/Andorra',
	'Europe/Astrakhan',
	'Europe/Athens',
	'Europe/Belfast',
	'Europe/Belgrade',
	'Europe/Berlin',
	'Europe/Bratislava',
	'Europe/Brussels',
	'Europe/Bucharest',
	'Europe/Budapest',
	'Europe/Busingen',
	'Europe/Chisinau',
	'Europe/Copenhagen',
	'Europe/Dublin',
	'Europe/Gibraltar',
	'Europe/Guernsey',
	'Europe/Helsinki',
	'Europe/Isle_of_Man',
	'Europe/Istanbul',
	'Europe/Jersey',
	'Europe/Kaliningrad',
	'Europe/Kiev',
	'Europe/Kirov',
	'Europe/Lisbon',
	'Europe/Ljubljana',
	'Europe/London',
	'Europe/Luxembourg',
	'Europe/Madrid',
	'Europe/Malta',
	'Europe/Mariehamn',
	'Europe/Minsk',
	'Europe/Monaco',
	'Europe/Moscow',
	'Europe/Nicosia',
	'Europe/Oslo',
	'Europe/Paris',
	'Europe/Podgorica',
	'Europe/Prague',
	'Europe/Riga',
	'Europe/Rome',
	'Europe/Samara',
	'Europe/San_Marino',
	'Europe/Sarajevo',
	'Europe/Saratov',
	'Europe/Simferopol',
	'Europe/Skopje',
	'Europe/Sofia',
	'Europe/Stockholm',
	'Europe/Tallinn',
	'Europe/Tirane',
	'Europe/Tiraspol',
	'Europe/Ulyanovsk',
	'Europe/Uzhgorod',
	'Europe/Vaduz',
	'Europe/Vatican',
	'Europe/Vienna',
	'Europe/Vilnius',
	'Europe/Volgograd',
	'Europe/Warsaw',
	'Europe/Zagreb',
	'Europe/Zaporozhye',
	'Europe/Zurich',
	'Hongkong',
	'Iceland',
	'Indian/Antananarivo',
	'Indian/Chagos',
	'Indian/Christmas',
	'Indian/Cocos',
	'Indian/Comoro',
	'Indian/Kerguelen',
	'Indian/Mahe',
	'Indian/Maldives',
	'Indian/Mauritius',
	'Indian/Mayotte',
	'Indian/Reunion',
	'Iran',
	'Israel',
	'Jamaica',
	'Japan',
	'Kwajalein',
	'Libya',
	'Mexico/General',
	'Pacific/Apia',
	'Pacific/Auckland',
	'Pacific/Bougainville',
	'Pacific/Chatham',
	'Pacific/Chuuk',
	'Pacific/Easter',
	'Pacific/Efate',
	'Pacific/Enderbury',
	'Pacific/Fakaofo',
	'Pacific/Fiji',
	'Pacific/Funafuti',
	'Pacific/Galapagos',
	'Pacific/Gambier',
	'Pacific/Guadalcanal',
	'Pacific/Guam',
	'Pacific/Honolulu',
	'Pacific/Johnston',
	'Pacific/Kiritimati',
	'Pacific/Kosrae',
	'Pacific/Kwajalein',
	'Pacific/Majuro',
	'Pacific/Marquesas',
	'Pacific/Midway',
	'Pacific/Nauru',
	'Pacific/Niue',
	'Pacific/Norfolk',
	'Pacific/Noumea',
	'Pacific/Pago_Pago',
	'Pacific/Palau',
	'Pacific/Pitcairn',
	'Pacific/Pohnpei',
	'Pacific/Ponape',
	'Pacific/Port_Moresby',
	'Pacific/Rarotonga',
	'Pacific/Saipan',
	'Pacific/Samoa',
	'Pacific/Tahiti',
	'Pacific/Tarawa',
	'Pacific/Tongatapu',
	'Pacific/Truk',
	'Pacific/Wake',
	'Pacific/Wallis',
	'Pacific/Yap',
	'Poland',
	'Portugal',
	'Singapore',
	'Turkey'
]

export const CUSTOM_LOGGING_SCHEMA = 'custom_logging'
export const LOGGING_SCHEMA = 'logging'

export const OCCUPANCIES = Object.values(OCCUPANCY)
export const ENVS = Object.values(ENV)
export const MESSAGE_TYPES = Object.values(MESSAGE_TYPE)
export const JWT_AUDIENCES = Object.values(JWT_AUDIENCE)
export const PERMISSIONS = Object.values(PERMISSION)
export const PERMISSION_GROUPS = Object.values(PERMISSION_GROUP)
export const SQL_OPERATIONS = Object.values(SQL_OPERATION)
export const FILE_DATA_TYPES = Object.values(FILE_DATA_TYPE)
export const LANGUAGES = Object.values(LANGUAGE)
export const SYSTEM_USER = 'SYSTEM_USER'
export const SUPER_ADMIN_EMAIL = 'sadmin@tmr.com'
export const DAYS = Object.values(DAY)
export const STATUSES = Object.values(STATUS)
export const INFO_TYPES = Object.values(INFO_TYPE)
export const INFO_MESSAGE_STATUSES = Object.values(INFO_MESSAGE_STATUS)
export const RESORT_TYPES = Object.values(RESORT_TYPE)
export const ATTRACTION_TYPES = Object.values(ATTRACTION_TYPE)
export const SKILIFT_TYPES = Object.values(SKILIFT_TYPE)
export const SNOW_TYPES = Object.values(SNOW_TYPE)
export const DIFFICULTIES = Object.values(DIFFICULTY)
export const SNOW_CONDITIONS = Object.values(SNOW_CONDITION)
export const SLOPE_TYPES = Object.values(SLOPE_TYPE)
export const CROSS_COUNTRY_DIFFICULTIES = Object.values(CROSS_COUNTRY_DIFFICULTY)
export const SURFACE_TYPES = Object.values(SURFACE_TYPE)
export const WATER_TYPES = Object.values(WATER_TYPE)
export const PLACEMENTS = Object.values(PLACEMENT)
export const SERVICE_TYPES = Object.values(SERVICE_TYPE)
export const CURRENCY_CODES = Object.values(CURRENCY_CODE)
export const DEPARTURE_TIME_TYPES = Object.values(DEPARTURE_TIME_TYPE)
export const DANGEROUS = Object.values(DANGER)
export const WEATHER_TYPES = Object.values(WEATHER_TYPE);
export const EVENT_CATEGORIES =  Object.values(EVENT_CATEGORY);
