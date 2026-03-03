import { ApiProperty } from '@nestjs/swagger';

export class UserPayloadDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ type: UserPayloadDto })
  user!: UserPayloadDto;
}
