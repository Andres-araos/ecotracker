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

## Estructura del proyecto
```
src/
  components/    # UI reutilizable (Button, Card, Input, ProgressBar, WeeklyChart)
  screens/       # Pantallas agrupadas por dominio (auth, home, activity, history, stats, tips, competitions, profile)
  navigation/     # AuthStack, AppTabs, RootNavigator
  services/       # Un servicio por dominio, todos sobre el cliente Supabase centralizado
  hooks/          # useAuth, useCarbonFootprint, useCompetitions
  utils/          # Cálculo de CO2 y manejo de fechas
  constants/      # Colores, spacing, iconos de transporte
  types/          # Tipos TypeScript de la base de datos
database/
  schema.sql      # Tablas, RLS y datos semilla
```

## Flujo de la app
1. **Splash → Login/Registro** (Supabase Auth, sesión persistente con AsyncStorage).
2. **Dashboard**: huella semanal, comparación vs. semana anterior, meta, gráfico por categoría, tip del día.
3. **Registrar**: elegir Comida / Transporte / Energía → cálculo automático de CO₂ con factores desde `carbon_factors`.
4. **Historial**: registros combinados con filtro por categoría; mantener presionado para eliminar.
5. **Estadísticas**: comparación semanal y distribución por categoría.
6. **Competencias**: crear/unirse por código, ver ranking por puntos verdes.
7. **Perfil**: puntos verdes, racha, logros, meta semanal, cerrar sesión.

## Notas de diseño
- Paleta verde/sostenibilidad (`src/constants/colors.ts`), tarjetas con sombra suave, navegación inferior con 5 pestañas.
- Cálculo de CO₂ centralizado en `services/carbonService.ts` para no duplicar lógica entre pantallas.
- RLS: cada usuario solo lee/escribe sus propios registros; catálogos (`meal_types`, `transport_types`, `carbon_factors`, `tips`, `achievements`) son de lectura pública; `profiles` es visible para todos (necesario para rankings).

## Pendiente / mejoras futuras
- Lógica de asignación automática de logros y rachas (actualmente los servicios existen; falta el trigger/edge function que los dispare).
- Personalización de tips según historial del usuario (hoy son consejos generales rotativos).
