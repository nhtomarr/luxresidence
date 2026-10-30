// Mənzil planları və eksplikasiya (developerin plan şəkillərindən köçürülüb). Açar: sahə m² (2 rəqəm). Şəkil: /assets/nc/plans/plan-<sahə>.png
window.NC_PLANS = (function () {
  const H = 'Holl', D = 'Dəhliz', M = 'Mətbəx', Z = 'Zal', S = 'Sanitar qovşaq', Y = 'Yataq otağı', Q = 'Qarderob', C = 'Camaşırxana', E = 'Eyvan';
  const P = {
    '81.91': [[H, 19.64], [M, 10.84], [Z, 16.18], [S, 5.00], [Y, 16.28], [C, 7.18], [E, 6.79]],
    '84.40': [[D, 14.05], [M, 10.39], [Z, 25.00], [S, 7.59], [Y, 15.66], [Q, 4.40], [E, 7.31]],
    '87.95': [[H, 16.60], [M, 5.95], [Z, 20.87], [S, 7.00], [Y, 16.77], [Q, 7.80], [C, 5.24], [E, 7.72]],
    '113.18': [[H, 14.18], [D, 6.62], [M, 7.38], [Z, 21.89], [S, 7.15], [Y, 21.37], [Y, 16.18], [Q, 10.41], [E, 8.00]],
    '123.71': [[H, 14.45], [D, 4.91], [M, 9.92], [Z, 26.79], [S, 6.33], [Y, 19.49], [E, 7.30], [Y, 20.94], [C, 4.53], [Q, 9.05]],
    '129.00': [[H, 14.18], [M, 23.54], [Z, 26.92], [S, 8.94], [Y, 21.53], [Y, 20.06], [C, 5.59], [E, 8.24]],
    '151.45': [[H, 22.20], [M, 23.32], [Z, 33.15], [S, 5.36], [S, 4.39], [Q, 7.06], [Y, 23.81], [Y, 22.82], [E, 9.34]],
    '154.76': [[H, 14.45], [D, 9.13], [M, 18.89], [Z, 26.64], [S, 6.96], [S, 6.96], [C, 7.68], [Q, 4.13], [Y, 30.09], [Y, 22.97], [E, 6.96]],
    '165.30': [[H, 23.77], [M, 20.36], [Z, 26.81], [S, 6.04], [S, 5.18], [C, 5.06], [Q, 9.23], [Q, 6.58], [Y, 25.29], [Y, 21.48], [E, 7.65], [E, 7.85]],
    // B, F, G binaları
    '53.83': [[H, 9.22], [Z, 18.78], [S, 5.12], [Y, 15.38], [E, 5.33]],
    '65.00': [[D, 6.91], [M, 9.94], [Z, 14.73], [S, 6.47], [Y, 19.75], [E, 7.20]],
    '76.50': [[D, 9.78], [M, 11.10], [Z, 22.70], [S, 7.22], [Y, 17.94], [E, 7.76]],
    '113.00': [[H, 18.52], [M, 27.72], [Z, 27.46], [S, 5.91], [Y, 13.40], [Y, 16.06], [E, 3.97]],
    '121.82': [[H, 13.06], [D, 7.88], [M, 22.08], [Z, 29.14], [S, 5.66], [Y, 16.37], [Y, 19.48], [C, 4.32], [E, 3.83]],
    '163.21': [[H, 18.44], [M, 21.15], [Z, 42.00], [S, 5.91], [S, 5.98], [Q, 10.19], [Q, 7.81], [Y, 19.98], [Y, 17.06], [E, 7.29], [E, 7.40]],
    '206.70': [[H, 15.55], [D, 12.55], [M, 19.50], [Z, 32.82], [S, 7.01], [S, 5.47], [Y, 29.66], [Y, 18.74], [Y, 18.33], [Q, 4.72], [Q, 7.66], [Q, 7.35], ['İnventar', 6.18], [E, 8.85], [E, 12.31]],
  };
  const BFG = ['53.83', '65.00', '76.50', '113.00', '121.82', '163.21'];
  const R = {};
  Object.keys(P).forEach(a => { R[a] = { a: +a, rooms: P[a], g: BFG.includes(a) ? 'BFG' : 'AE', img: '/assets/nc/plans/plan-' + a.replace('.', '_') + '.png' }; });
  return R;
})();
// Planlar A və E binalarına aiddir. Dəqiq uyğunluq, yoxdursa ±0,3 m² daxilində ən yaxın plan (məs. 128,74 → 129,00; 154,53 → 154,76).
// Satış bazasındakı sahə dəyişmir — saytda müqavilə sahəsi ayrıca göstərilir.
// A, E planları A və E binalarına; B, F, G planları B, F, G binalarına aiddir. Dəqiq uyğunluq, yoxdursa yaxın plan:
// A/E üçün ±0,3 m² (128,74 → 129,00), B/F/G üçün ±0,45 m² (54,13 → 53,83; 162,91 → 163,21). Satış bazasındakı sahə dəyişmir.
window.ncPlan = function (area, b) {
  const g = !b ? null : /^[AE]$/.test(b) ? 'AE' : /^[BFG]$/.test(b) ? 'BFG' : 'x'; if (g === 'x') return null;
  const a = +area, P = window.NC_PLANS, ex = P[a.toFixed(2)]; if (ex && (!g || ex.g === g)) return ex;
  const tol = g === 'BFG' ? 0.4501 : 0.3001; let best = null, d = tol;
  Object.keys(P).forEach(k => { if (g && P[k].g !== g) return; const x = Math.abs(+k - a); if (x <= d) { d = x; best = P[k]; } }); return best;
};
