import dayjs from "dayjs";
import { IOpeningHours } from "../db/models/resort";
import { DAY } from "./enums";

export const openingHoursIsNowOpen = (openingHours: IOpeningHours[], tz: string): 'open' | 'closed' | 'undefined' => {
    if (openingHours == null || openingHours.length == 0) {
        return 'undefined';
    }

    const now = dayjs();
    const day: DAY = new Date().toLocaleDateString('en', { weekday: 'long' }).toUpperCase() as any;
    const dayItem = openingHours.find(p => p.day == day);
    const timeToNumber = (time: string): number => {
        if (time == null) {
            return 0;
        }

        const splitArr = time.split(':');
        return ((Number(splitArr[0]) * 60) + Number(splitArr[1]))
    }

    if (dayItem == null || dayItem.timeRanges == null || dayItem.timeRanges.length == 0) {
        return 'closed';
    }

    const nowHour = now.hour();
    const nowMinute = now.minute();
    const nowNumeric = timeToNumber(nowHour.toString() + ":" + nowMinute.toString());

    for (const range of dayItem.timeRanges) {
        const start = timeToNumber(range.timeFrom);
        let end = timeToNumber(range.timeTo);

        if (end == 0) {
            end = 24 * 60;
        }

        if (start < nowNumeric && end > nowNumeric) {
            return 'open';
        }
    }

    return 'closed';
}