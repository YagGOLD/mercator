/* ============================================================
   Mercator — Exportar / Importar dados (backup local)

   O app não tem servidor: tudo vive no localStorage DESTE aparelho.
   Isso significa que trocar de celular, remover o ícone (no iOS isso
   apaga os dados) ou limpar os dados de sites leva tudo embora. Este
   módulo é a rede de proteção: gera um arquivo .json com o estado
   inteiro e sabe restaurá-lo.

   No iPhone, baixar arquivo dentro de um app instalado é pouco
   confiável — então o export usa a folha de compartilhamento do
   sistema (Web Share) quando ela existe, caindo no download comum
   no desktop. Assim dá para salvar nos Arquivos, mandar por e-mail
   ou WhatsApp.
   ============================================================ */

window.Backup = (function () {

  // Todas as chaves do app. Nada fora daqui é lido ou escrito.
  var KEYS = [
    "mercator.avatar",
    "mercator.lists",
    "mercator.history",
    "mercator.progress",
    "mercator.missions",
    "mercator.donationSeen"
  ];

  var FORMAT = 1;   // versão do formato do arquivo (p/ migração futura)

  function readKey(k) {
    var raw = localStorage.getItem(k);
    if (raw === null) return undefined;
    try { return JSON.parse(raw); } catch (e) { return raw; }
  }

  function writeKey(k, v) {
    localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
  }

  // ===== Exportar =====
  function snapshot() {
    var data = {};
    KEYS.forEach(function (k) {
      var v = readKey(k);
      if (v !== undefined) data[k] = v;
    });
    return {
      app: "mercator",
      format: FORMAT,
      exportedAt: new Date().toISOString(),
      data: data
    };
  }

  function filename() {
    var d = new Date();
    return "mercator-backup-" + d.getFullYear() + "-" +
           String(d.getMonth() + 1).padStart(2, "0") + "-" +
           String(d.getDate()).padStart(2, "0") + ".json";
  }

  function download(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /**
   * Exporta. Devolve uma Promise com o meio usado:
   * "share" (folha do sistema) ou "download".
   * Precisa ser chamado a partir de um clique — o iOS exige gesto
   * do usuário para abrir o compartilhamento.
   */
  function exportData() {
    var name = filename();
    var json = JSON.stringify(snapshot(), null, 2);
    var blob = new Blob([json], { type: "application/json" });

    // Web Share com arquivo (iPhone/Android): salva nos Arquivos,
    // manda por e-mail, WhatsApp... É o caminho confiável no celular.
    if (navigator.canShare && window.File) {
      var file = new File([blob], name, { type: "application/json" });
      if (navigator.canShare({ files: [file] })) {
        return navigator.share({ files: [file], title: "Backup do Mercator" })
          .then(function () { return "share"; })
          .catch(function (err) {
            // Usuário fechou a folha de compartilhamento: não é erro
            if (err && err.name === "AbortError") return "cancel";
            download(blob, name);       // qualquer outra falha: cai no download
            return "download";
          });
      }
    }

    download(blob, name);
    return Promise.resolve("download");
  }

  // ===== Importar =====
  /**
   * Lê e valida o conteúdo do arquivo.
   * Devolve { ok: true, payload, resumo } ou { ok: false, erro }.
   */
  function parse(text) {
    var obj;
    try { obj = JSON.parse(text); }
    catch (e) { return { ok: false, erro: "O arquivo não é um backup válido (não é JSON)." }; }

    if (!obj || typeof obj !== "object" || obj.app !== "mercator" || !obj.data) {
      return { ok: false, erro: "Este arquivo não é um backup do Mercator." };
    }
    if (obj.format > FORMAT) {
      return { ok: false, erro: "Este backup foi feito por uma versão mais nova do app." };
    }

    var d = obj.data;
    var listas = Array.isArray(d["mercator.lists"]) ? d["mercator.lists"] : [];
    var hist = Array.isArray(d["mercator.history"]) ? d["mercator.history"] : [];
    var prog = d["mercator.progress"] || {};

    return {
      ok: true,
      payload: obj,
      resumo: {
        listas: listas.length,
        compras: hist.length,
        nivel: prog.level || 1,
        gemas: prog.gems || 0,
        data: obj.exportedAt
      }
    };
  }

  /**
   * SUBSTITUI os dados deste aparelho pelos do arquivo.
   * Só escreve as chaves conhecidas; as que não vierem no backup são
   * removidas, para o aparelho ficar idêntico ao arquivo (e não virar
   * uma mistura dos dois estados).
   */
  function restore(payload) {
    var d = payload.data || {};
    KEYS.forEach(function (k) {
      if (d[k] === undefined) localStorage.removeItem(k);
      else writeKey(k, d[k]);
    });
  }

  return {
    KEYS: KEYS,
    snapshot: snapshot,
    exportData: exportData,
    parse: parse,
    restore: restore
  };
})();
