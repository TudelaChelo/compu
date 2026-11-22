// MAT-117 · Desafío final
// Reto D: huerto óptimo  |  Reto C: panel solar

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

// ---------- Reto C: panel solar ----------
// E(θ) = P·h·cos(θ)   |   dE/dθ = -P·h·sen(θ)   |   θ máximo = arccos(r)
function aRadianes(grados) { return grados * Math.PI / 180; }
function energia(P, h, grados) { return P * h * Math.cos(aRadianes(grados)); }

function calcularSolar(evento) {
  if (evento) evento.preventDefault();

  var P = leer('s-pot');
  var h = leer('s-horas');
  var t1 = leer('s-t1');
  var t2 = leer('s-t2');
  var r = leer('s-r');

  // Validación
  var error = '';
  if (isNaN(P) || isNaN(h) || isNaN(t1) || isNaN(t2) || isNaN(r)) {
    error = 'Completa todos los campos con números.';
  } else if (P <= 0) {
    error = 'La potencia debe ser mayor que 0 W.';
  } else if (h <= 0 || h > 24) {
    error = 'Las horas de sol deben estar entre 0 y 24.';
  } else if (t1 < 0 || t1 > 90 || t2 < 0 || t2 > 90) {
    error = 'Los ángulos deben estar entre 0° y 90°.';
  } else if (r <= 0 || r >= 100) {
    error = 'El porcentaje mínimo debe estar entre 0 y 100.';
  }
  mostrarError('s-error', error);
  document.getElementById('s-resultados').hidden = (error !== '');
  if (error) return;

  var E0 = energia(P, h, 0);

  // Comparación de dos escenarios
  var angulos = [t1, t2];
  var nombres = ['Escenario A', 'Escenario B'];
  var html = '';
  for (var i = 0; i < 2; i++) {
    var E = energia(P, h, angulos[i]);
    html += filaConTitulo(nombres[i], [
      texto(angulos[i]) + '°', texto(E), texto(E / 1000, 3),
      texto(E / E0 * 100, 1) + ' %', texto(E0 - E)
    ]);
  }
  document.querySelector('#s-comparacion tbody').innerHTML = html;

  var EA = energia(P, h, t1), EB = energia(P, h, t2);
  var thetaMax = Math.acos(r / 100) * 180 / Math.PI;
  var veredicto;
  if (EA === EB) {
    veredicto = 'Los dos ángulos producen la misma energía.';
  } else {
    veredicto = 'El escenario ' + (EA > EB ? 'A' : 'B') + ' produce ' +
      texto(Math.abs(EA - EB)) + ' Wh más por día.';
  }
  veredicto += ' Para conservar al menos el ' + texto(r) + ' % de la energía, θ ≤ arccos(' +
    texto(r / 100, 3) + ') ≈ ' + texto(thetaMax) + '°.';
  document.getElementById('s-veredicto').textContent = veredicto;

  // Comprobaciones
  // 1) cos(θ) con la serie de Taylor: 1 - x²/2! + x⁴/4! - ...
  var x = aRadianes(t1), serie = 0, termino = 1;
  for (var k = 0; k < 12; k++) {
    serie += termino;
    termino = -termino * x * x / ((2 * k + 1) * (2 * k + 2));
  }
  // 2) despejar θ y volver a calcular la fracción
  var fraccion = energia(P, h, thetaMax) / E0;

  document.getElementById('s-comprobacion').innerHTML =
    comprobacion(Math.abs(Math.cos(x) - serie) < 0.000000001,
      'cos(' + texto(t1) + '°): Math.cos = ' + texto(Math.cos(x), 8) + ' y serie de Taylor = ' + texto(serie, 8) + '.') +
    comprobacion(Math.abs(fraccion - r / 100) < 0.000000001,
      'Con θ = ' + texto(thetaMax, 3) + '° se recupera E/E₀ = ' + texto(fraccion * 100, 3) + ' % (objetivo ' + texto(r, 3) + ' %).') +
    comprobacion(EA === EB || (EA > EB) === (t1 < t2),
      'A mayor ángulo, menor energía (entre 0° y 90°).');

  // Tabla experimental
  var pruebas = [0, 10, 20, 30, 45, 60, 75, 90];
  var tabla = '';
  for (var j = 0; j < pruebas.length; j++) {
    var t = pruebas[j];
    var Et = energia(P, h, t);
    var dE = -P * h * Math.sin(aRadianes(t)) * Math.PI / 180; // Wh por grado
    tabla += fila([
      t + '°', texto(Math.cos(aRadianes(t)), 4), texto(Et),
      texto(Et / E0 * 100, 1) + ' %', texto(E0 - Et), texto(dE)
    ]);
  }
  document.querySelector('#tabla-solar tbody').innerHTML = tabla;
}

// ---------- Eventos ----------
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('form-huerto').addEventListener('submit', calcularHuerto);
  document.getElementById('form-solar').addEventListener('submit', calcularSolar);
  // Al restablecer, volver a calcular con los valores iniciales
  document.getElementById('form-huerto').addEventListener('reset', function () { setTimeout(calcularHuerto, 0); });
  document.getElementById('form-solar').addEventListener('reset', function () { setTimeout(calcularSolar, 0); });
  calcularHuerto();
  calcularSolar();
});
