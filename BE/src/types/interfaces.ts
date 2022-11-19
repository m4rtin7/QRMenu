import { IStrategyOptionsWithRequest as IPassportLocalStrategyOptions } from 'passport-local'
import { JwtFromRequestFunction } from 'passport-jwt'
import { InitOptions as I18nextOptions } from 'i18next'
import { SKILIFT_TYPES, WEATHER_TYPE } from '../utils/enums'

export interface IServerConfig {
	port: number
	filesSubdirs: string[]
	filesPath: string
	uploadsPath: string
	tempPath: string
	imagesPath: string
	domain: string
	sharp?: ISharpConfig
}

export interface ISharpConfig {
	ruleWidths: number[]
}

export interface IMulterConfig {
	maxSize: number
}

export interface ILogsCongig {
	logDirectory: string
}

interface IPassporTokenStrategyOptions {
	tokenFields?: string[] | undefined
	headerFields?: string[] | undefined
	session?: boolean | undefined
	passReqToCallback: true
	params?: boolean | undefined
	optional?: boolean | undefined
	caseInsensitive?: boolean | undefined
}

interface JWTConfig {
	jwtFromRequest: JwtFromRequestFunction
	exp: string
	audience: string
	passReqToCallback: boolean
}

export interface IJWTPassportConfig {
	secretOrKey: string
	api: JWTConfig
	forgottenPassword: JWTConfig
	invitation: JWTConfig
}

export interface IPassportConfig {
	local: IPassportLocalStrategyOptions
	jwt: IJWTPassportConfig
	saml: ISamlLoginConfig
	token: IPassporTokenStrategyOptions
}

export interface IJwtPayload {
	uid: number
	superUid?: number
	exp: number
	aud: string
}

export interface IEmailConfig {
	host: string
	port: number
	from: string
	auth: {
		user: string
		pass: string
	}
}

export interface IWeatherApiConfig {
	apikey: string
}

export interface ISamlLoginConfig {
	loginUrl: string
	callbackUrl: string
	entryPoint: string
	issuer: string
	certificateBase64: string
}

export interface ICronConfig {
	weather: {
		scheduledTime: string
	}
	snowfall: {
		scheduledTime: string
	}
	cameraThumbs: {
		scheduledTime: string		
	}
	fileDelete: {
		scheduledTime: string		
	}
}

export interface IConfig {
	server?: IServerConfig
	logs?: ILogsCongig
	passport?: IPassportConfig
	i18next?: I18nextOptions
	weatherApi: IWeatherApiConfig
	cron?: ICronConfig
}

export interface ITimeRange {
	timeFrom: string
	timeTo: string
}

export interface IGeoJSON {
	type: string
	properties: {
		label: number
		stroke: string
		'stroke-width': number
		'stroke-opacity': number
		DirectionArrowIndex: number[]
		MarkerLocation: number[]
	}
	geometry: {
		type: string
		coordinates: number[][]
	}
}

export interface IWeatherData {
	current: IWeatherCurrentData
	forecast: IWeatherForecastData
	lastSnowfall: string
}

export interface IWeatherCurrentData {
	timestamp: string
	temperature: number
	feelsLike: number
	visibility: number
	humidity: number
	pressure: number
	precipitation: number
	cloudCover: number
	dewPoint: number
	uv: number
	weather: IWeatherStateData
	wind: {
		speed: number
		degree: number
		direction: string
		gust: number
	}
}

export interface IWeatherStateData {
	code: string,
	type: WEATHER_TYPE
	text: string
	icon: string
	wiClass: string
}

export interface IWeatherForecastData {
	lastUpdate: string
	daily: IWeatherForecastDailyItem[]
	hourly: IWeatherForecastHourlyItem[]
}

export interface IWeatherForecastHourlyItem {
	date: string

	temperatureAvg: number
	totalPrecip: number
	precipProbability: number
	dewPoint: number
	visibility: number
	humidity: number
	pressure: number
	cloudCover: number
	weather: IWeatherStateData
	uv: number
	wind: {
		speed: number
		degree: number
		direction: string
		gust: number
	}
}

export interface IWeatherForecastDailyItem extends IWeatherForecastHourlyItem {
	sunrise: string
	sundown: string
	precipAvg: number
	precipMax: number
	precipMin: number
	temperatureMax: number
	temperatureMin: number
}

export interface ILocalizedText {
	sk?: string,
	en?: string
}
