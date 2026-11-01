import { create } from 'zustand';

interface ModalState {
  MainMenuOpened: boolean;
  PLDateSettingOpened: boolean;
  PLConfirmOpened: boolean;
  CBDateSettingOpened: boolean;
  CBConfirmOpened: boolean;
  toDate: Date | null;
  setToDate: (date: Date | null) => void;
  setMainMenuOpened: (open: boolean) => void;
  setPLDateSettingOpened: (open: boolean) => void;
  setCBDateSettingOpened: (open: boolean) => void;
  setPLConfirmOpened: (open: boolean) => void;
  setCBConfirmOpened: (open: boolean) => void;
  cancelToCheckPL: () => void;
  cancelToCheckCB: () => void;
  closeAllModals: () => void;
}

const usePeriodModalStore = create<ModalState>((set) => ({
  MainMenuOpened: false,
  PLDateSettingOpened: false,
  CBDateSettingOpened: false,
  PLConfirmOpened: false,
  CBConfirmOpened: false,
  toDate: null,
  setToDate: (date) => set({ toDate: date }),
  setMainMenuOpened: (open) => set({ MainMenuOpened: open }),
  setPLDateSettingOpened: (open) => set({ PLDateSettingOpened: open }),
  setCBDateSettingOpened: (open) => set({ CBDateSettingOpened: open }),
  setPLConfirmOpened: (open) => set({ PLConfirmOpened: open }),
  setCBConfirmOpened: (open) => set({ CBConfirmOpened: open }),
  cancelToCheckPL: () =>
    set({
      PLConfirmOpened: false,
    }),
  cancelToCheckCB: () =>
    set({
      CBConfirmOpened: false,
    }),
  closeAllModals: () =>
    set({
      MainMenuOpened: false,
      PLDateSettingOpened: false,
      CBDateSettingOpened: false,
      PLConfirmOpened: false,
      CBConfirmOpened: false,
    }),
}));

export default usePeriodModalStore;
