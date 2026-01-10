import { join } from "path"
import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { AppModule } from "./app.module"
import { NestExpressApplication } from "@nestjs/platform-express"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // 📂 Servir archivos estáticos (imagenes)
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads",
  })

  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const port = process.env.PORT || 4000
  await app.listen(port)
  console.log(`🚀 Backend running on http://localhost:${port}`)
}

bootstrap()
