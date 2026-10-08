import { Transform } from 'class-transformer';

export function ToBoolean() {
  return Transform(
    ({
      value,
      obj,
      key,
    }: {
      value: unknown;
      obj?: Record<string, unknown>;
      key?: string;
    }) => {
      const rawValue = obj && key ? obj[key] : value;
      if (rawValue === 'true' || rawValue === true) {
        return true;
      }
      if (rawValue === 'false' || rawValue === false) {
        return false;
      }
      return rawValue;
    },
  );
}
