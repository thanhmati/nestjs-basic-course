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
      // Khi enableImplicitConversion: true, class-transformer đã gọi Boolean('false') => true trước.
      // Do đó, ta lấy giá trị chuỗi nguyên bản (raw string) từ obj[key] để kiểm tra chính xác.
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
