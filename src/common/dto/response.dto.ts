import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T = any> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message?: string;

  @ApiProperty()
  data?: T;

  @ApiProperty()
  error?: string;

  @ApiProperty()
  timestamp: string;

  constructor(partial: Partial<ResponseDto<T>>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message?: string): ResponseDto<T> {
    return new ResponseDto({
      success: true,
      data,
      message,
    });
  }

  static error(error: string, message?: string): ResponseDto {
    return new ResponseDto({
      success: false,
      error,
      message,
    });
  }
}

export class DeleteResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  deletedId: number;

  @ApiProperty()
  timestamp: string;

  constructor(id: number, message?: string) {
    this.success = true;
    this.deletedId = id;
    this.message = message || 'Resource deleted successfully';
    this.timestamp = new Date().toISOString();
  }
}

export class BulkDeleteResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  deletedCount: number;

  @ApiProperty()
  timestamp: string;

  constructor(count: number, message?: string) {
    this.success = true;
    this.deletedCount = count;
    this.message = message || `${count} resources deleted successfully`;
    this.timestamp = new Date().toISOString();
  }
}