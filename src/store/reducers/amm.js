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
        }
    },
    reducers: {
        setContract: (state, action) => {
            state.contract = action.payload
        },
        sharesLoaded: (state, action) => {
            state.shares = action.payload
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
        }
    },
});

export const {  setContract, sharesLoaded, swapRequest, swapSuccess, swapComplete, swapFail } = amm.actions;

export default amm.reducer;
