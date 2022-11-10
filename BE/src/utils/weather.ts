import axios from "axios";
import dayjs from "dayjs";
import { find, map } from "lodash";
import { Op } from "sequelize";
import { ModelsType } from "../db/models";
import { WeatherManualModel } from "../db/models/weatherManual"
import { IWeatherApiConfig, IWeatherCurrentData, IWeatherData, IWeatherForecastDailyItem as IWeatherForecastDailyItem, IWeatherForecastData, IWeatherForecastHourlyItem, IWeatherStateData } from "../types/interfaces";
import config from 'config'
import { WEATHER_TYPE } from "./enums";
import { getPhotoFullPath } from "./photoUtil";
const weatherApiConfig: IWeatherApiConfig = config.get('weatherApi')


const degToCompass = (num: number) => {
    const val = Math.floor(num / 22.5 + 0.5)
    const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    return arr[val % 16]
}

const parseOpenWeatherType = (code: number): WEATHER_TYPE => {
    if (code >= 200 && code < 300) {
        if (code == 200 || code == 210 || code == 230) {
            return WEATHER_TYPE.THUNDERSTORM_LIGHT;
        }

        if (code == 201 || code == 211 || code == 221 || code == 231) {
            return WEATHER_TYPE.THUNDERSTORM_MODERATE;
        }

        return WEATHER_TYPE.THUNDERSTORM_INTENSIVE;
    }

    if (code >= 300 && code < 400) {
        return WEATHER_TYPE.DRIZZLE;
    }

    if (code == 800) {
        return WEATHER_TYPE.CLEAR;
    }

    if (code >= 500 && code < 600) {
        if (code == 511) {
            return WEATHER_TYPE.RAIN_FREEZING;
        }

        if (code == 500 || code == 520 || code == 531) {
            return WEATHER_TYPE.RAIN_MODERATE;
        }

        if (code == 501 || code == 521) {
            return WEATHER_TYPE.RAIN_MODERATE;
        }

        return WEATHER_TYPE.RAIN_INTENSIVE;
    }

    if (code >= 600 && code < 700) {
        if (code >= 610 || code < 620) {
            return WEATHER_TYPE.SNOW_WITH_RAIN;
        }

        if (code == 600 || code == 620) {
            return WEATHER_TYPE.SNOW_LIGHT;
        }

        if (code == 602 || code == 622) {
            return WEATHER_TYPE.SNOW_HEAVY;
        }

        return WEATHER_TYPE.SNOW_MODERATE;
    }

    if (code >= 700 && code < 800) {
        if (code == 701) {
            return WEATHER_TYPE.MIST;
        }

        if (code == 751) {
            return WEATHER_TYPE.SAND;
        }

        if (code == 781) {
            return WEATHER_TYPE.TORNADO;
        }

        return WEATHER_TYPE.MIST;
    }

    if (code >= 800 && code < 900) {
        if (code == 801) {
            return WEATHER_TYPE.CLOUDS_FEW;
        }

        if (code == 802 || code == 803) {
            return WEATHER_TYPE.CLOUDS_MODERATE;
        }

        return WEATHER_TYPE.CLOUDS_HEAVY;
    }

    return WEATHER_TYPE.UNKNOWN;
}

const getOpenWeatherIdFromWeatherType = (weatherType: WEATHER_TYPE): number => {
    switch (weatherType) {
        case WEATHER_TYPE.CLEAR:
            return 800;
        case WEATHER_TYPE.CLOUDS_FEW:
            return 801;
        case WEATHER_TYPE.CLOUDS_HEAVY:
            return 804
        case WEATHER_TYPE.CLOUDS_MODERATE:
            return 802;
        case WEATHER_TYPE.DRIZZLE:
            return 300;
        case WEATHER_TYPE.MIST:
            return 701;
        case WEATHER_TYPE.RAIN_FREEZING:
            return 511;
        case WEATHER_TYPE.RAIN_INTENSIVE:
            return 502;
        case WEATHER_TYPE.RAIN_MODERATE:
            return 501;
        case WEATHER_TYPE.RAIN_SHOWER:
            return 531;
        case WEATHER_TYPE.SAND:
            return 751;
        case WEATHER_TYPE.SNOW_HEAVY:
            return 602;
        case WEATHER_TYPE.SNOW_LIGHT:
            return 600;
        case WEATHER_TYPE.SNOW_MODERATE:
            return 601;
        case WEATHER_TYPE.SNOW_WITH_RAIN:
            return 611
        case WEATHER_TYPE.THUNDERSTORM_LIGHT:
            return 200;
        case WEATHER_TYPE.THUNDERSTORM_MODERATE:
            return 201;
        case WEATHER_TYPE.THUNDERSTORM_INTENSIVE:
            return 202;
        case WEATHER_TYPE.TORNADO:
            return 781;
        default:
            break;
    }

    return null;
}

