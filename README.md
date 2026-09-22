# 🤝Servicio de entidades
Backend desarrollado con Node.js y Express.js para la gestión de entidades utilizadas en un sistema web de inspecciones fitosanitarias.

Este servicio forma parte de una arquitectura orientada a servicios y se encarga de gestionar información como usuarios, productores, predios, lugares de producción, lotes, cultivos, plagas y otras entidades relacionadas con el sistema, mientras que inspections-service se encarga de la lógica específica de las inspecciones.

## Problema que resuelve

El proceso de inspección fitosanitaria y técnica para la exportación de productos hortofrutícolas requiere recopilar y gestionar información sobre productores, propietarios, predios, lugares de producción, lotes, cultivos, plagas e inspecciones.

Actualmente, parte de este proceso puede involucrar el uso de formularios físicos y la posterior digitalización de la información, lo que puede generar demoras, información incompleta y mayor dificultad para realizar el seguimiento de las inspecciones.

Este proyecto propone una solución web que centraliza la información y digitaliza parte del proceso de gestión de inspecciones, facilitando el trabajo de los funcionarios y asistentes técnicos.

## Alcance del proyecto

El sistema abarca la gestión de:

- Usuarios y roles.
- Productores y propietarios.
- Predios y lugares de producción.
- Lotes y cultivos.
- Plagas y relaciones entre cultivos y plagas.
- Información necesaria para el seguimiento de los procesos de inspección.

El sistema contempla diferentes niveles de acceso según el rol del usuario, permitiendo que cada tipo de usuario consulte o gestione la información correspondiente a sus responsabilidades.

## Cómo aborda el problema

La solución busca reemplazar parte del manejo manual de información mediante una plataforma web que:

- Centraliza la información relacionada con los lugares de producción.
- Permite registrar y actualizar información desde el sistema.
- Facilita la consulta de cultivos, plagas, lotes y demás entidades relacionadas.
- Permite gestionar información asociada a las inspecciones.
- Implementa autenticación y autorización basada en roles.
- Facilita la comunicación entre los servicios encargados de gestionar las entidades y procesar las inspecciones.

De esta manera, el proyecto busca reducir la dependencia de formularios físicos y facilitar la disponibilidad, organización y consulta de la información durante el proceso de inspección.

## Características

- API REST para la gestión de entidades.
- Operaciones CRUD.
- Autenticación de usuarios.
- Autorización basada en roles.
- Validación de solicitudes.
- Manejo centralizado de errores.
- Persistencia de datos mediante PostgreSQL/Supabase.
- Comunicación con otros servicios mediante APIs REST.

## 🛠️ Tecnologías

- Node.js
- Express.js
- JavaScript
- PostgreSQL
- Supabase
- APIs REST
- dotenv
- CORS

## 🏗️ Arquitectura

#### Routes
Definen los endpoints disponibles y dirigen las solicitudes hacia los controladores correspondientes.

#### Middlewares
Se encargan de tareas transversales como autenticación, autorización y validaciones antes de ejecutar la lógica principal.

#### Controllers
Gestionan las solicitudes HTTP, separan los datos que vienen en la solicitud y construyen las respuestas que recibe el cliente.

#### Services
Contienen la lógica de negocio de las diferentes funcionalidades del sistema.

#### Repositories
Encapsulan el acceso a los datos y la interacción con Supabase.

## 🔐 Autenticación y autorización

La autenticación se implementa mediante Supabase Auth.
El acceso a los recursos protegidos se controla mediante middleware, validando el token de autenticación y los permisos asociados al usuario.
El sistema utiliza autorización basada en roles para restringir determinadas operaciones según el tipo de usuario.

### 👥 Roles

El sistema utiliza autorización basada en roles para controlar el acceso a los recursos.

Los principales roles utilizados son:

- **Propietario:** Gestión de predios.
- **Productor:** Gestión de lugares de producción y lotes.
- **Funcionario:** Administración y consulta de información del sistema.
- **Técnico:** Acceso a información necesaria para los procesos de inspección.

## 🔗 Integración con otros servicios

Este servicio forma parte de un sistema compuesto por dos servicios backend.

El **Inspections Service** consume información gestionada por este servicio mediante APIs REST. Por ejemplo, puede solicitar información relacionada con plagas, cultivos u otras entidades necesarias para procesar las inspecciones.

La comunicación entre servicios permite mantener separadas las responsabilidades de gestión de entidades y procesamiento de inspecciones.

**Servicio relacionado:**

