import React, { useReducer, Reducer } from 'react';
import { instantiateWithHash } from '../../canvas';
import { useCanvas } from '../../contexts';
import { InstantiateState, InstantiateAction } from '../../types';
import InstantiateStep1 from './InstantiateStep1';
import InstantiateStep2 from './InstantiateStep2';
import InstantiateStep3 from './InstantiateStep3';

const initialState: InstantiateState = {
  isLoading: false,
  isSuccess: false,
  contract: null,
  currentStep: 1,
};

const reducer: Reducer<InstantiateState, InstantiateAction> = (state, action) => {
  switch (action.type) {
    case 'STEP_1_COMPLETE':
      return {
        ...state,
        codeHash: action.payload.codeHash,
        metadata: action.payload.metadata,
        currentStep: 2,
      };
    case 'STEP_2_COMPLETE':
      return {
        ...state,
        constructorName: action.payload.constructorName,
        argValues: action.payload.argValues,
        fromAddress: action.payload.fromAddress,
        currentStep: 3,
      };
    case 'GO_TO':
      return { ...state, currentStep: action.payload.step };
    case 'INSTANTIATE':
      return { ...state, isLoading: true };
    case 'INSTANTIATE_SUCCESS':
      return { ...state, isSuccess: true, contract: action.payload, isLoading: false };
    case 'INSTANTIATE_ERROR':
      return { ...state, isLoading: false };

    default:
      throw new Error();
  }
};

const InstantiateWizard = () => {
  const { api, keyring } = useCanvas();
  const [state, dispatch] = useReducer(reducer, initialState);

  const keyringPairs = keyring?.getPairs();

  if (state.isLoading) {
    return (
      <>
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        <div> creating instance...</div>
      </>
    );
  }

  return keyringPairs && api?.query ? (
    <div className="pb-8 bg-white rounded-lg">
      <InstantiateStep1 dispatch={dispatch} currentStep={state.currentStep} />
      <InstantiateStep2
        keyringPairs={keyringPairs}
        constructors={state.metadata?.constructors}
        dispatch={dispatch}
        currentStep={state.currentStep}
      />
      <InstantiateStep3
        state={state}
        dispatch={dispatch}
        currentStep={state.currentStep}
        submitHandler={instantiateWithHash}
      />
    </div>
  ) : null;
};

export default InstantiateWizard;
