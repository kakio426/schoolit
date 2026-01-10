import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info) {
        // 에러가 나거나 유저가 없어도 에러를 던지지 않고 null/undefined 반환
        return user;
    }
}
