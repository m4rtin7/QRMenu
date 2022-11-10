import { AttractionModel } from "../db/models/attraction";
import { UserModel } from "../db/models/user";
import { buildLocalizationData } from "./helper";

export const buildAttractionDataFromBody = (body: any, authUser: UserModel, resortID: number, isNew?: boolean): AttractionModel => {
    let retVal = {
        name: body.name,
        isActive: body.isActive != false,
        causeID: body.causeID,
        status: body.status,
        label: body.label,
        latitude: body.latitude,
        longitude: body.longitude,
        openingHours: body.openingHours,
        resortID,
        nameLocalization: {
            values: buildLocalizationData(body.nameLocalization)
        },
    } as any;

    if (isNew == true) {
        retVal.createdBy = authUser.id
    } else {
        retVal.updatedBy = authUser.id
    }

    if (resortID > 0) {
        retVal.resortID = resortID;
    }

    if (body.nameLocalization) {
        retVal.nameLocalization = {
            values: buildLocalizationData(body.nameLocalization)
        }
    }

    return retVal;
}