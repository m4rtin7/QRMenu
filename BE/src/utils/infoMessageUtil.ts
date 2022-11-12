import dayjs from "dayjs"
import { ModelsType } from "../db/models"
import { InfoMessageModel } from "../db/models/infoMessage"
import { LocalizationModel } from "../db/models/localization"
import { INFO_MESSAGE_STATUS } from "./enums"
import { openingHoursIsNowOpen } from "./openingHoursUtil"
import { loadWeatherCurrentData } from "./weather"

interface IInfoMessage {
    templateLocalization: LocalizationModel
    templatePreviewLocalization: LocalizationModel
}

export const fillInfoMessageTemplateAsync = async (messageArr: IInfoMessage[], models: ModelsType) => {
    const allDynamicParams: { key: string, type: string, itemAlias: string, value: string }[] = [];

    for (const msg of messageArr) {
        if (msg.templateLocalization?.values != null) {
            for (const localization of msg.templateLocalization.values) {
                const paramArr = localization.value.match(/\{\{(.*?)\}\}/g);

                if (paramArr != null) {
                    for (const paramItem of paramArr) {
                        try {
                            const splitArr = paramItem.substring(2, paramItem.length - 2).split(':');
                            if (splitArr.length != 2) {
                                continue;
                            }

                            const type = splitArr[0];
                            const alias = splitArr[1];
                            const already = allDynamicParams.find(p => p.key == paramItem);

                            if (already == null) {
                                allDynamicParams.push({
                                    key: paramItem,
                                    type: type,
                                    itemAlias: alias,
                                    value: null
                                });
                            }
                        } catch (error) {
                            continue;
                        }
                    }
                }
            }
        }
    }

    const weatherItems = allDynamicParams.filter(p => p.type == 'temperature' || p.type == 'windspeed');
    if (weatherItems.length > 0) {
        const weatherArr = await loadWeatherCurrentData(models, weatherItems.map(p => p.itemAlias), null);

        for (const weatherItem of weatherItems) {
            const loadedWeather = weatherArr.find(p => p.location.alias == weatherItem.itemAlias);
            if (loadedWeather != null) {
                if (weatherItem.type == 'temperature') {
                    weatherItem.value = Math.round(loadedWeather.current.temperature) + '°C';
                }
            }

            if (weatherItem.value == null || weatherItem.toString().length == 0) {
                weatherItem.value = weatherItem.key;
            }
        }
    }

    for (const msg of messageArr) {
        if (msg.templateLocalization?.values != null) {
            for (const localization of msg.templateLocalization.values) {
                const paramArr = localization.value.match(/\{\{(.*?)\}\}/g);

                if (msg.templatePreviewLocalization == null) {
                    msg.templatePreviewLocalization = {
                        id: null,
                        values: []
                    } as any
                }

                const previewValue = {
                    languageCode: localization.languageCode,
                    value: localization.value
                };

                msg.templatePreviewLocalization.values.push(previewValue as any);

                if (paramArr != null) {
                    for (const paramItem of paramArr) {
                        const filledParam = allDynamicParams.find(p => p.key == paramItem);
                        if (filledParam != null) {
                            previewValue.value = previewValue.value.replace(paramItem, filledParam.value);
                        }
                    }
                }
            }
        }
    }
}

export const parseInfoMessageStatus = (item: InfoMessageModel): INFO_MESSAGE_STATUS => {
    const now = dayjs();
    const tz = item.info.resort.timezone;

    if (item.validFrom != null) {
        const validFrom = dayjs.tz(item.validFrom, tz);
        if (validFrom.diff(now, 'millisecond') > 0) {
            return INFO_MESSAGE_STATUS.WAITING;
        }
    }

    if (item.validTo != null) {
        const validTo = dayjs.tz(item.validTo, tz);
        if (validTo.diff(now, 'millisecond') < 0) {
            return INFO_MESSAGE_STATUS.EXPIRED;
        }
    }

    const isOpen = openingHoursIsNowOpen(item.validTimes, tz);
    if (isOpen == 'undefined' || isOpen == "open") {
        return INFO_MESSAGE_STATUS.ACTIVE;
    }

    return INFO_MESSAGE_STATUS.WAITING;
}