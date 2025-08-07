import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { DistributionType } from '../entities/club.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClubDto {
  @ApiProperty({
    description: 'The name of the running club.',
    example: 'Sunset Runners',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The initial amount of USDC deposited as an incentive pool.',
    example: 100.5,
  })
  @IsNumber()
  @IsPositive()
  usdcPool: number;

  @ApiProperty({
    description: 'The reward distribution method for the club.',
    enum: DistributionType,
    example: DistributionType.PROPORTIONAL,
  })
  @IsEnum(DistributionType)
  @IsNotEmpty()
  distributionType: DistributionType;
}