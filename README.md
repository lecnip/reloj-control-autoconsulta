# reloj-control-autoconsulta
Sistema automatizado para el control de marcas de asistencia (reloj control) mediante Google Suite.
# 🕒 Autoconsulta y Alerta de Reloj Control (Google Suite)

Este proyecto nace para resolver un problema común en el ámbito laboral y de la administración pública: la carga diaria de trabajo impide estar atentos a los correos verificadores de marcación de asistencia, lo que suele derivar en marcas faltantes u olvidadas que luego requieren justificaciones formales (memorándums).

Esta solución **100% automatizada y gratuita** utiliza las herramientas de la suite institucional de Google (Gmail, Sheets, Apps Script y Looker Studio) para leer tu bandeja de entrada, estructurar tus registros de entrada/salida y avisarte visualmente si te falta alguna marca.

---

## 🛠️ Arquitectura del Sistema

1. **Gmail:** Recibe las notificaciones automáticas del sistema de reloj control (por ejemplo, correos enviados desde `enviomarcaciones@mg.bionicvision.cl`).
2. **Google Apps Script:** Un script en segundo plano revisa tu correo periódicamente, procesa el texto, extrae la fecha, hora y el tipo de marca (Entrada/Salida), y lo guarda en una planilla de cálculo.
3. **Google Sheets:** Funciona como base de datos y genera una hoja de control lógico diario para contrastar marcas.
4. **Google Looker Studio:** Un panel visual interactivo (Dashboard) donde puedes ver tus días trabajados y un cuadro de alertas de marcas faltantes.

---

## 📋 Requisitos Previos

Tener una cuenta institucional de Google Workspace con acceso a:
* Gmail
* Google Drive (Sheets)
* Google Apps Script
* Google Looker Studio

---

## 🚀 Guía de Instalación Paso a Paso

### Paso 1: Configurar el Google Sheets
Crea una hoja de cálculo en tu Drive llamada `registro de marcaciones` con dos pestañas (hojas):

#### Pestaña 1: "Hoja 1"
Esta pestaña recibirá los datos en bruto desde tu Gmail. En la primera fila, define estos encabezados en las columnas **A hasta la G**:
* **A:** `Fecha`
* **B:** `Hora`
* **C:** `Asunto Correo` (Aquí se guardará "Entrada" o "Salida")
* **D:** `Fecha Recepción`
* **E:** `Hora Recepción`
* **F:** `Remitente`
* **G:** `ID Correo`

#### Pestaña 2: "Control_Diario"
Esta pestaña calculará de forma lógica si tus días están completos o si te falta marcar. En la primera fila, define estos encabezados en las columnas **A hasta la D**:
* **A:** `Fecha` -> Agrega en **A2** la fórmula: `=UNIQUE('Hoja 1'!A2:A)`
* **B:** `¿Tiene Entrada?` -> Agrega en **B2** la fórmula: `=SI(A2=""; ""; SI(COUNTIFS('Hoja 1'!$A$2:$A; A2; 'Hoja 1'!$C$2:$C; "Entrada")>0; "✅ Sí"; "❌ Faltante"))`
* **C:** `¿Tiene Salida?` -> Agrega en **C2** la fórmula: `=SI(A2=""; ""; SI(COUNTIFS('Hoja 1'!$A$2:$A; A2; 'Hoja 1'!$C$2:$C; "Salida")>0; "✅ Sí"; "❌ Faltante"))`
* **D:** `Estado del Día` -> Agrega en **D2** la fórmula: `=SI(A2=""; ""; SI(Y(B2="✅ Sí"; C2="✅ Sí"); "Completo"; SI(Y(B2="❌ Faltante"; C2="❌ Faltante"); "Sin marcas"; "⚠️ Alerta: Marca Faltante")))`

*(Recuerda arrastrar las fórmulas de B2, C2 y D2 hacia abajo para cubrir tus filas).*

---

### Paso 2: Implementar el Script
1. En tu Google Sheets, ve a **Extensiones** > **Apps Script**.
2. Borra el código por defecto y pega el código del archivo `codigo.js` de este repositorio.
3. Ajusta las variables de configuración en la constante `CONFIG` (remitente y asunto del correo del reloj de tu institución).
4. Haz clic en **Guardar** (💾) y presiona **Ejecutar** (▶️).
5. Otorga los permisos de seguridad necesarios en tu cuenta de Google.

---

### Paso 3: Automatizar la lectura (Activador)
Para que el proceso funcione solo en segundo plano:
1. Dentro de Apps Script, ve al menú lateral izquierdo y haz clic en el reloj (**Activadores**).
2. Haz clic en **+ Añadir activador** (abajo a la derecha).
3. Configúralo con un evento "Según tiempo", de tipo "Temporizador por horas" y que se ejecute "Cada hora".

---

### Paso 4: Diseñar tu Reporte en Looker Studio
1. Entra a [Looker Studio](https://lookerstudio.google.com/) y crea un informe vacío.
2. Conéctalo a tu hoja de cálculo `registro de marcaciones`.
3. Añade la pestaña `Hoja 1` para tu bitácora de marcas y la pestaña `Control_Diario` para generar alertas.
4. En la tabla de alertas de Looker Studio, aplica un **Filtro** para **Excluir** las filas donde el campo `Estado del Día` sea igual a `Completo`. ¡Así solo verás en pantalla tus marcas olvidadas!

---

## 🌟 Contribuciones e Impacto
Este proyecto es de código abierto. Si encuentras mejoras en las expresiones regulares para leer correos de otros proveedores de reloj control, ¡siéntete libre de abrir un Pull Request! 

¡Esperamos que esta automatización alivie la carga mental de muchos trabajadores y optimice sus procesos de asistencia diaria!
