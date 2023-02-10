import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { connectProviders } from './connection/connect.providers';
import { DatabaseModule } from './connection/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [DatabaseModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [...connectProviders, AppService],
})
export class AppModule {}
