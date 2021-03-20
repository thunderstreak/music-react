import { RecordType } from '../types';

export default (type: string) => (payload: RecordType) => {
  if (payload !== undefined) {
    return { type, payload };
  }
  return { type };
};
