import { IStatistics } from "./IStatistics"

export interface IResponse{
    message: string,
    success:boolean
}

export interface IResEstatistics{
    success:boolean
    data:IStatistics
}