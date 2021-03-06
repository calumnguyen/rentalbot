import * as actions from "../actions/types";
const initialState = {
  toggleStatus: false,
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case actions.UPDATE_TOGGLE_STATUS:
      return {
        ...state,
        toggleStatus: payload,
      };
    default:
      return state;
  }
}