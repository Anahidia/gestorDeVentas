import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { ProductsModule } from "./products/products.module"
import { SalesModule } from "./sales/sales.module"
import { OrdersModule } from "./orders/orders.module"
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port:  5432,
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "sales_management",
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: process.env.NODE_ENV !== "production",
      dropSchema: false,
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    SalesModule,
    OrdersModule,
    CategoriesModule,
  ],
  
})
export class AppModule {}
