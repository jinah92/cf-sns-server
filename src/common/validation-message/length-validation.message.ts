import { ValidationArguments } from 'class-validator';

export const lengthValidationMessage = (args: ValidationArguments) => {
  /**
   * 1) value : 검증할 값(입력된 값)
   * 2) constraints : 파라미터에 입력된 제한사항들
   *    - args.constraints[0] = 1
   *    - args.constraints[1] = 20
   * 3) targetName : 검증하고 있는 클래스 이름
   * 4) object : 검증되고 있는 객체
   * 5) property : 검증되고 있는 객체의 프로퍼티 이름
   */

  if (args.constraints.length === 2) {
    return `${args.property}는 ${args.constraints[0]}~${args.constraints[1]} 글자를 입력해야 합니다`;
  }
  return `${args.property}는 최소 ${args.constraints[0]} 글자를 입력해야 합니다`;
};
