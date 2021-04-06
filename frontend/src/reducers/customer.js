let defaultState = {
    data: null
}

const mainReducer = (state = defaultState, action) => {
    if(action.type==="SHOW_CUSTOMER") {
        console.log('show')
        return {
            ...state,
            data: action.payload || defaultState.data
        }
    } else if (action.type==="ADD_ERROR") {
		return {
			...state,
			errorMessage: action.payload
		}
    } else {
        return {
            ...state
        }
    }
}

export default mainReducer;
