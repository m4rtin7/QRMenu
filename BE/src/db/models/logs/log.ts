import { Sequelize, DataTypes, Model, literal } from 'sequelize'

import { SQL_OPERATION, SQL_OPERATIONS, LOGGING_SCHEMA } from '../../../utils/enums'

class LogModel extends Model {
    id: number
    timestamp: string
    tableName: string
    userName: string
    operation: SQL_OPERATION
    newValue: Object
    oldValue: Object
}

export const DbTableLog = {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: literal('NOW()')
    },
    tableName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    operation: {
        type: DataTypes.STRING,
        allowNull: false
    },
    newValue: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    oldValue: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}

export default (sequelize: Sequelize, modelName: string) => {
    LogModel.init(DbTableLog, {
        sequelize,
        timestamps: false,
        updatedAt: false,
        modelName,
        tableName: 'logs',
        schema: LOGGING_SCHEMA
    })

    return LogModel
}
