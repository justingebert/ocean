import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// HINT: Use throughout your app instead of plain `useDispatch` and `useSelector`
/**
 * A typed version of the `useDispatch` hook for Redux.
 *
 * This ensures that dispatched actions are correctly typed.
 * Use this throughout the app instead of plain `useDispatch`.
 *
 * @returns The Redux dispatch function with `AppDispatch` type.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
/**
 * A typed version of the `useSelector` hook for Redux.
 *
 * This ensures state selection is correctly typed based on `RootState`.
 * Use this throughout the app instead of plain `useSelector`.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
