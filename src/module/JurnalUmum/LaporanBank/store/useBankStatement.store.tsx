import { create } from 'zustand'
import { Data } from '../types/ImportBankStatement.model';

interface BankStatementState {
    showAlert: boolean;
    errorMessages: [];
    masterData: Data;
    totalData: Data[];
    wrongData: Data[];
    correctData: Data[];
    sumTotalData: number;
    totalWrongData: number;
    totalCorrectData: number;
    setMasterData: (datas: Data) => void;
    setTotalData: (datas: Data[]) => void;
    setShowAlert: (status: boolean) => void;
    setWrongData: (wrongDatas: Data[]) => void;
    setErrorMessages: (dataMessages: any) => void;
    setCorrectData: (correctDatas: Data[]) => void;
}

export const useBankStatementStore = create<BankStatementState>((set) => ({
    showAlert: true,
    masterData: [],
    totalData: [],
    wrongData: [],
    correctData: [],
    errorMessages: [],
    sumTotalData: 0,
    totalWrongData: 0,
    totalCorrectData: 0,
    setShowAlert: (status) => set({ showAlert: status }),
    setMasterData: (datas) => set({ masterData: datas }),
    setTotalData: (datas) =>
        set(() => {
            return { totalData: datas, sumTotalData: datas.length }
        }),
    setWrongData: (wrongDatas) =>
        set(() => {
            return { wrongData: wrongDatas, totalWrongData: wrongDatas.length }
        }),
    setCorrectData: (correctDatas) =>
        set(() => {
            return { correctData: correctDatas, totalCorrectData: correctDatas.length }
        }),
    setErrorMessages: (dataMessages) =>
        set(() => {
            return { errorMessages: dataMessages, showAlert: dataMessages.length === 0 ? false : true }
        }),
}))

