import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../models/store/appStore.ts'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useTypedDispatch = useDispatch.withTypes<AppDispatch>();
export const useTypedSelector = useSelector.withTypes<RootState>();
