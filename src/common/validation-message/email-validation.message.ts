import { ValidationArguments } from 'class-validator';

export const emailValidationMessage = (args: ValidationArguments) =>
  `${args.property}에 정확한 이메일을 입력해주세요`;
