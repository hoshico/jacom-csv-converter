import { STATUS } from "../common/constants";

export const getStatus = (value: string) => {
  switch (value) {
    case "0":
    case "2":
    case "4":
      return STATUS.DRAFT;
    case "1":
      return STATUS.PUBLISHED;
    default:
      console.error("不明なステータス", value);
      return STATUS.DRAFT;
  }
};

export const getUpdatedDate = (value: string) => {
  if (!value) return;
  const [year, month, day, hours, minutes, seconds] = value
    .split(/[- :]/)
    .map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
};
