// MAT-117 · Desafío final
// Reto D: huerto óptimo  |  Reto E: panadería

// ---------- Funciones auxiliares ----------
function texto(n, decimales) {
  // número -> texto con coma decimal (ej. 1428.94 -> "1428,94")
  if (Math.abs(n) < 1e-9) n = 0;
  return n.toFixed(decimales === undefined ? 2 : decimales).replace('.', ',');
}

function leer(id) {
  var valor = document.getElementById(id).value.trim();
  if (valor === '') return NaN;
  return Number(valor.replace(',', '.'));
}

function mostrarError(id, mensaje) {
  var p = document.getElementById(id);
  p.textContent = mensaje;
  p.hidden = (mensaje === '');
}

function fila(celdas) {
  return '<tr><td>' + celdas.join('</td><td>') + '</td></tr>';
}

function filaConTitulo(titulo, celdas) {
  return '<tr><th scope="row">' + titulo + '</th><td>' + celdas.join('</td><td>') + '</td></tr>';
}

function comprobacion(correcto, mensaje) {
  return '<li class="' + (correcto ? 'ok' : 'mal') + '">' + mensaje + '</li>';
}

// ---------- Reto D: huerto ----------
// y = P/2 - x   |   A(x) = x(P/2 - x)   |   A'(x) = P/2 - 2x   |   x* = P/4
function ancho(P, x) { return P / 2 - x; }
function area(P, x) { return x * (P / 2 - x); }
function derivada(P, x) { return P / 2 - 2 * x; }

function tendencia(d) {
  if (d > 0) return 'creciente';
  if (d < 0) return 'decreciente';
  return 'máximo';
}

function calcularHuerto(evento) {
  if (evento) evento.preventDefault();

  var P = leer('h-cerco');
  var x1 = leer('h-x1');
  var x2 = leer('h-x2');

  // Validación
  var error = '';
  if (isNaN(P) || isNaN(x1) || isNaN(x2)) {
    error = 'Completa todos los campos con números.';
  } else if (P <= 0) {
    error = 'El cerco debe ser mayor que 0.';
  } else if (x1 <= 0 || x1 >= P / 2 || x2 <= 0 || x2 >= P / 2) {
    error = 'Cada largo debe estar entre 0 y ' + texto(P / 2) + ' m.';
  }
  mostrarError('h-error', error);
  document.getElementById('h-resultados').hidden = (error !== '');
  if (error) return;

  var xOptimo = P / 4;
  var areaMax = area(P, xOptimo);

  // Comparación de dos escenarios
  var xs = [x1, x2];
  var nombres = ['Escenario A', 'Escenario B'];
  var html = '';
  for (var i = 0; i < 2; i++) {
    var x = xs[i];
    var y = ancho(P, x);
    html += filaConTitulo(nombres[i], [
      texto(x), texto(y), texto(2 * (x + y)), texto(area(P, x)),
      texto(area(P, x) / areaMax * 100, 1) + ' %', tendencia(derivada(P, x))
    ]);
  }
  document.querySelector('#h-comparacion tbody').innerHTML = html;

  var a1 = area(P, x1), a2 = area(P, x2);
  var veredicto;
  if (a1 === a2) {
    veredicto = 'Los dos escenarios tienen la misma área.';
  } else {
    veredicto = 'El escenario ' + (a1 > a2 ? 'A' : 'B') + ' encierra ' +
      texto(Math.abs(a1 - a2)) + ' m² más con el mismo cerco.';
  }
  veredicto += ' Máximo teórico: A(' + texto(xOptimo) + ') = ' + texto(areaMax) + ' m².';
  document.getElementById('h-veredicto').textContent = veredicto;

  // Comprobaciones
  // 1) probar muchos valores de x y buscar el mayor área
  var mejorX = 0, mejorA = 0;
  for (var k = 1; k < 4000; k++) {
    var xk = (P / 2) * k / 4000;
    if (area(P, xk) > mejorA) { mejorA = area(P, xk); mejorX = xk; }
  }
  // 2) derivada aproximada: (A(x+h) - A(x-h)) / 2h
  var h = 0.00001;
  var derivadaAprox = (area(P, x1 + h) - area(P, x1 - h)) / (2 * h);

  document.getElementById('h-comprobacion').innerHTML =
    comprobacion(Math.abs(mejorA - areaMax) < 0.001,
      'Probando 4000 valores de x, el mayor área es ' + texto(mejorA, 3) + ' m² en x ≈ ' + texto(mejorX, 2) + ' m (fórmula: ' + texto(areaMax, 3) + ' m²).') +
    comprobacion(Math.abs(derivadaAprox - derivada(P, x1)) < 0.0001,
      'Derivada en x = ' + texto(x1) + ': exacta ' + texto(derivada(P, x1), 4) + ' y aproximada ' + texto(derivadaAprox, 4) + '.') +
    comprobacion(Math.abs(2 * (x1 + ancho(P, x1)) - P) < 0.000001,
      'El perímetro 2(x + y) da ' + texto(2 * (x1 + ancho(P, x1))) + ' m (debe ser ' + texto(P) + ' m).');

  // Tabla experimental
  var pruebas = [2, 5, 8, 10, 12, 15, 18];
  var tabla = '';
  for (var j = 0; j < pruebas.length; j++) {
    var xp = pruebas[j];
    if (xp >= P / 2) continue;
    var yp = ancho(P, xp);
    var fp = fila([
      texto(xp), texto(yp), texto(2 * (xp + yp)), texto(area(P, xp)),
      texto(area(P, xp) / areaMax * 100, 1) + ' %', texto(derivada(P, xp)), tendencia(derivada(P, xp))
    ]);
    if (xp === xOptimo) fp = fp.replace('<tr>', '<tr class="optimo">');
    tabla += fp;
  }
  document.querySelector('#tabla-huerto tbody').innerHTML = tabla;
}

