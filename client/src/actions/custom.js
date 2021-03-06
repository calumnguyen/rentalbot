import * as actions from "./types";

export const setToggleStatus = (status) => async (dispatch) => {
    dispatch({
        type: actions.UPDATE_TOGGLE_STATUS,
        payload: status,
    });
};