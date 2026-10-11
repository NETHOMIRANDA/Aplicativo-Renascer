/* =========================================================
   fotos-itens.js - fotos que estavam ANEXADAS (coladas) nos itens
   e foram recuperadas como ARQUIVOS (img/).

   Formato: "id do item": [foto principal, variante1, variante2, ...]

   - A rotina de reparo usa este mapa SOMENTE para itens que
     estao sem foto (campo "foto" vazio): ela cria a URL do arquivo
     e mantem cada foto no seu item (nada de foto trocada).
   ========================================================= */
var FOTOS_ITENS = {
  "5": ["foto-pc-054.jpg", "foto-pc-055.jpg", "foto-pc-056.jpg"],
  "6": ["foto-pc-057.jpg", "foto-pc-058.jpg", "foto-pc-059.jpg", "foto-pc-060.jpg"],
  "7": ["foto-pc-061.jpg", "foto-pc-062.jpg"],
  "8": ["foto-pc-063.jpg"],
  "33": ["foto-pc-064.jpg", "foto-pc-065.jpg", "foto-pc-066.jpg", "foto-pc-067.jpg"]
};