// ---------- Reto E: panadería ----------
// I(q) = p·q   |   C(q) = CF + c·q   |   G(q) = I(q) - C(q) = (p - c)·q - CF
// G'(q) = p - c   |   punto de equilibrio: q* = CF / (p - c)
function ingresos(p, q) { return p * q; }
function costos(CF, c, q) { return CF + c * q; }
function ganancia(p, CF, c, q) { return ingresos(p, q) - costos(CF, c, q); }

function estado(g) {
  if (g > 0.000000001) return 'ganancia';
  if (g < -0.000000001) return 'pérdida';
  return 'equilibrio';
}

function calcularPanaderia(evento) {
  if (evento) evento.preventDefault();

  var p = leer('p-precio');
  var c = leer('p-cv');
  var CF = leer('p-cf');
  var q1 = leer('p-q1');
  var q2 = leer('p-q2');

  // Validación
  var error = '';
  if (isNaN(p) || isNaN(c) || isNaN(CF) || isNaN(q1) || isNaN(q2)) {
    error = 'Completa todos los campos con números.';
  } else if (p <= 0 || c < 0 || CF < 0) {
    error = 'El precio debe ser mayor que 0 y los costos no pueden ser negativos.';
  } else if (p <= c) {
    error = 'El precio debe ser mayor que el costo variable por pan; si no, nunca hay ganancia.';
  } else if (q1 < 0 || q2 < 0 || q1 !== Math.floor(q1) || q2 !== Math.floor(q2)) {
    error = 'Las cantidades deben ser números enteros mayores o iguales a 0.';
  }
  mostrarError('p-error', error);
  document.getElementById('p-resultados').hidden = (error !== '');
  if (error) return;

  var qEquilibrio = CF / (p - c);

  // Comparación de dos escenarios
  var cantidades = [q1, q2];
  var nombres = ['Escenario A', 'Escenario B'];
  var html = '';
  for (var i = 0; i < 2; i++) {
    var q = cantidades[i];
    var g = ganancia(p, CF, c, q);
    html += filaConTitulo(nombres[i], [
      q, texto(ingresos(p, q)), texto(costos(CF, c, q)), texto(g), estado(g)
    ]);
  }
  document.querySelector('#p-comparacion tbody').innerHTML = html;

  var gA = ganancia(p, CF, c, q1), gB = ganancia(p, CF, c, q2);
  var veredicto;
  if (Math.abs(gA - gB) < 0.000000001) {
    veredicto = 'Los dos escenarios dan la misma ganancia.';
  } else {
    veredicto = 'El escenario ' + (gA > gB ? 'A' : 'B') + ' deja ' +
      texto(Math.abs(gA - gB)) + ' Bs más que el otro.';
  }
  veredicto += ' Punto de equilibrio: q* = ' + texto(CF) + ' / (' + texto(p) + ' - ' + texto(c) +
    ') = ' + texto(qEquilibrio, 1) + ' panes; cada pan adicional deja ' + texto(p - c) + ' Bs.';
  document.getElementById('p-veredicto').textContent = veredicto;

  // Comprobaciones
  // 1) probar q = 0, 1, 2, ... hasta encontrar la primera cantidad sin pérdida
  var primero = 0;
  while (ganancia(p, CF, c, primero) < -0.000000001 && primero < 100000) {
    primero++;
  }
  var esperado = Math.ceil(qEquilibrio - 0.000000001);
  // 2) G(q) con la forma (p - c)·q - CF
  var forma = (p - c) * q1 - CF;
  // 3) pendiente: G(q+1) - G(q) debe ser p - c
  var pendiente = ganancia(p, CF, c, q1 + 1) - ganancia(p, CF, c, q1);

  document.getElementById('p-comprobacion').innerHTML =
    comprobacion(primero === esperado || esperado > 100000,
      'Probando cantidades una por una, la primera sin pérdida es q = ' + primero + ' (fórmula: ' + esperado + ').') +
    comprobacion(Math.abs(forma - gA) < 0.000001,
      'G(' + q1 + '): ingresos - costos = ' + texto(gA) + ' y (p - c)·q - CF = ' + texto(forma) + '.') +
    comprobacion(Math.abs(pendiente - (p - c)) < 0.000001,
      'G(q + 1) - G(q) = ' + texto(pendiente, 4) + ' y p - c = ' + texto(p - c, 4) + '.');

  // Tabla experimental (rango de cantidades)
  var pruebas = [100, 250, 500, 750, 1000, 1500, 2000];
  var tabla = '';
  for (var j = 0; j < pruebas.length; j++) {
    var qp = pruebas[j];
    var gp = ganancia(p, CF, c, qp);
    var fp = fila([
      qp, texto(ingresos(p, qp)), texto(costos(CF, c, qp)), texto(gp), texto(gp / qp), estado(gp)
    ]);
    if (estado(gp) === 'equilibrio') fp = fp.replace('<tr>', '<tr class="optimo">');
    tabla += fp;
  }
  document.querySelector('#tabla-panaderia tbody').innerHTML = tabla;
}

// ---------- Eventos ----------
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('form-huerto').addEventListener('submit', calcularHuerto);
  document.getElementById('form-panaderia').addEventListener('submit', calcularPanaderia);
  // Al restablecer, volver a calcular con los valores iniciales
  document.getElementById('form-huerto').addEventListener('reset', function () { setTimeout(calcularHuerto, 0); });
  document.getElementById('form-panaderia').addEventListener('reset', function () { setTimeout(calcularPanaderia, 0); });
  calcularHuerto();
  calcularPanaderia();
});
