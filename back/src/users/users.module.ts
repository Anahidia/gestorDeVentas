import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"
import { User } from "./entities/user.entity"
import { Business } from "./entities/business.entity"
import { AuthModule } from "../auth/auth.module"

@Module({
  imports: [forwardRef(() => AuthModule), TypeOrmModule.forFeature([User, Business])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
