import { spreadAssign, AnyType } from '../types';

const files = require.context('.', false, /\.ts$/);
const modules: AnyType = {};
const otherModules: AnyType = {};

files.keys().forEach((key) => {
  if (key === './index.ts') return;
  const keys = key.replace(/(\.\/|\.ts)/g, '');
  modules[keys] = files(key).default;
  otherModules[keys] = files(key);
});

export const reducersAlias = (suffix = 'Slice') => {
  const allSlice: AnyType = {};
  Object.keys(modules).forEach((x) => {
    allSlice[x.replace(suffix, '')] = modules[x];
  });
  return allSlice;
};

const filterModulesDefault = (targetModules: AnyType) => {
  return Object.keys(targetModules).filter((x) => x !== 'default');
};
const filterModulesActions = (reduces: AnyType) => {
  const actions: AnyType = {};
  filterModulesDefault(reduces).forEach((x) => {
    actions[x] = reduces[x];
  });
  return actions;
};

export const spreadActions = (target?: string) => {
  let action: AnyType = {};
  const filterModules = filterModulesDefault(otherModules);
  for (let i = 0; i < filterModules.length; i += 1) {
    const x = filterModules[i];
    const nameSpace = x.replace('Slice', '');
    const nameReduce = filterModulesActions(otherModules[x]);
    if (target && nameSpace === target) {
      action = spreadAssign(nameReduce);
      break;
    } else {
      action[nameSpace] = spreadAssign(nameReduce);
    }
  }
  return action;
};

export default modules;
