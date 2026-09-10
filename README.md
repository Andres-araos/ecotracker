[EcoTracker_Documentacion_Tecnica.pdf](https://github.com/user-attachments/files/32074435/EcoTracker_Documentacion_Tecnica.pdf)
[EcoTracker_Documentacion_Tecnica.docx](https://github.com/user-attachments/files/32074432/EcoTracker_Documentacion_Tecnica.docx)
[EcoTracker_Documentacion_Tecnica.pdf](https://github.com/user-attachments/files/32074427/EcoTracker_Documentacion_Tecnica.pdf)
# EcoTracker 🌱

App móvil para rastrear, entender y reducir la huella de carbono diaria (comidas, transporte, energía). Proyecto universitario de Ingeniería de Software — React Native + Expo + Supabase.

## Stack
- React Native + Expo (TypeScript)
- Supabase: Auth, PostgreSQL, Row Level Security
- React Navigation (stack + bottom tabs)
- react-native-chart-kit para gráficos

## Puesta en marcha

### 1. Crear proyecto en Supabase
1. Crea un proyecto en https://supabase.com
2. Ve a **SQL Editor** y ejecuta el contenido completo de `database/schema.sql` (crea tablas, políticas RLS y datos semilla de catálogos).
3. En **Project Settings → API**, copia la `Project URL` y la `anon public key`.

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```
Completa `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` con los valores del paso anterior.

### 3. Instalar dependencias y ejecutar
```bash
npm install
npx expo start
```
Escanea el QR con la app Expo Go (Android/iOS) o presiona `a` / `i` para emulador.
1. Introducción
1.1 Propósito del documento
Este documento describe de manera integral la arquitectura, el diseño y la implementación de EcoTracker, cubriendo tanto la capa de frontend (aplicación móvil) como la capa de backend (base de datos y servicios en la nube). Su objetivo es servir como referencia técnica para el mantenimiento, la incorporación de nuevos desarrolladores y la evolución futura del producto.
1.2 Descripción general del proyecto
EcoTracker es una aplicación móvil que permite a las personas registrar, entender y reducir su huella de carbono diaria a partir de tres categorías de actividad: alimentación, transporte y consumo energético. La aplicación calcula automáticamente las emisiones de CO₂ asociadas a cada registro utilizando factores de emisión configurables, presenta comparativas semanales, ofrece consejos ambientales y permite competir con otros usuarios mediante retos grupales basados en puntos verdes.
El proyecto sigue una arquitectura cliente-servidor sin backend propio: toda la lógica de persistencia, autenticación y seguridad de datos se apoya en Supabase, una plataforma de Backend-as-a-Service (BaaS) sobre PostgreSQL. El cliente móvil se implementa con React Native y Expo, y se comunica con Supabase a través de su SDK oficial de JavaScript.
1.3 Alcance
La documentación cubre los siguientes aspectos:
Arquitectura general del sistema y stack tecnológico.
Modelo de datos, tablas, relaciones y políticas de seguridad (Row Level Security) del backend en Supabase.
Estructura de carpetas, navegación, pantallas, componentes, hooks y servicios del frontend.
Lógica de negocio central: cálculo de huella de carbono.
Flujos de usuario de extremo a extremo.
Instrucciones de instalación, configuración y puesta en marcha.
Limitaciones conocidas y trabajo futuro.

2. Arquitectura general
2.1 Visión de la arquitectura
EcoTracker adopta una arquitectura de dos capas: un cliente móvil (frontend) construido con React Native/Expo, y un backend gestionado completamente por Supabase, que expone base de datos, autenticación y una API autogenerada sobre PostgreSQL. No existe un servidor de aplicación intermedio propio; el cliente se conecta directamente a Supabase mediante su SDK, y la seguridad de los datos se garantiza a nivel de fila con Row Level Security (RLS).
┌─────────────────────────────┐        ┌──────────────────────────────────┐
│   APP MÓVIL (React Native)  │        │           SUPABASE (BaaS)         │
│                              │        │                                    │
│  Screens ── Hooks ── Services│ HTTPS  │  Auth (JWT) │ PostgreSQL │ RLS      │
│      │        │        │    │◄──────►│      │            │        │       │
│      ▼        ▼        ▼    │  REST  │      ▼            ▼        ▼       │
│  Navigation  State   Supabase│        │  Tablas · Vistas · Funciones RPC   │
│              (React)  Client │        │                                    │
└─────────────────────────────┘        └──────────────────────────────────┘

2.2 Stack tecnológico
Capa
Tecnología
Rol en el proyecto
Frontend
React Native 0.86 + Expo SDK 57
Framework base para la app móvil multiplataforma (iOS/Android/Web)
Frontend
TypeScript
Tipado estático en toda la base de código
Frontend
React Navigation (stack + bottom-tabs)
Enrutamiento y navegación entre pantallas
Frontend
react-native-chart-kit + react-native-svg
Gráficos de barras para comparativas de CO₂
Frontend
react-hook-form
Manejo de formularios (dependencia incluida en package.json)
Frontend
@react-native-async-storage/async-storage
Persistencia local de la sesión de Supabase Auth
Backend
Supabase
Plataforma BaaS: autenticación, base de datos y API
Backend
PostgreSQL
Motor de base de datos relacional subyacente
Backend
Row Level Security (RLS)
Control de acceso a datos a nivel de fila
Backend
@supabase/supabase-js
SDK cliente para consumir Auth y la API de datos


2.3 Convenciones y alias de importación
El proyecto usa el alias @/ (configurado con babel-plugin-module-resolver y tsconfig.json) para referenciar módulos internos desde la raíz de src/, por ejemplo:
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';

3. Backend — Supabase / PostgreSQL
El backend no cuenta con código de servidor propio; en su lugar, se define completamente mediante un script SQL (database/schema.sql) que se ejecuta una sola vez en el editor SQL de Supabase. Este script crea las tablas, los índices, las políticas de seguridad (RLS) y los datos semilla de los catálogos.
3.1 Autenticación
La autenticación se delega íntegramente a Supabase Auth (correo + contraseña):
El registro (signUp) crea el usuario en auth.users y, a continuación, inserta una fila correspondiente en la tabla profiles con el mismo id.
El inicio de sesión (signInWithPassword) devuelve una sesión JWT que el SDK persiste automáticamente en AsyncStorage (persistSession: true, autoRefreshToken: true).
El identificador de usuario (auth.uid()) es la clave que utilizan todas las políticas RLS para restringir el acceso a los datos de cada usuario.
3.2 Modelo de datos — resumen de tablas
Tabla
Tipo
Descripción
profiles
Usuario
Perfil extendido de cada usuario (1:1 con auth.users)
meal_types
Catálogo
Tipos de comida disponibles para registrar (res, pollo, vegana, etc.)
transport_types
Catálogo
Medios de transporte disponibles (auto, bus, bici, etc.)
carbon_factors
Catálogo
Factores de emisión de CO₂ por categoría/unidad
meals
Registro de actividad
Comidas registradas por el usuario
transport_records
Registro de actividad
Trayectos de transporte registrados
energy_records
Registro de actividad
Consumo eléctrico registrado (kWh)
tips
Catálogo
Consejos ambientales por categoría
competitions
Gamificación
Competencias/retos entre usuarios
competition_members
Gamificación
Relación N:M usuario ↔ competencia
achievements
Gamificación
Catálogo de logros posibles
user_achievements
Gamificación
Logros obtenidos por cada usuario


3.3 Diagrama entidad-relación (simplificado)
auth.users (Supabase Auth)
     │ 1:1
     ▼
 profiles ───────────────┬──────────────┬───────────────────┐
     │ 1:N                │ 1:N          │ 1:N                │ 1:N
     ▼                    ▼              ▼                    ▼
  meals             transport_records  energy_records   user_achievements
     │ N:1                │ N:1                              │ N:1
     ▼                    ▼                                  ▼
 meal_types        transport_types                    achievements
 
 profiles ──1:N── competition_members ──N:1── competitions
 carbon_factors (independiente, referenciada por categoría + reference_id)
 tips (independiente, de solo lectura)

3.4 Detalle de tablas
profiles
Perfil público de cada usuario; visible para todos (necesario para el ranking de competencias) pero solo editable por su dueño.
Columna
Tipo
Restricciones / Notas
id
uuid (PK)
Referencia a auth.users(id), ON DELETE CASCADE
username
text
Único, obligatorio
full_name
text
Opcional
avatar_url
text
Opcional
weekly_goal_kg
numeric
Meta semanal de CO₂; por defecto 50
green_points
integer
Puntos verdes acumulados; por defecto 0
current_streak
integer
Racha de días consecutivos; por defecto 0
created_at
timestamptz
Por defecto now()


Políticas RLS: 
SELECT: público (todos los perfiles son visibles, requerido para rankings).
INSERT: solo el propio usuario (auth.uid() = id).
UPDATE: solo el propio usuario (auth.uid() = id).

meal_types / transport_types / carbon_factors
Catálogos de solo lectura pública, usados para poblar los selectores del frontend y calcular emisiones.
Columna
Tipo
Restricciones / Notas
meal_types.id / name / category
serial / text / text
Ej.: Res (meat), Vegana (vegan)
transport_types.id / name / icon
serial / text (único) / text
Ej.: car 🚗, bike 🚲, walk 🚶
carbon_factors.id
serial (PK)
—
carbon_factors.category
text
'meal' | 'transport' | 'energy'
carbon_factors.reference_id
integer
FK lógica a meal_types.id o transport_types.id (nulo para energy)
carbon_factors.factor
numeric
kg de CO₂ por unidad
carbon_factors.unit
text
'portion' | 'km' | 'kwh'


Políticas RLS: 
SELECT: público en las tres tablas (Catalogo publico ...).
No existen políticas de INSERT/UPDATE/DELETE para usuarios finales; se gestionan por el equipo administrador vía SQL.

meals
Registro individual de una comida consumida por el usuario, con su emisión de CO₂ ya calculada por el cliente.
Columna
Tipo
Restricciones / Notas
id
uuid (PK)
default uuid_generate_v4()
user_id
uuid (FK → profiles.id)
ON DELETE CASCADE, obligatorio
meal_type_id
integer (FK → meal_types.id)
Obligatorio
portions
numeric
Por defecto 1
co2_kg
numeric
Calculado en el cliente antes de insertar
recorded_at
date
Por defecto current_date
created_at
timestamptz
Por defecto now()


Políticas RLS: 
SELECT / INSERT / UPDATE / DELETE: únicamente si auth.uid() = user_id.

Índice: idx_meals_user_date sobre (user_id, recorded_at) para acelerar las consultas de resumen semanal e historial.
transport_records
Registro de un trayecto de transporte con su distancia y emisión asociada.
Columna
Tipo
Restricciones / Notas
id
uuid (PK)
default uuid_generate_v4()
user_id
uuid (FK → profiles.id)
ON DELETE CASCADE, obligatorio
transport_type_id
integer (FK → transport_types.id)
Obligatorio
distance_km
numeric
Obligatorio
co2_kg
numeric
Calculado en el cliente
recorded_at
date
Por defecto current_date
created_at
timestamptz
Por defecto now()


Políticas RLS: 
SELECT / INSERT / UPDATE / DELETE: únicamente si auth.uid() = user_id.

Índice: idx_transport_user_date sobre (user_id, recorded_at).
energy_records
Registro de consumo eléctrico en kWh y su emisión asociada.
Columna
Tipo
Restricciones / Notas
id
uuid (PK)
default uuid_generate_v4()
user_id
uuid (FK → profiles.id)
ON DELETE CASCADE, obligatorio
kwh
numeric
Obligatorio
co2_kg
numeric
Calculado en el cliente
recorded_at
date
Por defecto current_date
created_at
timestamptz
Por defecto now()


Políticas RLS: 
SELECT / INSERT / UPDATE / DELETE: únicamente si auth.uid() = user_id.

Índice: idx_energy_user_date sobre (user_id, recorded_at).
tips
Catálogo de consejos ambientales, de solo lectura pública.
Columna
Tipo
Restricciones / Notas
id
serial (PK)
—
category
text
'meal' | 'transport' | 'energy' | 'general'
content
text
Texto del consejo
created_at
timestamptz
Por defecto now()


Políticas RLS: 
SELECT: público (Tips publicos).

competitions y competition_members
Modelan retos grupales entre usuarios, identificados por un código de invitación único generado automáticamente.
Columna
Tipo
Restricciones / Notas
competitions.id
uuid (PK)
default uuid_generate_v4()
competitions.name
text
Obligatorio
competitions.created_by
uuid (FK → profiles.id)
Obligatorio
competitions.start_date / end_date
date
Obligatorios
competitions.invite_code
text (único)
default substr(md5(random()::text),1,6)
competition_members.id
uuid (PK)
default uuid_generate_v4()
competition_members.competition_id
uuid (FK)
ON DELETE CASCADE
competition_members.user_id
uuid (FK → profiles.id)
ON DELETE CASCADE
competition_members.joined_at
timestamptz
Por defecto now(); UNIQUE(competition_id, user_id)


Políticas RLS: 
competitions · SELECT: solo miembros de la competencia o su creador.
competitions · INSERT: solo si auth.uid() = created_by.
competitions · UPDATE: solo el creador.
competition_members · SELECT: solo miembros de la misma competencia.
competition_members · INSERT: solo el propio usuario (auth.uid() = user_id) — unirse.
competition_members · DELETE: solo el propio usuario — salir.

Índice: idx_comp_members_comp sobre competition_id.
achievements y user_achievements
Catálogo de logros posibles y el registro de los logros que cada usuario ha desbloqueado.
Columna
Tipo
Restricciones / Notas
achievements.id
serial (PK)
—
achievements.name / description / icon
text
Ej.: 'Racha de 7 días' 🔥
achievements.points_reward
integer
Por defecto 0
user_achievements.id
uuid (PK)
default uuid_generate_v4()
user_achievements.user_id
uuid (FK → profiles.id)
ON DELETE CASCADE
user_achievements.achievement_id
integer (FK → achievements.id)
Obligatorio
user_achievements.achieved_at
timestamptz
Por defecto now(); UNIQUE(user_id, achievement_id)


Políticas RLS: 
achievements · SELECT: público (Logros publicos).
user_achievements · SELECT: solo el propio usuario.
user_achievements · INSERT: solo el propio usuario.

3.5 Datos semilla (seed data)
El script de esquema inserta datos iniciales para que la app sea funcional sin configuración adicional:
7 tipos de comida (Res, Cerdo, Pollo, Pescado, Lácteos, Vegetariana, Vegana) con sus factores de emisión (0.4 a 6.0 kg CO₂/porción).
7 tipos de transporte (car, motorcycle, bus, taxi, metro, bike, walk) con sus factores por km (0 a 0.211 kg CO₂/km; bici y caminata en 0).
Factor de energía: 0.385 kg CO₂/kWh.
7 consejos ambientales distribuidos en las categorías meal, transport, energy y general.
4 logros base: 'Primer registro', 'Semana verde', 'Racha de 7 días', 'Competidor'.
3.6 Función RPC pendiente
El servicio de frontend competitionsService.ts invoca una función remota mediante supabase.rpc('join_competition_by_code', { p_invite_code }) para unir a un usuario a una competencia buscando por su código de invitación. Esta función de PostgreSQL (PL/pgSQL) debe crearse en Supabase mediante CREATE FUNCTION; no se encuentra definida en el schema.sql actual del proyecto, por lo que la funcionalidad de "Unirme por código" requiere esta pieza adicional en el backend para operar correctamente. Se recomienda una función SECURITY DEFINER que valide el código, inserte en competition_members y devuelva la fila de competitions.

4. Frontend — Aplicación móvil (React Native + Expo)
4.1 Estructura de carpetas
ecotracker/
├── App.tsx                     # Punto de entrada; monta RootNavigator
├── app.json                    # Configuración de Expo
├── database/schema.sql         # Esquema completo de Supabase
└── src/
    ├── components/
    │   ├── ui/                 # Button, Card, Input, ProgressBar
    │   └── charts/             # WeeklyChart
    ├── constants/              # colors.ts, transportTypes.ts
    ├── hooks/                  # useAuth, useCarbonFootprint, useCompetitions
    ├── navigation/             # RootNavigator, AuthStack, AppTabs
    ├── screens/
    │   ├── auth/                (Splash, Login, Register)
    │   ├── home/                (Dashboard)
    │   ├── activity/            (RegisterActivity, Meal, Transport, Energy)
    │   ├── history/             (History)
    │   ├── stats/               (Stats)
    │   ├── tips/                (Tips)
    │   ├── competitions/        (Competitions, CompetitionDetail, Ranking)
    │   └── profile/             (Profile)
    ├── services/               # Un archivo por dominio, sobre supabase.ts
    ├── types/                  # database.types.ts
    └── utils/                  # co2Calculations.ts, dateUtils.ts

4.2 Navegación
La navegación se organiza en tres niveles anidados, todos con headerShown: false (cada pantalla dibuja su propio encabezado):
Componente
Tipo
Responsabilidad
RootNavigator
NavigationContainer
Decide entre AuthStack o AppTabs según haya sesión activa (useAuth); muestra SplashScreen mientras carga
AuthStack
Native Stack
Login ↔ Register
AppTabs
Bottom Tabs (5) con Stacks internos
Inicio, Registrar, Estadísticas, Competencias, Perfil
HomeStack
Native Stack (dentro de Inicio)
Dashboard → History
RegisterStack
Native Stack (dentro de Registrar)
RegisterActivity → Meal / Transport / Energy
StatsStack
Native Stack (dentro de Estadísticas)
Stats → Tips
CompetitionsStack
Native Stack (dentro de Competencias)
Competitions → Ranking / CompetitionDetail


RootNavigator
  └─ (sin sesión) AuthStack: Login ⇄ Register
  └─ (con sesión) AppTabs
        ├─ Inicio      → Dashboard → History
        ├─ Registrar   → RegisterActivity → Meal | Transport | Energy
        ├─ Estadísticas→ Stats → Tips
        ├─ Competencias→ Competitions → Ranking | CompetitionDetail
        └─ Perfil      → Profile

4.3 Pantallas (screens)
SplashScreen
Archivo: src/screens/auth/SplashScreen.tsx
Pantalla de carga inicial mostrada mientras useAuth resuelve si existe una sesión de Supabase activa.
Sin lógica ni props: solo presenta logo, nombre de la app y un ActivityIndicator.

LoginScreen
Archivo: src/screens/auth/LoginScreen.tsx
Formulario de inicio de sesión con correo y contraseña.
Valida que ambos campos estén completos antes de llamar a signIn().
Muestra Alert nativo en caso de error de autenticación.
Enlaza a RegisterScreen mediante un botón 'ghost'.

RegisterScreen
Archivo: src/screens/auth/RegisterScreen.tsx
Formulario de creación de cuenta (usuario, correo, contraseña).
Valida campos requeridos y longitud mínima de contraseña (6 caracteres).
Llama a signUp(), que crea el usuario en Auth y su fila en profiles.
Tras el éxito, redirige a Login mostrando una alerta de confirmación.

DashboardScreen
Archivo: src/screens/home/DashboardScreen.tsx
Pantalla principal ('Inicio'): resumen semanal de la huella de carbono del usuario.
Usa useAuth (perfil) y useCarbonFootprint (totales de la semana actual y anterior).
Se recarga automáticamente al recibir foco de navegación (listener 'focus').
Calcula progreso respecto a la meta semanal (weekly_goal_kg) y variación porcentual vs. la semana anterior (percentChange).
Muestra tarjetas por categoría (comida, transporte, energía), promedio diario, un WeeklyChart de barras y el 'consejo del día' (getTipOfTheDay).
Enlaza a HistoryScreen ('Ver historial completo').

RegisterActivityScreen
Archivo: src/screens/activity/RegisterActivityScreen.tsx
Menú de selección de categoría de actividad a registrar.
Presenta tres tarjetas (Comida, Transporte, Energía) que navegan a Meal, Transport o Energy respectivamente.

MealScreen
Archivo: src/screens/activity/MealScreen.tsx
Formulario de registro de una comida.
Carga meal_types y los carbon_factors de categoría 'meal' al montar.
Permite elegir el tipo mediante chips seleccionables e indicar las porciones.
Calcula la emisión estimada en tiempo real con calculateCO2(portions, factor).
Al guardar, llama a addMeal() y regresa a la pantalla anterior.

TransportScreen
Archivo: src/screens/activity/TransportScreen.tsx
Formulario de registro de un trayecto de transporte (mismo patrón que MealScreen).
Carga transport_types y los carbon_factors de categoría 'transport'.
El usuario ingresa la distancia en kilómetros; el CO₂ estimado se recalcula en vivo.
Guarda con addTransportRecord().

EnergyScreen
Archivo: src/screens/activity/EnergyScreen.tsx
Formulario de registro de consumo eléctrico.
Usa el factor único de categoría 'energy' (kg CO₂/kWh).
El usuario ingresa los kWh consumidos; guarda con addEnergyRecord().

HistoryScreen
Archivo: src/screens/history/HistoryScreen.tsx
Listado combinado y filtrable de todos los registros del usuario (comidas, transporte, energía).
Combina los tres orígenes de datos en una lista unificada Row[], ordenada por fecha descendente.
Filtros por categoría: Todo / Comida / Transporte / Energía.
Mantener presionado (onLongPress) un ítem lo elimina, invocando el delete* del servicio correspondiente.
Se recarga al recibir foco de navegación; soporta 'pull to refresh'.

StatsScreen
Archivo: src/screens/stats/StatsScreen.tsx
Estadísticas comparativas de la huella de carbono.
Reutiliza useCarbonFootprint para semana actual vs. anterior.
Dos gráficos WeeklyChart: comparación semanal y distribución por categoría.
Enlaza a TipsScreen ('Ver consejos ambientales').

TipsScreen
Archivo: src/screens/tips/TipsScreen.tsx
Listado de consejos ambientales filtrable por categoría (Todos, Comida, Transporte, Energía, General).

CompetitionsScreen
Archivo: src/screens/competitions/CompetitionsScreen.tsx
Listado de competencias del usuario, con acciones para crear o unirse a una.
'Crear' abre un modal para nombrar la competencia; internamente fija una duración de 7 días desde hoy y llama a createCompetition().
'Unirme' abre un modal para introducir un código de invitación y llama a joinCompetitionByCode().
Cada competencia navega a CompetitionDetailScreen mostrando su ranking.

CompetitionDetailScreen
Archivo: src/screens/competitions/CompetitionDetailScreen.tsx
Ranking de una competencia específica, recibida por parámetros de ruta (competitionId, name).
Obtiene y ordena a los participantes por puntos verdes descendentes mediante getCompetitionRanking().

RankingScreen
Archivo: src/screens/competitions/RankingScreen.tsx
Pantalla auxiliar de ranking global, actualmente informativa (indica al usuario seleccionar una competencia para ver su detalle).

ProfileScreen
Archivo: src/screens/profile/ProfileScreen.tsx
Perfil del usuario: puntos verdes, racha, logros obtenidos, meta semanal y cierre de sesión.
Carga los logros del usuario con getUserAchievements().
El botón 'Cerrar sesión' pide confirmación mediante Alert antes de invocar signOut().


4.4 Componentes de interfaz reutilizables
Componente
Props principales
Descripción
Button
title, onPress, variant ('primary'|'outline'|'ghost'), loading, disabled, style
Botón táctil con estado de carga (ActivityIndicator) y tres variantes visuales
Card
children, style
Contenedor con fondo, bordes redondeados y sombra suave; base visual de casi toda la app
Input
label, error, ...TextInputProps
Campo de texto con etiqueta y mensaje de error opcional
ProgressBar
progress (0–1), color
Barra de progreso usada para visualizar el avance hacia la meta semanal
WeeklyChart
labels: string[], data: number[]
Envoltorio de BarChart (react-native-chart-kit) estilizado con la paleta de la app


4.5 Hooks personalizados
useAuth()
Ubicado en src/hooks/useAuth.ts. Centraliza el estado de sesión y perfil:
Se suscribe a supabase.auth.getSession() y a onAuthStateChange para mantener session sincronizada.
Cuando hay sesión, carga el perfil asociado con getProfile().
Expone { session, profile, loading, refreshProfile }.
useCarbonFootprint(userId)
Ubicado en src/hooks/useCarbonFootprint.ts. Obtiene, en paralelo, el resumen de emisiones de la semana actual y de la anterior mediante getWeeklySummary(), usando los rangos calculados por getWeekRange(). Expone { current, previous, loading, reload }.
useCompetitions(userId)
Ubicado en src/hooks/useCompetitions.ts. Carga las competencias a las que pertenece el usuario mediante getUserCompetitions(). Expone { competitions, loading, reload }.

4.6 Capa de servicios (acceso a datos)
Cada archivo de src/services/ encapsula las consultas a Supabase de un dominio concreto, de modo que las pantallas nunca invocan al cliente de Supabase directamente (salvo supabase.ts, que es el cliente centralizado).
supabase.ts
Crea e inicializa el cliente con createClient(), usando AsyncStorage como almacenamiento de sesión y las variables de entorno EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY.
authService.ts
Función
Descripción
signUp(email, password, username)
Crea el usuario en Auth y su perfil en profiles
signIn(email, password)
Inicia sesión con correo y contraseña
signOut()
Cierra la sesión activa
getCurrentSession()
Devuelve la sesión actual almacenada
getProfile(userId)
Obtiene el perfil de un usuario
updateProfile(userId, updates)
Actualiza campos del perfil

carbonService.ts
Función
Descripción
getCarbonFactors(category)
Obtiene los factores de emisión de una categoría ('meal'|'transport'|'energy')
calculateCO2(quantity, factor)
Calcula kg de CO₂ redondeando a 3 decimales
getWeeklySummary(userId, weekStart, weekEnd)
Suma en paralelo las emisiones de meals, transport_records y energy_records en un rango de fechas, y devuelve { meals, transport, energy, total }

mealsService.ts / transportService.ts / energyService.ts
Siguen el mismo patrón CRUD para cada categoría de actividad:
Función
Descripción
getMealTypes() / getTransportTypes()
Obtienen el catálogo correspondiente
addMeal(...) / addTransportRecord(...) / addEnergyRecord(...)
Insertan un nuevo registro con su co2_kg ya calculado
getMeals(userId, limit) / getTransportRecords(...) / getEnergyRecords(...)
Listan registros del usuario, más recientes primero, con datos del catálogo asociado (join)
deleteMeal(id) / deleteTransportRecord(id) / deleteEnergyRecord(id)
Eliminan un registro por id

competitionsService.ts
Función
Descripción
createCompetition(name, createdBy, startDate, endDate)
Crea la competencia y añade al creador como primer miembro
joinCompetitionByCode(inviteCode, userId)
Invoca la función RPC join_competition_by_code (ver sección 3.6)
getUserCompetitions(userId)
Lista las competencias a las que pertenece el usuario
getCompetitionRanking(competitionId)
Devuelve los miembros ordenados por green_points descendente

achievementsService.ts
Función
Descripción
getUserAchievements(userId)
Logros obtenidos por el usuario, con datos del catálogo achievements
getAllAchievements()
Catálogo completo de logros
addGreenPoints(userId, points, currentPoints)
Suma puntos verdes al perfil del usuario

tipsService.ts
Función
Descripción
getTips(category?)
Lista consejos, opcionalmente filtrados por categoría
getTipOfTheDay()
Selecciona un consejo determinístico según el día del mes (new Date().getDate() % total)


4.7 Utilidades
co2Calculations.ts
Función
Descripción
co2FromFactor(quantity, factor)
cantidad × factor, redondeado a 3 decimales
formatCO2(kg)
Formatea en gramos si kg < 1, o con 2 decimales + 'kg' en caso contrario
percentChange(current, previous)
Variación porcentual entre dos periodos; devuelve 100% si previous es 0 y current > 0

dateUtils.ts
Función
Descripción
todayISO()
Fecha actual en formato AAAA-MM-DD
getWeekRange(offsetWeeks)
Calcula el lunes y domingo de la semana actual (offset 0) o de semanas anteriores/futuras
formatDate(dateStr)
Formatea una fecha ISO a texto corto en español (es-CO), p. ej. '08 sept.'


4.8 Constantes y tema visual
src/constants/colors.ts define la paleta de la aplicación (verde/sostenibilidad) mediante dos temas — lightColors y darkColors — más las escalas de spacing y radius usadas en todos los estilos:
Token
Valor (claro)
Uso
primary
#0F5132
Color principal de marca, textos destacados, botones
secondary
#52B788
Indicadores positivos, barra de progreso
background
#F4F9F6
Fondo general de pantallas
surface
#FFFFFF
Fondo de tarjetas e inputs
danger
#D64545
Alertas y superación de meta
meal / transport / energy
#E76F51 / #457B9D / #E9C46A
Colores de acento por categoría de actividad

src/constants/transportTypes.ts mapea el nombre de cada medio de transporte a su emoji representativo (TRANSPORT_ICONS), usado en HistoryScreen.

4.9 Tipos TypeScript del dominio
src/types/database.types.ts define las interfaces que reflejan el esquema de Supabase, garantizando tipado punta a punta entre backend y frontend: Profile, MealType, TransportType, CarbonFactor, Meal, TransportRecord, EnergyRecord, Tip, Competition, CompetitionMember y Achievement.

5. Flujos de usuario
5.1 Registro e inicio de sesión
El usuario abre la app; SplashScreen se muestra mientras useAuth verifica si hay una sesión persistida en AsyncStorage.
Sin sesión activa, se presenta AuthStack (Login). El usuario puede crear una cuenta desde RegisterScreen.
signUp() crea el usuario en Supabase Auth y su perfil en profiles con el username elegido.
Tras iniciar sesión, onAuthStateChange actualiza session y useAuth carga el perfil; RootNavigator cambia automáticamente a AppTabs.
5.2 Registrar una actividad y calcular su huella
Desde la pestaña 'Registrar', el usuario elige Comida, Transporte o Energía.
La pantalla correspondiente carga el catálogo relevante (meal_types o transport_types) y los carbon_factors de su categoría.
El usuario indica cantidad (porciones, km o kWh); el CO₂ estimado se recalcula en vivo con calculateCO2().
Al guardar, el registro se inserta ya con su co2_kg calculado, y la app regresa a la pantalla anterior.
5.3 Consulta de progreso
En 'Inicio', DashboardScreen recalcula los totales de la semana en curso y de la anterior cada vez que la pantalla recibe foco.
Se compara el total semanal contra la meta (weekly_goal_kg) mediante una barra de progreso, y contra la semana previa mediante un porcentaje de variación.
En 'Estadísticas', StatsScreen ofrece una vista comparativa adicional y acceso a los consejos ambientales (Tips).
5.4 Historial y edición
HistoryScreen combina meals, transport_records y energy_records en una sola lista ordenada por fecha.
El usuario puede filtrar por categoría y eliminar un registro manteniendo presionado sobre él.
5.5 Competencias
Desde 'Competencias', el usuario puede crear un reto (nombre + duración fija de 7 días) o unirse con un código de invitación.
Al crear, el usuario queda automáticamente como primer miembro de la competencia.
Al entrar al detalle de una competencia, se muestra el ranking de participantes ordenado por green_points.
5.6 Perfil y cierre de sesión
ProfileScreen muestra puntos verdes, racha actual, meta semanal y logros obtenidos (user_achievements).
El botón 'Cerrar sesión' solicita confirmación y, al aceptar, invoca signOut(), lo que hace que RootNavigator vuelva a mostrar AuthStack.

6. Lógica de cálculo de huella de carbono
El cálculo de emisiones es la lógica de negocio central de EcoTracker y se mantiene deliberadamente simple y centralizada para evitar duplicación entre pantallas.
6.1 Fórmula general
CO2 (kg) = cantidad × factor_de_emisión
Donde cantidad es porciones (comida), kilómetros (transporte) o kWh (energía), y factor_de_emisión proviene de la tabla carbon_factors según la categoría y, cuando aplica, el reference_id del tipo específico. El resultado se redondea a 3 decimales mediante calculateCO2() / co2FromFactor().
6.2 Factores de referencia (seed data)
Categoría
Referencia
Factor
Unidad
Comida
Res
6.0
kg CO₂ / porción
Comida
Cerdo
3.6
kg CO₂ / porción
Comida
Pollo
1.6
kg CO₂ / porción
Comida
Pescado
2.9
kg CO₂ / porción
Comida
Lácteos
1.2
kg CO₂ / porción
Comida
Vegetariana
0.7
kg CO₂ / porción
Comida
Vegana
0.4
kg CO₂ / porción
Transporte
Auto
0.192
kg CO₂ / km
Transporte
Motocicleta
0.103
kg CO₂ / km
Transporte
Bus
0.089
kg CO₂ / km
Transporte
Taxi
0.211
kg CO₂ / km
Transporte
Metro
0.041
kg CO₂ / km
Transporte
Bicicleta / Caminata
0
kg CO₂ / km
Energía
Red eléctrica
0.385
kg CO₂ / kWh

Nota: estos valores son de referencia educativa y pueden ajustarse actualizando la tabla carbon_factors sin necesidad de modificar el código del cliente, ya que el frontend siempre los consulta dinámicamente.
6.3 Comparativas y metas
Resumen semanal: getWeeklySummary() suma en paralelo el co2_kg de las tres tablas de actividad dentro de un rango de fechas (lunes a domingo, vía getWeekRange()).
Progreso hacia la meta: total de la semana ÷ weekly_goal_kg del perfil, visualizado con ProgressBar (se tiñe de rojo si se supera el 100%).
Variación semanal: percentChange(actual, anterior), mostrando una flecha ↓ (mejora) o ↑ (empeora).

7. Instalación y puesta en marcha
7.1 Requisitos previos
Node.js y npm.
Cuenta gratuita en Supabase (https://supabase.com).
App Expo Go (Android/iOS) o un emulador, para probar la aplicación.
7.2 Configuración del backend (Supabase)
Crear un nuevo proyecto en Supabase.
Abrir el SQL Editor y ejecutar el contenido completo de database/schema.sql (crea tablas, políticas RLS y datos semilla).
En Project Settings → API, copiar la Project URL y la anon public key.
(Recomendado) Crear la función RPC join_competition_by_code descrita en la sección 3.6, necesaria para que 'Unirme por código' funcione.
7.3 Configuración del frontend
cp .env.example .env
Completar en .env:
EXPO_PUBLIC_SUPABASE_URL=<Project URL>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
7.4 Instalación y ejecución
npm install
npx expo start
Escanear el código QR con Expo Go, o presionar a (Android) / i (iOS) para abrir en un emulador.

8. Consideraciones de seguridad
Toda la autorización de datos se implementa a nivel de base de datos mediante RLS, no en el cliente: cada tabla de actividad y de gamificación filtra por auth.uid() = user_id.
Los catálogos (meal_types, transport_types, carbon_factors, tips, achievements) son de solo lectura pública; no exponen políticas de escritura para usuarios finales.
profiles es legible por todos los usuarios autenticados (requerido para los rankings), pero solo el dueño puede modificarlo — cualquier dato sensible no debería almacenarse en esta tabla.
La sesión (JWT) se persiste localmente con AsyncStorage y se renueva automáticamente (autoRefreshToken: true); no se maneja detectSessionInUrl, ya que no aplica a apps móviles.
La anon key de Supabase es pública por diseño (se distribuye con el cliente); la seguridad real recae íntegramente en las políticas RLS, por lo que cualquier tabla nueva debe habilitar RLS y definir sus políticas antes de salir a producción.

9. Limitaciones conocidas y trabajo futuro
Según el propio README del proyecto y el análisis del código:
Asignación automática de logros y rachas: los servicios (achievementsService.ts) existen, pero falta el disparador (trigger o Edge Function de Supabase) que detecte automáticamente cuándo un usuario cumple una condición de logro o incrementa su racha.
La función RPC join_competition_by_code es invocada por el cliente pero no está incluida en database/schema.sql; debe crearse en Supabase para que la función 'Unirme a competencia por código' opere en producción.
Los consejos ambientales (tips) son generales y rotativos por fecha (getTipOfTheDay); no existe personalización según el historial real del usuario.
RankingScreen es actualmente una pantalla informativa placeholder; no implementa un ranking global entre todos los usuarios de la app, solo se navega al ranking de una competencia específica desde CompetitionDetailScreen.
El tema oscuro (darkColors) está definido en constants/colors.ts pero no conectado a un ThemeContext ni a un selector en la interfaz; el export colors usa siempre lightColors.

Anexo A — Esquema SQL completo (database/schema.sql)
A continuación se referencia la ubicación del script fuente. Por su extensión, el contenido íntegro se conserva en el repositorio del proyecto en database/schema.sql; las secciones 3.2 a 3.6 de este documento resumen su contenido tabla por tabla, incluyendo columnas, restricciones, índices y políticas RLS.

Orden de secciones del script: 
Extensión uuid-ossp
Tabla profiles + RLS
Catálogos: meal_types, transport_types, carbon_factors + RLS
Tabla meals + índice + RLS
Tabla transport_records + índice + RLS
Tabla energy_records + índice + RLS
Tabla tips + RLS
Tablas competitions y competition_members + índice + RLS
Tablas achievements y user_achievements + RLS
Datos semilla: tipos de comida, transporte, factores de carbono, tips y logros
