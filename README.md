# GlobalThink Technology - Backend API

Esta es la resolución de la prueba técnica para la posición de Backend Developer. Se trata de una API RESTful robusta, segura y escalable construida con NestJS y MongoDB, que gestiona usuarios, autenticación y autorización basada en roles.

## 🚀 Características Principales

* **Autenticación:** Implementación de JWT (JSON Web Tokens) y Passport.js para un login seguro y *stateless*.
* **Autorización (RBAC):** Sistema de roles personalizado (`admin` y `user`) mediante Custom Guards y Decorators.
  * Los administradores tienen acceso total al CRUD.
  * Los usuarios estándar solo pueden visualizar y modificar sus propios datos.
* **Seguridad:**  Validación de datos de entrada mediante `class-validator` y `class-transformer`.
  * Verificación en base de datos para tokens de usuarios eliminados lógicamente.
* **Soft Deletes:** Los usuarios no se borran físicamente, sino que se marca su fecha de baja (`deletedAt`), manteniendo la integridad referencial.
* **Documentación:** API completamente documentada con Swagger (OpenAPI).
* **Dockerización:** Entorno preparado para despliegue automático utilizando Docker y Docker Compose con un `Dockerfile` multi-stage optimizado para producción.

## 🛠️ Tecnologías Utilizadas