- [Inspections Service](https://github.com/BrayanGuzmanGit/inspections-service)


## 📋 Entidades gestionadas
Entre las principales entidades gestionadas por este servicio se encuentran:
- Predios
- Lugares de producción
- Lotes
- Cultivos
- Plagas
- Cultivo-Plaga
- Departamentos
- Municipios

## 🔌 Endpoints principales

El servicio expone diferentes endpoints REST organizados según las entidades y funcionalidades del sistema.

### 👤 Usuarios y autenticación

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| POST | `/register` | Público | Registra un nuevo usuario. |
| POST | `/login` | Público | Autentica un usuario. |
| GET | `/me` | Autenticado | Obtiene el perfil del usuario autenticado. |
| GET | `/:id` | Autenticado | Obtiene un usuario por su identificador. |
| GET | `/all` | Funcionario | Obtiene los usuarios activos. |
| GET | `/pending` | Funcionario | Consulta usuarios pendientes. |
| GET | `/tecnicos/:idMunicipio` | Funcionario | Obtiene los técnicos asociados a un municipio. |
| PATCH | `/:cc/status` | Funcionario | Cambia el estado de un usuario. |

### 🌱 Predios

| Método | Endpoint | Rol | Descripción |
|---|---|---|---|
| POST | `/predios` | Propietario | Crea un predio. |
| GET | `/predios/:id_propietario` | Propietario | Consulta los predios de un propietario. |
| PATCH | `/predios/link` | Propietario | Vincula un lugar de producción a un predio. |
| PATCH | `/predios/:numeroRegistro` | Propietario | Actualiza un predio. |
| PATCH | `/predio/unlink` | Propietario | Desvincula un lugar de producción de un predio. |
| DELETE | `/predio/delete/:numeroRegistro` | Propietario | Elimina un predio. |

### 🌾 Lugares de producción

| Método | Endpoint | Rol | Descripción |
|---|---|---|---|
| POST | `/lugares` | Productor | Crea un lugar de producción. |
| PATCH | `/lugares/predioCentral` | Productor | Establece el predio central de un lugar. |
| GET | `/lugares/verificarCentral/:id_lugar` | Productor | Verifica si un lugar corresponde al predio central. |
| GET | `/lugares/:id_productor` | Productor | Consulta los lugares asociados a un productor. |
| POST |  `/lugares/inspecciones` | Funcionario | Obtiene información de los lugares a partir de sus identificadores. |
| PATCH | `/lugares/:numeroRegistro` | Productor | Actualiza el nombre de un lugar. |
| GET | `/lugares/:id_lugar/predios` | Productor | Consulta los predios asociados a un lugar. |
| DELETE | `/lugares/delete/:numeroRegistro` | Productor | Elimina un lugar de producción. |
| GET | `/lugarMunicipio/:id_lugar` | Funcionario | Consulta el municipio asociado a un lugar. |

### 📦 Lotes

| Método | Endpoint | Rol | Descripción |
|---|---|---|---|
| POST | `/lotes` | Productor | Crea un lote. |
| GET | `/lotes/:id_lugar` | Productor / Técnico | Consulta los lotes de un lugar. |
| PATCH | `/lotes/:numero_registro` | Productor | Actualiza un lote. |
| DELETE | `/lotes/:numero_registro/:uidlugarproduccion` | Productor | Elimina un lote. |

### 🌱 Cultivos y plagas

| Método | Endpoint | Rol | Descripción |
|---|---|---|---|
| GET | `/cultivos` | Productor / Funcionario / Técnico | Consulta los cultivos registrados. |
| GET | `/cultivo-plaga/:uidcultivo` | Productor / Funcionario / Técnico | Consulta las plagas asociadas a un cultivo. |


### 📍 Ubicaciones

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/departamentos` | Público | Consulta los departamentos registrados. |
| GET | `/municipios` | Público | Consulta los municipios registrados. |

## ⚙️ Requisitos
Para ejecutar el proyecto necesitas:
- Node.js
- pnpm
- Una instancia de Supabase configurada
- Variables de entorno necesarias para la conexión

## 📦 Instalación

Clona el repositorio: 
 ```
git clone https://github.com/BrayanGuzmanGit/entities-service5to.git 
 ```
Accede al proyecto:
```
cd entities-service5to
```
Instala las dependencias:
```
pnpm install
```

## 🔑 Variables de entorno
Crea un archivo .env en la raíz del proyecto con las variables necesarias para la conexión con Supabase. Ejemplo:
 ```
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_de_supabase
 ```
## ▶️ Ejecución
Ejecuta el servidor utilizando el archivo de entrada configurado en el proyecto:
 ```
 node src/index.js
```

## 🔮 Mejoras futuras
- Fortalecimiento de validaciones y políticas de seguridad.
- Contenerización mediante Docker.
- Automatización de procesos de integración y despliegue.
<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
</p>
