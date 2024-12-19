import { createSlice } from "@reduxjs/toolkit";

export const amm = createSlice({
    name: 'amm',
    initialState: {
        contract: [],
        shares: 0,
        swaps: [],
        swapping: {
            isSwapping: false,
            isSuccess: false,
            transactionHash: null
        },
        depositing: {
            isDepositing: false,
            isSuccess: false,
            transactionHash: null
        },
        withdrawing: {
            isWithdrawing: false,
            isSuccess: false,
            transactionHash: null
        }
    },
    reducers: {
        setContract: (state, action) => {
            state.contract = action.payload
        },
        sharesLoaded: (state, action) => {
            state.shares = action.payload
        },
        depositRequest: (state) => {
            state.depositing.isDepositing = true
            state.depositing.isSuccess = false
            state.depositing.transactionHash = null
        },
        depositSuccess: (state, action) => {
            state.depositing.isDepositing = false
            state.depositing.isSuccess = true
            state.depositing.transactionHash = action.payload
        },
        depositFail: (state) => {
            state.depositing.isDepositing = false
            state.depositing.isSuccess = false
            state.depositing.transactionHash = null
        },
        withdrawRequest: (state) => {
            state.withdrawing.isWithdrawing = true
            state.withdrawing.isSuccess = false
            state.withdrawing.transactionHash = null
        },
        withdrawSuccess: (state, action) => {
            state.withdrawing.isWithdrawing = false
            state.withdrawing.isSuccess = true
            state.withdrawing.transactionHash = action.payload
        },
        withdrawFail: (state) => {
            state.withdrawing.isWithdrawing = false
            state.withdrawing.isSuccess = false
            state.withdrawing.transactionHash = null
        },
        swapRequest: (state) => {
            state.swapping.isSwapping = true
            state.swapping.isSuccess = false
            state.swapping.transactionHash = null
        },
        swapSuccess: (state, action) => {
            state.swapping.isSwapping = false
            state.swapping.isSuccess = true
            state.swapping.transactionHash = action.payload
        },
        swapComplete: (state) => {
            state.swapping.isSwapping = false;
            state.swapping.isSuccess = false;
            state.swapping.transactionHash = null;
        },
        swapFail: (state) => {
            state.swapping.isSwapping = false;
            state.swapping.isSuccess = false;
            state.swapping.transactionHash = null;
        },

    },
});

export const {  setContract, sharesLoaded, swapRequest, swapSuccess, swapComplete, swapFail, depositRequest, depositSuccess, depositFail, withdrawRequest, withdrawSuccess, withdrawFail } = amm.actions;

export default amm.reducer;
