import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { DistributionType } from '../entities/club.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClubDto {
  @ApiProperty({
    description: 'A new name for the running club.',
    example: 'Midnight Striders',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'The reward distribution method for the club.',
    enum: DistributionType,
    example: DistributionType.EQUAL,
    required: false,
  })
  @IsEnum(DistributionType)
  @IsOptional()
  distributionType?: DistributionType;
}