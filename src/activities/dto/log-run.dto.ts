import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogRunDto {
  @ApiProperty({
    description: 'The total distance of the run in kilometers.',
    example: 5.5,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  distanceKm: number;

  @ApiProperty({
    description: 'The total duration of the run in seconds.',
    example: 1800,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  durationSeconds: number;
}