export class Exception extends Error {}

export class NotFoundException extends Exception {
  constructor(message?: string) {
    super(message);
    this.name = "NotFoundException";
  }
}

export class InvalidInputException extends Exception {
  constructor(message?: string) {
    super(message);
    this.name = "InvalidInputException";
  }
}

export class InternalServerErrorException extends Exception {
  constructor(message?: string) {
    super(message);
    this.name = "InternalServerErrorException";
  }
}
