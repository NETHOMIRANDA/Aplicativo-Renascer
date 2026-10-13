/* =========================================================
   publicar-foto.js  —  publica sua foto como arquivo permanente
   e vincula ao item do catálogo.
   Uso:
     node js/publicar-foto.js <id-do-item> "C:\caminho\da\foto.jpg"
   Exemplo:
     node js/publicar-foto.js 19 "C:\Users\netho\Pictures\freezer.jpg"
   ========================================================= */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RAIZ = __dirname.replace('/js', '');
const IMG_DIR = path.join(RAIZ, 'img');
const SEED_FILE = path.join(RAIZ, 'js', 'fotos-seed.js');
const ITENS_FILE = path.join(RAIZ, 'js', 'fotos-itens.js');

function proximoNumero() {
  const existentes = fs.readdirSync(IMG_DIR)
    .filter(f => /^foto-pc-(\d+)\.jpg$/.test(f))
    .map(f => parseInt(f.match(/foto-pc-(\d+)\.jpg$/)[1], 10));
  return (existentes.length ? Math.max(...existentes) + 1 : 1);
}

function processarImagem(origem, destino) {
  // usa o script Python já existente (precisa de Pillow: pip install pillow)
  const pyScript = path.join(RAIZ, 'publicar_foto.py');
  if (!fs.existsSync(pyScript)) throw new Error('publicar_foto.py não encontrado');
  const saida = execSync(`python "${pyScript}" "${RAIZ}" "${origem}"`, { encoding: 'utf8' }).trim();
  return saida; // ex: "foto-pc-068.jpg"
}

function atualizarSeed(nomeArquivo) {
  const txt = fs.readFileSync(SEED_FILE, 'utf8');
  if (txt.includes(`"${nomeArquivo}"`)) return; // já está
  const novo = txt.replace(
    /(\r?\n)(    "[^"\r\n]+",?)(\r?\n)(  \],)/,
    `$1$2,$3    "${nomeArquivo}"$3$4`
  );
  fs.writeFileSync(SEED_FILE, novo, 'utf8');
}

function atualizarMapaItens(itemId, nomeArquivo) {
  let mapa = {};
  if (fs.existsSync(ITENS_FILE)) {
    const txt = fs.readFileSync(ITENS_FILE, 'utf8');
    const m = txt.match(/FOTOS_ITENS\s*=\s*(\{[\s\S]*?\});/);
    if (m) mapa = eval('(' + m[1] + ')');
  }
  if (!mapa[itemId]) mapa[itemId] = [];
  if (!mapa[itemId].includes(nomeArquivo)) {
    mapa[itemId].unshift(nomeArquivo); // principal primeiro
  }
  const saida = 'var FOTOS_ITENS = ' + JSON.stringify(mapa, null, 2).replace(/"/g, '"') + ';';
  fs.writeFileSync(ITENS_FILE, saida, 'utf8');
}

function commitPush(msg) {
  execSync(`git -C "${RAIZ}" add img js/fotos-seed.js js/fotos-itens.js`, { stdio: 'inherit' });
  execSync(`git -C "${RAIZ}" commit -m "${msg}"`, { stdio: 'inherit' });
  execSync(`git -C "${RAIZ}" push origin main`, { stdio: 'inherit' });
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Uso: node js/publicar-foto.js <id-do-item> "caminho/da/foto.jpg"');
    process.exit(1);
  }
  const itemId = args[0];
  const origem = args[1];

  if (!fs.existsSync(origem)) {
    console.error('Arquivo não encontrado:', origem);
    process.exit(1);
  }

  console.log('Publicando', origem, 'para item', itemId, '...');
  const nome = processarImagem(origem);
  console.log('Arquivo gerado:', nome);

  atualizarSeed(nome);
  console.log('fotos-seed.js atualizado');

  atualizarMapaItens(itemId, nome);
  console.log('fotos-itens.js atualizado (item', itemId, '→', nome + ')');

  commitPush(`Foto publicada: ${nome} (item ${itemId})`);
  console.log('GitHub atualizado ✅');

  console.log('\nPronto! Abra o painel → aba Itens → "📷 Escolher foto" do item', itemId);
  console.log('A foto', nome, 'estará na galeria (sem ⚠ colada) — clique e salve.');
  console.log('Depois clique em 🔄 Sincronizar agora e confirme "✅ sincronizado".');
}

main();