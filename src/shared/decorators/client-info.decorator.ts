import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface IClientInfo {
  ip: string;
  userAgent: string;
  host: string;
}

export const ClientInfo = createParamDecorator(
  (data: keyof IClientInfo, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const clientInfo: IClientInfo = {
      ip: request.ip || '127.0.0.1',
      userAgent: request.get('user-agent') || 'Unknown Client',
      host: request.get('host') || 'Unknown Host',
    };

    return data ? clientInfo[data] : clientInfo;
  },
);
