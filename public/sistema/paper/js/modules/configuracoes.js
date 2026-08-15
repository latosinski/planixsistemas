function renderConfiguracoes() {
    document.getElementById('contentArea').innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title"><i class="fas fa-cog"></i> Parâmetros do Sistema</div>
            </div>
            <div class="panel-body">
                <div class="form-row">
                    <div class="form-group"><label>Valor Hora/Trabalho (R$)</label><input type="number" id="cfgHora" value="${cfg.hora}" step="0.01"></div>
                    <div class="form-group"><label>Taxa Pagamento (%)</label><input type="number" id="cfgTaxaPag" value="${cfg.taxaPag}" step="0.01"></div>
                    <div class="form-group"><label>Impostos (%)</label><input type="number" id="cfgImpostos" value="${cfg.impostos}" step="0.1"></div>
                    <div class="form-group"><label>Meta de Lucro (%)</label><input type="number" id="cfgMetaLucro" value="${cfg.metaLucro}" step="0.1"></div>
                </div>
                <div style="margin-top:1rem; padding:1rem; background:var(--bg); border-radius:8px; font-size:0.85rem; color:var(--text);" id="cfgResumo">
                    💰 Hora: <strong>R$ ${cfg.hora.toFixed(2)}</strong> | 💳 Pag: <strong>${cfg.taxaPag.toFixed(2)}%</strong> | 📑 Imp: <strong>${cfg.impostos.toFixed(1)}%</strong> | 🎯 Meta: <strong>${cfg.metaLucro.toFixed(1)}%</strong>
                </div>
                <button class="btn btn-primary" style="margin-top:1rem;" onclick="salvarConfiguracoes()"><i class="fas fa-save"></i> Salvar</button>
            </div>
        </div>`;
}

function salvarConfiguracoes() {
    cfg.hora = +document.getElementById('cfgHora')?.value || cfg.hora;
    cfg.taxaPag = +document.getElementById('cfgTaxaPag')?.value || cfg.taxaPag;
    cfg.impostos = +document.getElementById('cfgImpostos')?.value || cfg.impostos;
    cfg.metaLucro = +document.getElementById('cfgMetaLucro')?.value || cfg.metaLucro;
    document.getElementById('cfgResumo').innerHTML = `💰 Hora: <strong>R$ ${cfg.hora.toFixed(2)}</strong> | 💳 Pag: <strong>${cfg.taxaPag.toFixed(2)}%</strong> | 📑 Imp: <strong>${cfg.impostos.toFixed(1)}%</strong> | 🎯 Meta: <strong>${cfg.metaLucro.toFixed(1)}%</strong>`;
    Storage.saveCfg();
    alert('Configurações salvas!');
}