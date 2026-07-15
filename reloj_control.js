/**
 * SISTEMA AUTOMATIZADO DE CONCORDANCIA PARA RELOJ CONTROL BIOMÉTRICO
 * 
 * Desarrollado para automatizar la lectura de confirmaciones de marcas desde Gmail
 * y estructurarlas en Google Sheets para su posterior visualización en Looker Studio.
 * 
 * Beneficio: Evita la revisión manual de bandejas de entrada y previene olvidos de marcas.
 */

// --- CONFIGURACIÓN GLOBAL ---
const CONFIG = {
  // Cambia esto por el remitente real de tu sistema de marcación
  REMITENTE_SISTEMA: "enviomarcaciones@mg.bionicvision.cl", 
  
  // Asunto exacto que envía el sistema de reloj control
  ASUNTO_CORREO: "Aviso de registro de marca en reloj control", 
  
  // Cantidad de hilos de correo a procesar en cada ejecución automatizada
  LIMITE_BUSQUEDA: 100 
};

function procesarCorreosMarcacion() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Filtro de búsqueda exacto en Gmail
  const busquedaGmail = `from:${CONFIG.REMITENTE_SISTEMA} subject:"${CONFIG.ASUNTO_CORREO}"`; 
  const hilos = GmailApp.search(busquedaGmail, 0, CONFIG.LIMITE_BUSQUEDA);
  
  const filasExistentes = sheet.getLastRow();
  let idsRegistrados = [];
  
  // Evitar duplicar registros leyendo la columna G (ID único de correo)
  if (filasExistentes > 1) {
    idsRegistrados = sheet.getRange(2, 7, filasExistentes - 1, 1).getValues().flat();
  }

  // Procesar hilos desde el más antiguo al más reciente
  for (let i = hilos.length - 1; i >= 0; i--) {
    const mensajes = hilos[i].getMessages();
    
    for (let j = 0; j < mensajes.length; j++) {
      const mensaje = mensajes[j];
      const idMensaje = mensaje.getId();
      
      // Omitir si ya fue procesado previamente
      if (idsRegistrados.indexOf(idMensaje) !== -1) {
        continue;
      }
      
      const cuerpo = mensaje.getPlainBody();
      const fechaRecepcion = mensaje.getDate();
      const remitente = mensaje.getFrom();
      
      // Formatear tiempos de recepción
      const fechaRecibidoFormateada = Utilities.formatDate(fechaRecepcion, Session.getScriptTimeZone(), "dd/MM/yyyy");
      const horaRecibidoFormateada = Utilities.formatDate(fechaRecepcion, Session.getScriptTimeZone(), "HH:mm:ss");
      
      // --- EXTRACCIÓN MEDIANTE EXPRESIONES REGULARES (REGEX) ---
      // Patrones basados en la estructura del correo de marcas chileno promedio
      const regexFecha = /día\s+(\d{2}\/\d{2}\/\d{4})/i;
      const regexTipo = /una\s+(Entrada|Salida)/i;
      const regexHora = /a las\s+(\d{2}:\d{2})/i;
      
      const matchFecha = cuerpo.match(regexFecha);
      const matchTipo = cuerpo.match(regexTipo);
      const matchHora = cuerpo.match(regexHora);
      
      let fechaMarcacion = matchFecha ? matchFecha[1] : "No detectada";
      const tipoMarcacion = matchTipo ? matchTipo[1] : "No detectado";
      const horaMarcacion = matchHora ? matchHora[1] : "No detectada";
      
      if (fechaMarcacion === "No detectada") {
        fechaMarcacion = fechaRecibidoFormateada;
      }
      
      // Escribir fila en Google Sheets
      sheet.appendRow([
        fechaMarcacion,          // Columna A: Fecha de marca real
        horaMarcacion,           // Columna B: Hora de marca real
        tipoMarcacion,           // Columna C: Entrada / Salida
        fechaRecibidoFormateada, // Columna D: Fecha recepción correo
        horaRecibidoFormateada,  // Columna E: Hora recepción correo
        remitente,               // Columna F: Remitente
        idMensaje                // Columna G: ID único (Control de duplicación)
      ]);
    }
  }
}
