import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { connectProviders } from './../connection/connect.providers';
import { DatabaseModule } from './../connection/database.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: `${process.env.SECRET_KEY}`,
    }),
  ],
  controllers: [],
  providers: [...connectProviders],
})
export class ApiModule {}