const getFullWeatherImageUrl = (meteoImageId: number): string => {
    return getPhotoFullPath(`/migr/images/weather-icon/${meteoImageId.toString()}.png`);
}

export const getWeatherTypeImageUrl = (weatherType: WEATHER_TYPE): string => {
    switch (weatherType) {
        case WEATHER_TYPE.CLEAR:
            return getFullWeatherImageUrl(1);
        case WEATHER_TYPE.CLOUDS_FEW:
            return getFullWeatherImageUrl(2);
        case WEATHER_TYPE.CLOUDS_HEAVY:
            return getFullWeatherImageUrl(5);
        case WEATHER_TYPE.CLOUDS_MODERATE:
            return getFullWeatherImageUrl(4);
        case WEATHER_TYPE.DRIZZLE:
            return getFullWeatherImageUrl(11);
        case WEATHER_TYPE.MIST:
            return getFullWeatherImageUrl(7);
        case WEATHER_TYPE.RAIN_FREEZING:
            return getFullWeatherImageUrl(22);
        case WEATHER_TYPE.RAIN_INTENSIVE:
            return getFullWeatherImageUrl(12);
        case WEATHER_TYPE.RAIN_MODERATE:
            return getFullWeatherImageUrl(10);
        case WEATHER_TYPE.RAIN_SHOWER:
            return getFullWeatherImageUrl(10);
        case WEATHER_TYPE.SAND:
            return getFullWeatherImageUrl(21);
        case WEATHER_TYPE.SNOW_HEAVY:
            return getFullWeatherImageUrl(20);
        case WEATHER_TYPE.SNOW_LIGHT:
            return getFullWeatherImageUrl(17);
        case WEATHER_TYPE.SNOW_MODERATE:
            return getFullWeatherImageUrl(20);
        case WEATHER_TYPE.SNOW_WITH_RAIN:
            return getFullWeatherImageUrl(19);
        case WEATHER_TYPE.THUNDERSTORM_LIGHT:
            return getFullWeatherImageUrl(14);
        case WEATHER_TYPE.THUNDERSTORM_MODERATE:
            return getFullWeatherImageUrl(15);
        case WEATHER_TYPE.THUNDERSTORM_INTENSIVE:
            return getFullWeatherImageUrl(23);
        case WEATHER_TYPE.TORNADO:
            return getFullWeatherImageUrl(21);
        default:
            break;
    }

    //Non existing dummy one
    return getFullWeatherImageUrl(25);
}

