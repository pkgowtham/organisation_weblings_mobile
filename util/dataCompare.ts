// util/dataCompare.ts
export const dataChanged = (newData: any, oldData: any): boolean => {
  if (newData === oldData) return false;
  if (typeof newData !== typeof oldData) return true;

  if (Array.isArray(newData) && Array.isArray(oldData)) {
    if (newData.length !== oldData.length) return true;
    return newData.some((item, index) => dataChanged(item, oldData[index]));
  }

  if (typeof newData === 'object' && newData !== null && oldData !== null) {
    const newKeys = Object.keys(newData);
    const oldKeys = Object.keys(oldData);

    if (newKeys.length !== oldKeys.length) return true;
    return newKeys.some(key => dataChanged(newData[key], oldData[key]));
  }

  return newData !== oldData;
};

export const apiDataChanged = (newData: any, oldData: any): boolean => {
  // If both missing -> no change
  if ((newData === undefined || newData === null) && (oldData === undefined || oldData === null)) {
    return false;
  }
  // If there's no previous data, treat as changed (initial load)
  if (oldData === undefined || oldData === null) {
    return true;
  }
  // Otherwise deep compare
  return dataChanged(newData, oldData);
};