* **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
* **Base de Datos:** [MongoDB](https://www.mongodb.com/) con [Mongoose](https://mongoosejs.com/)
* **Seguridad:** JWT, Passport, Bcrypt (Hasheo de contraseñas)
* **Infraestructura:** Docker, Docker Compose
* **Documentación:** Swagger

---

## ⚙️ Configuración y Despliegue

### Requisitos Previos
* [Docker](https://www.docker.com/) y Docker Compose instalados.
* Opcional (para entorno local sin Docker): [Node.js](https://nodejs.org/) (v18 o superior) y una instancia de MongoDB corriendo.

### Variables de Entorno
El proyecto requiere variables de entorno para funcionar. Debes crear un archivo `.env` en la raíz del proyecto.
Puedes hacerlo fácilmente copiando el archivo de ejemplo:

```bash
cp .env.example .env
```
(Nota: El archivo .env.example contiene valores por defecto funcionales para el entorno Dockerizado).

### Opcion A: Despliegue con docker
La forma más rápida de levantar toda la infraestructura (API + Base de Datos).
1. Clonar el repositorio.
2. Configurar el archivo .env (ver paso anterior).
3. Levantar los contenedores en segundo plano:
```bash
docker-compose up -d --build
```
La API estará disponible en http://localhost:3000

### Opcion B: Despliegue en Local (Modo Desarrollo)💻
Si deseas correr la aplicación directamente en tu máquina:

1. Instalar dependencias:


```
npm install
```
2. Asegurarte de tener MongoDB corriendo localmente y actualizar MONGO_URI en tu archivo .env.

3. Iniciar el servidor de desarrollo:

```
nest start start:dev
```
---

## 📚 Documentación de la API (Swagger)
Una vez que la aplicación esté corriendo, puedes acceder a la interfaz interactiva de Swagger para explorar y probar todos los endpoints:

👉 URL de Swagger: http://localhost:3000/api/docs


Cuentas de Prueba
Para facilitar la evaluación, puedes crear usuarios mediante el endpoint POST /users (es público) asignándoles el rol user o admin para probar los distintos niveles de acceso.

---
## 📂 Estructura del proyecto
 ```
📁 backend/
 ├── 📁 src/
 │    ├── 📁 auth/                    # Módulo de seguridad
 │    │    ├── 📁 decorators/
 │    │    │    └── 📄 roles.decorator.ts
 │    │    ├── 📁 dto/
 │    │    │    └── 📄 login.dto.ts
 │    │    ├── 📁 guards/
 │    │    │    ├── 📄 jwt-auth.guard.ts
 │    │    │    └── 📄 roles.guard.ts
 │    │    ├── 📁 interfaces/
 │    │    │    └── 📄 request-user.interface.ts
 │    │    ├── 📁 strategies/
 │    │    │    └── 📄 jwt.strategy.ts
 |    |    |── 📄 auth.controller.ts
 │    │    ├── 📄 auth.module.ts
 │    │    └── 📄 auth.service.ts
 │    │
 │    ├── 📁 users/                   # Módulo de negocio (Usuarios)
 │    │    ├── 📁 dto/
 │    │    │    ├── 📄 create-user.dto.ts
 │    │    │    └── 📄 update-user.dto.ts
 │    │    ├── 📁 schemas/
 │    │    │    |── 📄 user.schema.ts
 |    |    |    └── 📄 profile.schema.ts
 │    │    ├── 📄 users.controller.ts
 │    │    ├── 📄 users.module.ts
 │    │    └── 📄 users.service.ts
 │    │
 │    ├── 📄 app.module.ts            # Módulo raíz (une todo)
 │    └── 📄 main.ts                  # Punto de entrada (Swagger, Pipes, etc.)
 │
 ├── 📄 .env                          # Variables reales
 ├── 📄 .env.example                  # Variables de entorno de ejemplo
 ├── 📄 .gitignore                    
 ├── 📄 Dockerfile                    # Receta de la imagen de tu API
 ├── 📄 docker-compose.yml            # Orquestador (API + MongoDB)
 ├── 📄 package.json
 ├── 📄 README.md                     
 └── 📄 tsconfig.json                 # Configuracion archivo de configuracion
 
 ```

 ---
 ## 🧪 Pruebas Unitarias (Unit Testing)

Se implementaron pruebas unitarias utilizando **Jest** para garantizar la calidad y estabilidad de la lógica de negocio core de la aplicación.

Nos enfocamos en testear el `UsersService`, aislando la capa de datos mediante el uso de **Mocks** (simulando los modelos de Mongoose y la librería Bcrypt) para lograr pruebas rápidas y deterministas.

**Casos de prueba cubiertos:**
* Validación de unicidad de email (Prevención de duplicados antes de la base de datos).
* Hasheo seguro de contraseñas al crear un usuario.
* Validación de formato de `ObjectId` al buscar usuarios.
* Correcta instanciación y guardado de documentos relacionados (User y Profile).

### Comandos para ejecutar las pruebas

Para correr la suite de pruebas estándar:
```
npm run test
```

Para correr las pruebas y generar el reporte de cobertura (Coverage):

```
npm run test:cov
```

Resultados de Cobertura
Se alcanzó una cobertura exitosa sobre los métodos críticos de negocio del servicio de usuarios.
```
----------------------|---------|----------|---------|---------|-------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------------|---------|----------|---------|---------|-------------------
All files             |    32.9 |    24.24 |   30.76 |   34.15 |                   
 src                  |       0 |        0 |       0 |       0 |                   
  app.module.ts       |       0 |      100 |       0 |       0 | 1-26              
  main.ts             |       0 |        0 |       0 |       0 | 1-33              
 src/auth             |       0 |        0 |       0 |       0 |                   
  auth.controller.ts  |       0 |        0 |       0 |       0 | 1-19              
  auth.module.ts      |       0 |      100 |       0 |       0 | 1-24              
  auth.service.ts     |       0 |        0 |       0 |       0 | 1-28              
 src/auth/decorators  |       0 |      100 |       0 |       0 |                   
  roles.decorator.ts  |       0 |      100 |       0 |       0 | 1-5               
 src/auth/dto         |       0 |      100 |     100 |       0 |                   
  login.dto.ts        |       0 |      100 |     100 |       0 | 1-13              
 src/auth/guards      |       0 |        0 |       0 |       0 |                   
  jwt-auth.guard.ts   |       0 |      100 |     100 |       0 | 1-5               
  roles.guard.ts      |       0 |        0 |       0 |       0 | 1-32              
 src/auth/strategies  |       0 |        0 |       0 |       0 |                   
  jwt.strategy.ts     |       0 |        0 |       0 |       0 | 1-28              
 src/users            |   56.66 |    34.54 |   53.84 |   59.25 |                   
  users.controller.ts |       0 |        0 |       0 |       0 | 1-156             
  users.module.ts     |       0 |      100 |     100 |       0 | 1-19              
  users.service.ts    |   96.22 |    61.29 |     100 |     100 | 17,59-73,113-124  
 src/users/dto        |       0 |        0 |     100 |       0 |                   
  create-user.dto.ts  |       0 |        0 |     100 |       0 | 1-59              
  update-user.dto.ts  |       0 |      100 |     100 |       0 | 1-6               
 src/users/schemas    |     100 |    83.33 |     100 |     100 |                   
  profile.schema.ts   |     100 |      100 |     100 |     100 |                   
  user.schema.ts      |     100 |    83.33 |     100 |     100 | 23                
----------------------|---------|----------|---------|---------|-------------------
Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        2.519 s
```