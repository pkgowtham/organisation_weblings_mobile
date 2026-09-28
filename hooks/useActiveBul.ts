import { useStore } from '@/store';

interface UseActiveBulProps {
  bulId?: string;
  locationId?: string;
  buId?: string;
}

/**
 * Hook to retrieve the currently active Business Unit Location (BUL) ID
 * from props override, Redux selected BUL, or the first location in store.
 */
export function useActiveBul(props?: UseActiveBulProps) {
  const { store } = useStore();

  const locList = store.businessUnitLocation?.businessUnitLocationList || [];
  const firstLocId = locList[0]?.id || locList[0]?._id || '';

  const activeBulId =
    props?.bulId ||
    props?.locationId ||
    (store.businessUnitLocation as any)?.selectedBul?.id ||
    store.businessUnitLocation?.selectedBusinessUnitLocation?.id ||
    firstLocId;

  return {
    activeBulId,
    locationList: locList,
    selectedBul: (store.businessUnitLocation as any)?.selectedBul || store.businessUnitLocation?.selectedBusinessUnitLocation,
  };
}
