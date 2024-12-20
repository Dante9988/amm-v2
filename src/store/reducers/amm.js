import { createSlice } from "@reduxjs/toolkit";

export const amm = createSlice({
    name: 'amm',
    initialState: {
        contract: [],
        shares: 0,
        swaps: [],
        swapLoading: {
            isLoading: false,          // Initial loading state
            isLoadingOlder: false,     // Background loading state
            loadingProgress: {         // Track loading progress
                fromBlock: 0,
                toBlock: 0,
                currentProgress: 0
            },
            error: null               // Store any loading errors
        },
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
        swapsLoading: (state) => {
            state.swapLoading.isLoading = true;
            state.swapLoading.error = null;
        },
        swapsLoaded: (state, action) => {
            state.swaps = action.payload;
            state.swapLoading.isLoading = false;
        },
        loadingOlderSwaps: (state, action) => {
            state.swapLoading.isLoadingOlder = true;
            state.swapLoading.loadingProgress = action.payload;
            state.swapLoading.error = null;
        },
        olderSwapsLoaded: (state, action) => {
            // Combine new swaps with existing ones
            const allSwaps = [...state.swaps, ...action.payload];
            
            // Remove duplicates and sort by timestamp
            state.swaps = Array.from(
                new Map(allSwaps.map(swap => [swap.hash, swap])).values()
            ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        },
        loadingComplete: (state) => {
            state.swapLoading.isLoadingOlder = false;
            state.swapLoading.loadingProgress = {
                fromBlock: 0,
                toBlock: 0,
                currentProgress: 100
            };
        },
        swapsError: (state, action) => {
            state.swapLoading.isLoading = false;
            state.swapLoading.isLoadingOlder = false;
            state.swapLoading.error = action.payload;
        },
        clearSwaps: (state) => {
            state.swaps = [];
            state.swapLoading = {
                isLoading: false,
                isLoadingOlder: false,
                loadingProgress: {
                    fromBlock: 0,
                    toBlock: 0,
                    currentProgress: 0
                },
                error: null
            };
        }

    },
});

export const {  
    setContract, 
    sharesLoaded, 
    swapRequest, 
    swapSuccess, 
    swapComplete, 
    swapFail, 
    depositRequest, 
    depositSuccess, 
    depositFail, 
    withdrawRequest, 
    withdrawSuccess, 
    withdrawFail, 
    swapsLoaded, 
    swapsLoading, 
    loadingOlderSwaps, 
    olderSwapsLoaded, 
    swapsError,
    loadingComplete,
    clearSwaps
} = amm.actions;

export default amm.reducer;
