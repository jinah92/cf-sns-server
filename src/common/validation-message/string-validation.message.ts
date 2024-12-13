import { ValidationArguments } from 'class-validator';

export const stringValidationMessage = (args: ValidationArguments) =>
  `${args.property}에는 string 값을 입력해주세요`;