export const downloadWeatherDataFromApi = async (gpsItem: { latitude: number, longitude: number }, includeForecast: boolean, previousData?: IWeatherData): Promise<IWeatherData> => {
    const sleep = function (ms: number) {
        return new Promise((resolve) => {
            console.log(`Starting a ${ms}ms sleep`);
            setTimeout(() => {
                console.log(`Sleep is over, let's go`);
                resolve(null);
            }, ms);
        });
    };

    const isSnowing = (weather: IWeatherStateData): boolean => {
        return weather.type == WEATHER_TYPE.SNOW_HEAVY ||
            weather.type == WEATHER_TYPE.SNOW_LIGHT ||
            weather.type == WEATHER_TYPE.SNOW_MODERATE ||
            weather.type == WEATHER_TYPE.SNOW_WITH_RAIN;
    }

    const randomIntFromInterval = (min: number, max: number) => { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    };

    const getWeather = (weatherArr: any[]): IWeatherStateData => {
        const weatherType = parseOpenWeatherType(weatherArr[0].id);
        return {
            code: weatherArr[0].id,
            icon: getWeatherTypeImageUrl(weatherType),
            type: weatherType,
            text: weatherArr[0].description,
            wiClass: getWiIconFromCode(weatherArr[0].id)
        }
    }

    const getWind = (wind: any): { speed: number, degree: number, direction: string, gust: number } => {
        return {
            degree: wind.deg,
            direction: degToCompass(wind.deg),
            gust: wind.gust,
            speed: wind.speed
        };

    }

    const getAvgFromHourly = (numArr: number[]): number => {
        if (numArr == null || numArr.length == 0) {
            return 0;
        }

        return parseFloat((numArr.reduce((prev: number, curr: number) => prev + curr, 0) / numArr.length).toFixed(4));
    }

    if (!includeForecast) {
        //Only update current weather data
        let currentlyData: any = null;
        let retryCount = 0;

        //There's 60 calls/minute limit on openweathermap...this ensures it waits in case of unsucessful
        await new Promise<void>(resolve => {
            const downloadLoop = async () => {
                try {
                    const currentResp = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${gpsItem.latitude}&lon=${gpsItem.longitude}&appid=${weatherApiConfig.apikey}&units=metric`,
                        {
                            timeout: 10000
                        }
                    );

                    if (currentResp.status == 200) {
                        currentlyData = currentResp.data;
                        resolve();
                        return;
                    }
                } catch (error) {
                    console.error(error);
                }

                if (retryCount > 4) {
                    currentlyData = null;
                    resolve();
                    return;
                }

                retryCount += 1;
                setTimeout(() => {
                    downloadLoop();
                }, randomIntFromInterval(61000, 72000));
            };

            downloadLoop();
        });

        if (currentlyData == null) {
            console.error('Error fetching new current weather data, sticking with old data');
            return previousData;
        }

        if (previousData == null) {
            previousData = {
                current: {} as any,
                lastSnowfall: null,
                forecast: {
                    lastUpdate: dayjs(0).toISOString(),
                    daily: [],
                    hourly: []
                }
            }
        }

        const data = previousData.current;
        data.cloudCover = currentlyData.clouds.all;
        data.feelsLike = currentlyData.main.feels_like;
        data.humidity = currentlyData.main.humidity;
        data.pressure = currentlyData.main.pressure;
        data.temperature = currentlyData.main.temp;
        data.timestamp = dayjs().toISOString();
        data.visibility = currentlyData.visibility;
        data.weather = getWeather(currentlyData.weather);
        data.wind = getWind(currentlyData.wind);

        //Not included in currently, preserve historic or set some default to prevent crashes of strongly-typed client consumers
        if (data.dewPoint == null) {
            data.dewPoint = 0;
        }

        if (data.precipitation == null) {
            data.precipitation = 0;
        }

        if (data.uv == null) {
            data.uv = 0;
        }

        if (isSnowing(data.weather)) {
            previousData.lastSnowfall = dayjs().toISOString();
        }

        return previousData;
    } else {
        let forecast: any = null;
        try {
            const resp = await axios.get(
                `https://api.openweathermap.org/data/3.0/onecall?lat=${gpsItem.latitude}&lon=${gpsItem.longitude}&exclude=minutely&appid=${weatherApiConfig.apikey}&units=metric`,
                {
                    timeout: 15000
                }
            );

            if (resp.status == 200) {
                forecast = resp.data;
            } else {
                console.error('Error fetching new forecast, sticking with old data');
                return previousData;
            }
        } catch (error) {
            return previousData;
        }

        const nowISO = dayjs().toISOString();
        const currentWeather = getWeather(forecast.current.weather);
        let lastSnowfall = previousData?.lastSnowfall;

        if (isSnowing(currentWeather)) {
            lastSnowfall = dayjs().toISOString();
        }

        return {
            lastSnowfall: lastSnowfall,
            current: {
                cloudCover: forecast.current.clouds,
                dewPoint: forecast.current.dew_point,
                feelsLike: forecast.current.feels_like,
                humidity: forecast.current.humidity,
                precipitation: forecast.current.rain || 0,
                pressure: forecast.current.pressure,
                temperature: forecast.current.temp,
                timestamp: nowISO,
                uv: forecast.current.uvi,
                visibility: forecast.current.visibility,
                weather: currentWeather,
                wind: getWind({
                    deg: forecast.current.wind_deg,
                    gust: forecast.current.wind_gust,
                    speed: forecast.current.wind_speed
                })
            },
            forecast: {
                lastUpdate: nowISO,
                daily: forecast.daily.map((daily: any): IWeatherForecastDailyItem => {
                    const day = new Date(daily.dt);
                    day.setHours(0);
                    day.setMinutes(0);
                    day.setSeconds(0);
                    day.setMilliseconds(0);

                    const dayMs = day.getTime();
                    const nextDayMs = dayMs + 86400000;
                    const hourlyItems: any[] = forecast.hourly.filter((p: any) => p.dt >= dayMs && p.dt < nextDayMs);
                    const avgVisibility = getAvgFromHourly(hourlyItems.map(p => p.visibility));
                    const avgPrecip = getAvgFromHourly(hourlyItems.map(p => (p.rain || 0) + (p.snow || 0)))

                    let precipMax: number = 0;
                    let precipMin: number = null;

                    hourlyItems.forEach(hourly => {
                        let precipTotal = (hourly.rain || 0) + (hourly.snow || 0);
                        if (precipTotal > precipMax) {
                            precipMax = precipTotal;
                        }

                        if (precipMin == null && precipTotal != 0) {
                            precipMin = precipTotal;
                        }

                        if (precipTotal > 0 && precipTotal < precipMin) {
                            precipMin = precipTotal;
                        }
                    })

                    return {
                        cloudCover: daily.clouds,
                        date: dayjs.unix(daily.dt).toISOString(),
                        humidity: daily.humidity,
                        pressure: daily.pressure,
                        sundown: dayjs.unix(daily.sunset).toISOString(),
                        sunrise: dayjs.unix(daily.sunrise).toISOString(),
                        temperatureAvg: parseFloat(((daily.temp.day + daily.temp.night + daily.temp.eve + daily.temp.morn) / 4).toFixed(4)),
                        temperatureMax: daily.temp.max,
                        temperatureMin: daily.temp.min,
                        dewPoint: daily.dew_point,
                        totalPrecip: daily.rain || 0,
                        precipAvg: avgPrecip,
                        precipMax: precipMax,
                        precipMin: precipMin,
                        uv: daily.uvi,
                        visibility: avgVisibility,
                        precipProbability: daily.pop ?? 0,
                        weather: getWeather(daily.weather),
                        wind: getWind({
                            deg: daily.wind_deg,
                            gust: daily.wind_gust,
                            speed: daily.wind_speed
                        })
                    }
                }),
                hourly: forecast.hourly.map((hourly: any): IWeatherForecastHourlyItem => {
                    return {
                        cloudCover: hourly.clouds,
                        date: dayjs.unix(hourly.dt).toISOString(),
                        humidity: hourly.humidity,
                        pressure: hourly.pressure,
                        temperatureAvg: hourly.temp,
                        totalPrecip: hourly.rain || 0,
                        uv: hourly.uvi,
                        dewPoint: hourly.dew_point,
                        visibility: hourly.visibility,
                        precipProbability: hourly.pop ?? 0,
                        weather: getWeather(hourly.weather),
                        wind: getWind({
                            deg: hourly.wind_deg,
                            gust: hourly.wind_gust,
                            speed: hourly.wind_speed
                        })
                    }
                }),
            }
        }
    }
};

export const loadWeatherCurrentData = async (models: ModelsType, nameSlugs?: string[], resortID?: number) => {
    const { Location, Resort, Weather, WeatherManual } = models
    const resortWhere = resortID > 0 ? { id: { [Op.eq]: resortID } } : undefined
    const nameWhere = nameSlugs?.length > 0 ? { nameSlug: { [Op.or]: [nameSlugs] } } : undefined

    const [locations, weathers, weathersManual] = await Promise.all([
        Location.findAll({
            attributes: ['id', 'name', 'nameSlug', 'latitude', 'longitude'],
            where: nameWhere,
            include: [
                {
                    attributes: ['id', 'name', 'nameSlug', 'timezone', 'description'],
                    model: Resort,
                    where: resortWhere
                }
            ]
        }),
        Weather.findAll({
            attributes: ['latitude', 'longitude', 'lastSnowfall', 'currentData']
        }),
        WeatherManual.findAll({
            attributes: ['latitude', 'longitude', 'temperature', 'windSpeed', 'weatherType', 'validTo']
        })
    ])

    const validLocations = locations.filter(p => p.latitude != null && (p.latitude > 0 || p.latitude < 0) && p.longitude != null && (p.longitude > 0 || p.longitude < 0));
    const resultPromises = map(validLocations, async (location) => {
        const weather = find(weathers, { latitude: location.latitude, longitude: location.longitude })
        let currentWeather: IWeatherCurrentData;
        let lastSnowfall: string = null;

        if (weather) {
            currentWeather = weather.currentData
            lastSnowfall = weather.lastSnowfall;
        } else {
            if (process.env.WEATHER_DOWNLOAD_MISSING != 'true') {
                currentWeather = null;
                lastSnowfall = null;
            } else {
                const apiResp = await downloadWeatherDataFromApi(location, false, null);
                currentWeather = apiResp?.current;
                lastSnowfall = apiResp?.lastSnowfall;
                console.warn('CALL WEATHER API');
            }
        }

        const parsedWeather = parseWeatherData(weathersManual, currentWeather, location);
        if (currentWeather != null) {
            currentWeather.temperature = parsedWeather.temperature;
            currentWeather.wind.speed = parsedWeather.windSpeed;
            currentWeather.weather = parsedWeather.weather;
        }

        return {
            location: {
                id: location.id,
                name: location.name,
                alias: location.nameSlug
            },
            resort: {
                id: location.resort.id,
                name: location.resort.name
            },
            lastSnowfall: lastSnowfall,
            latitude: location.latitude,
            longitude: location.longitude,
            isOverriden: parsedWeather.isOverriden,
            overridevalidTo: parsedWeather.overridevalidTo,
            current: currentWeather
        }
    })

    return await Promise.all(resultPromises);
}

export const loadWeatherForecastData = async (models: ModelsType, nameSlugs?: string[], resortID?: number) => {
    const { Location, Resort, Weather } = models
    const resortWhere = resortID > 0 ? { id: { [Op.eq]: resortID } } : undefined
    const nameWhere = nameSlugs?.length > 0 ? { nameSlug: { [Op.or]: [nameSlugs] } } : undefined

    const [locations, weathers] = await Promise.all([
        Location.findAll({
            attributes: ['id', 'name', 'nameSlug', 'latitude', 'longitude'],
            where: nameWhere,
            include: [
                {
                    attributes: ['id', 'name', 'nameSlug', 'timezone', 'description'],
                    model: Resort,
                    where: resortWhere
                }
            ]
        }),
        Weather.findAll({
            attributes: ['latitude', 'longitude', 'forecastData']
        })
    ])

    const validLocations = locations.filter(p => p.latitude != null && (p.latitude > 0 || p.latitude < 0) && p.longitude != null && (p.longitude > 0 || p.longitude < 0));
    const resultPromises = map(validLocations, async (location) => {
        const weather = find(weathers, { latitude: location.latitude, longitude: location.longitude })
        let forecast: IWeatherForecastData;

        if (weather) {
            forecast = weather.forecastData
        } else {
            if (process.env.WEATHER_DOWNLOAD_MISSING != 'true') {
                forecast = {
                    daily: [],
                    hourly: [],
                    lastUpdate: dayjs(0).toISOString()
                }
            } else {
                forecast = (await downloadWeatherDataFromApi(location, false, null))?.forecast;
                console.warn('CALL WEATHER API');
            }
        }

        return {
            location: {
                id: location.id,
                name: location.name,
                alias: location.nameSlug
            },
            resort: {
                id: location.resort.id,
                name: location.resort.name
            },
            latitude: location.latitude,
            longitude: location.longitude,
            lastUpdate: forecast.lastUpdate,
            daily: forecast.daily,
            hourly: forecast.hourly
        }
    })

    return await Promise.all(resultPromises);
}


export const parseWeatherData = (weathersManual: WeatherManualModel[], currentWeather: IWeatherCurrentData, location: { latitude: number; longitude: number }): { temperature: number; windSpeed: number, weather: IWeatherStateData, isOverriden: boolean, overridevalidTo: string } => {
    let weatherManual = find(weathersManual, { latitude: location.latitude, longitude: location.longitude });
    if (weatherManual != null && dayjs(weatherManual.validTo).unix() < dayjs().unix()) {
        weatherManual = null;
    }

    let weather: IWeatherStateData;
    if (weatherManual != null) {
        const code = getOpenWeatherIdFromWeatherType(weatherManual.weatherType);
        if (code != null) {
            weather = {
                code: code.toString(),
                icon: getWeatherTypeImageUrl(weatherManual.weatherType),
                text: 'TODO',
                type: weatherManual.weatherType,
                wiClass: getWiIconFromCode(code)
            }
        }
    }

    return {
        temperature: weatherManual?.temperature || currentWeather?.temperature,
        windSpeed: weatherManual?.windSpeed || currentWeather?.wind?.speed,
        weather: weather || currentWeather?.weather,
        isOverriden: weatherManual != null,
        overridevalidTo: weatherManual?.validTo
    };
}

const getWiIconFromCode = (code: number): string => {
    //Obtained from https://gist.github.com/tbranyen/62d974681dea8ee0caa1

    const iconMap = {
        "200": {
            "label": "thunderstorm with light rain",
            "icon": "storm-showers"
        },

        "201": {
            "label": "thunderstorm with rain",
            "icon": "storm-showers"
        },

        "202": {
            "label": "thunderstorm with heavy rain",
            "icon": "storm-showers"
        },

        "210": {
            "label": "light thunderstorm",
            "icon": "storm-showers"
        },

        "211": {
            "label": "thunderstorm",
            "icon": "thunderstorm"
        },

        "212": {
            "label": "heavy thunderstorm",
            "icon": "thunderstorm"
        },

        "221": {
            "label": "ragged thunderstorm",
            "icon": "thunderstorm"
        },

        "230": {
            "label": "thunderstorm with light drizzle",
            "icon": "storm-showers"
        },

        "231": {
            "label": "thunderstorm with drizzle",
            "icon": "storm-showers"
        },

        "232": {
            "label": "thunderstorm with heavy drizzle",
            "icon": "storm-showers"
        },

        "300": {
            "label": "light intensity drizzle",
            "icon": "sprinkle"
        },

        "301": {
            "label": "drizzle",
            "icon": "sprinkle"
        },

        "302": {
            "label": "heavy intensity drizzle",
            "icon": "sprinkle"
        },

        "310": {
            "label": "light intensity drizzle rain",
            "icon": "sprinkle"
        },

        "311": {
            "label": "drizzle rain",
            "icon": "sprinkle"
        },

        "312": {
            "label": "heavy intensity drizzle rain",
            "icon": "sprinkle"
        },

        "313": {
            "label": "shower rain and drizzle",
            "icon": "sprinkle"
        },

        "314": {
            "label": "heavy shower rain and drizzle",
            "icon": "sprinkle"
        },

        "321": {
            "label": "shower drizzle",
            "icon": "sprinkle"
        },

        "500": {
            "label": "light rain",
            "icon": "rain"
        },

        "501": {
            "label": "moderate rain",
            "icon": "rain"
        },

        "502": {
            "label": "heavy intensity rain",
            "icon": "rain"
        },

        "503": {
            "label": "very heavy rain",
            "icon": "rain"
        },

        "504": {
            "label": "extreme rain",
            "icon": "rain"
        },

        "511": {
            "label": "freezing rain",
            "icon": "rain-mix"
        },

        "520": {
            "label": "light intensity shower rain",
            "icon": "showers"
        },

        "521": {
            "label": "shower rain",
            "icon": "showers"
        },

        "522": {
            "label": "heavy intensity shower rain",
            "icon": "showers"
        },

        "531": {
            "label": "ragged shower rain",
            "icon": "showers"
        },

        "600": {
            "label": "light snow",
            "icon": "snow"
        },

        "601": {
            "label": "snow",
            "icon": "snow"
        },

        "602": {
            "label": "heavy snow",
            "icon": "snow"
        },

        "611": {
            "label": "sleet",
            "icon": "sleet"
        },

        "612": {
            "label": "shower sleet",
            "icon": "sleet"
        },

        "615": {
            "label": "light rain and snow",
            "icon": "rain-mix"
        },

        "616": {
            "label": "rain and snow",
            "icon": "rain-mix"
        },

        "620": {
            "label": "light shower snow",
            "icon": "rain-mix"
        },

        "621": {
            "label": "shower snow",
            "icon": "rain-mix"
        },

        "622": {
            "label": "heavy shower snow",
            "icon": "rain-mix"
        },

        "701": {
            "label": "mist",
            "icon": "sprinkle"
        },

        "711": {
            "label": "smoke",
            "icon": "smoke"
        },

        "721": {
            "label": "haze",
            "icon": "day-haze"
        },

        "731": {
            "label": "sand, dust whirls",
            "icon": "cloudy-gusts"
        },

        "741": {
            "label": "fog",
            "icon": "fog"
        },

        "751": {
            "label": "sand",
            "icon": "cloudy-gusts"
        },

        "761": {
            "label": "dust",
            "icon": "dust"
        },

        "762": {
            "label": "volcanic ash",
            "icon": "smog"
        },

        "771": {
            "label": "squalls",
            "icon": "day-windy"
        },

        "781": {
            "label": "tornado",
            "icon": "tornado"
        },

        "800": {
            "label": "clear sky",
            "icon": "sunny"
        },

        "801": {
            "label": "few clouds",
            "icon": "cloudy"
        },

        "802": {
            "label": "scattered clouds",
            "icon": "cloudy"
        },

        "803": {
            "label": "broken clouds",
            "icon": "cloudy"
        },

        "804": {
            "label": "overcast clouds",
            "icon": "cloudy"
        },


        "900": {
            "label": "tornado",
            "icon": "tornado"
        },

        "901": {
            "label": "tropical storm",
            "icon": "hurricane"
        },

        "902": {
            "label": "hurricane",
            "icon": "hurricane"
        },

        "903": {
            "label": "cold",
            "icon": "snowflake-cold"
        },

        "904": {
            "label": "hot",
            "icon": "hot"
        },

        "905": {
            "label": "windy",
            "icon": "windy"
        },

        "906": {
            "label": "hail",
            "icon": "hail"
        },

        "951": {
            "label": "calm",
            "icon": "sunny"
        },

        "952": {
            "label": "light breeze",
            "icon": "cloudy-gusts"
        },

        "953": {
            "label": "gentle breeze",
            "icon": "cloudy-gusts"
        },

        "954": {
            "label": "moderate breeze",
            "icon": "cloudy-gusts"
        },

        "955": {
            "label": "fresh breeze",
            "icon": "cloudy-gusts"
        },

        "956": {
            "label": "strong breeze",
            "icon": "cloudy-gusts"
        },

        "957": {
            "label": "high wind, near gale",
            "icon": "cloudy-gusts"
        },

        "958": {
            "label": "gale",
            "icon": "cloudy-gusts"
        },

        "959": {
            "label": "severe gale",
            "icon": "cloudy-gusts"
        },

        "960": {
            "label": "storm",
            "icon": "thunderstorm"
        },

        "961": {
            "label": "violent storm",
            "icon": "thunderstorm"
        },

        "962": {
            "label": "hurricane",
            "icon": "cloudy-gusts"
        }
    }

    let retVal = (iconMap as any)[code?.toString()]?.icon;
    if (retVal == null || retVal.toString().length == 0) {
        retVal = 'wi-owm-' + code.toString();
    }

    return retVal;
}