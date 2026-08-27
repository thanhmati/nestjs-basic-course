import { SetMetadata } from '@nestjs/common';
import { BYPASS_TRANSFORM_KEY } from '../constants/metadata.constant';

export const BypassTransform = () => SetMetadata(BYPASS_TRANSFORM_KEY, true);
