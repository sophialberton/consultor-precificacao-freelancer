$(document).ready(function() {
    const App = {
        getFormData: function() {
            return {
                // Dados das Partes
                freelancerNome: $('#freelancer-nome').val() || "[SEU NOME / RAZÃO SOCIAL]",
                freelancerDoc: $('#freelancer-doc').val() || "[SEU CPF / CNPJ]",
                freelancerEnd: $('#freelancer-end').val() || "[SEU ENDEREÇO COMPLETO]",
                clienteNome: $('#cliente-nome').val() || "[NOME DO CLIENTE]",
                clienteDoc: $('#cliente-doc').val() || "[CPF / CNPJ DO CLIENTE]",
                clienteEnd: $('#cliente-end').val() || "[ENDEREÇO DO CLIENTE]",

                // Dados do Projeto
                projetoTitulo: $('#projeto-titulo').val() || "[TÍTULO DO PROJETO]",
                projetoStatus: $('#projeto-status').val(),
                projetoEscopo: $('#projeto-escopo').val().replace(/\n/g, '<br>') || "[ESCOPO DETALHADO AQUI]",
                
                // Prazos e Prioridade
                dataInicio: this.formatarData($('#data-inicio').val()),
                dataFim: this.formatarData($('#data-fim').val()),
                prioridade: $('input[name="prioridade"]:checked').val(),

                // Valores
                calcMetodo: $('input[name="calc-metodo"]:checked').val(),
                valorProjetoFixo: parseFloat($('#valor-projeto-fixo').val()) || 0,
                valorHora: parseFloat($('#valor-hora').val()) || 0,
                horasProjeto: parseFloat($('#horas-projeto').val()) || 0,
                taxaUrgencia: parseFloat($('#taxa-urgencia').val()) || 0,
                horasExtras: parseFloat($('#horas-extras').val()) || 0,

                // Pagamento
                condicaoPagamentoKey: $('#condicao-pagamento').val(),
                condicaoPagamentoText: $('#condicao-pagamento option:selected').text(),

                // Cláusulas
                clausulaAlteracoes: $('#clausula-alteracoes').val() || "[POLÍTICA DE ALTERAÇÕES]",
                clausulaPropriedade: $('#clausula-propriedade').val() || "[CLÁUSULA DE PROPRIEDADE INTELECTUAL]",
            };
        },

        updateUI: function() {
            const dados = this.getFormData();
            
            if (dados.calcMetodo === 'projeto') {
                $('#campos-valor-projeto').slideDown();
                $('#campos-valor-horas').slideUp();
            } else {
                $('#campos-valor-projeto').slideUp();
                $('#campos-valor-horas').slideDown();
            }

            let valorBase = 0;
            let horasEstimadas = 0;

            if (dados.calcMetodo === 'projeto') {
                valorBase = dados.valorProjetoFixo;
                if (dados.valorHora > 0) {
                    horasEstimadas = valorBase / dados.valorHora;
                }
            } else { // calcMetodo === 'horas'
                horasEstimadas = dados.horasProjeto;
                valorBase = horasEstimadas * dados.valorHora;
            }

            let valorUrgencia = 0;
            if (dados.prioridade === 'urgente') {
                valorUrgencia = valorBase * (dados.taxaUrgencia / 100);
                $('#urgencia-box').slideDown();
            } else {
                $('#urgencia-box').slideUp();
            }
            
            const valorExtras = dados.horasExtras * dados.valorHora * 1.5;
            const valorTotalFinal = valorBase + valorUrgencia + valorExtras;

            $('#horas-estimadas').text(horasEstimadas.toFixed(1).replace('.', ',') + 'h');
            $('#valor-base').text(this.formatarMoeda(valorBase));
            $('#valor-urgencia').text(this.formatarMoeda(valorUrgencia));
            $('#valor-extras').text(this.formatarMoeda(valorExtras));
            $('#valor-total-final').text(this.formatarMoeda(valorTotalFinal));

            this.detalharPagamento(valorTotalFinal, dados.condicaoPagamentoKey);
        },

        detalharPagamento: function(valorTotal, condicao) {
            let html = '<h6>Detalhamento do Pagamento:</h6>';
            if (valorTotal <= 0) {
                $('#detalhamento-pagamento').html('');
                return;
            }

            switch (condicao) {
                case '50/50':
                    const parcela50 = valorTotal / 2;
                    html += `<p><strong>Entrada:</strong> ${this.formatarMoeda(parcela50)} (na assinatura)</p>`;
                    html += `<p><strong>Parcela Final:</strong> ${this.formatarMoeda(parcela50)} (na entrega)</p>`;
                    break;
                case '3-parcelas':
                    const parcela33 = valorTotal / 3;
                    html += `<p><strong>Entrada:</strong> ${this.formatarMoeda(parcela33)} (na assinatura)</p>`;
                    html += `<p><strong>2ª Parcela:</strong> ${this.formatarMoeda(parcela33)} (no marco intermediário)</p>`;
                    html += `<p><strong>Parcela Final:</strong> ${this.formatarMoeda(parcela33)} (na entrega)</p>`;
                    break;
                case 'mensal':
                    html += `<p>O valor será faturado mensalmente de acordo com as entregas.</p>`;
                    break;
            }
            $('#detalhamento-pagamento').html(html);
        },

        gerarContrato: function() {
            this.updateUI();
            const dados = this.getFormData();
            const valorTotalFinal = parseFloat($('#valor-total-final').text().replace(/[R$\s.]/g, '').replace(',', '.'));
            const horasEstimadasTexto = $('#horas-estimadas').text();
            const detalhamentoPagamentoHtml = $('#detalhamento-pagamento').html();
            
            const clausulaObjeto = dados.projetoStatus === 'a-entregar'
                ? `O objeto do presente contrato é a prestação de serviços de "${dados.projetoTitulo}", a serem realizados pelo(a) CONTRATADO(A), compreendendo o seguinte escopo:`
                : `O objeto do presente contrato é a entrega do projeto finalizado de "${dados.projetoTitulo}", cujo escopo compreende:`;

            let clausulaUrgencia = "";
            if (dados.prioridade === 'urgente') {
                clausulaUrgencia = `<p><strong>Parágrafo Único:</strong> Fica estabelecido que este projeto possui caráter de urgência, resultando em uma taxa de <strong>${dados.taxaUrgencia}%</strong> sobre o valor base, e um valor adicional de <strong>${this.formatarMoeda(dados.horasExtras * dados.valorHora * 1.5)}</strong> referente a <strong>${dados.horasExtras}</strong> horas extras, já inclusos no valor total.</p>`;
            }

            const template = `
                <h3>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h3>
                <p><strong>PROJETO:</strong> ${dados.projetoTitulo.toUpperCase()}</p>
                <hr>
                <p><strong>CONTRATANTE:</strong> ${dados.clienteNome}, com documento (CPF/CNPJ) nº ${dados.clienteDoc}, com sede em ${dados.clienteEnd}.</p>
                <p><strong>CONTRATADO(A):</strong> ${dados.freelancerNome}, com documento (CPF/CNPJ) nº ${dados.freelancerDoc}, com sede em ${dados.freelancerEnd}.</p>
                <hr>
                <p><strong>CLÁUSULA 1ª - DO OBJETO</strong></p>
                <p>${clausulaObjeto}</p>
                <p>${dados.projetoEscopo}</p>
                <hr>
                <p><strong>CLÁUSULA 2ª - DOS PRAZOS E DEDICAÇÃO</strong></p>
                <p>O serviço será executado no período de <strong>${dados.dataInicio}</strong> a <strong>${dados.dataFim}</strong>.</p>
                <p>A dedicação estimada pela CONTRATADO(A) para a conclusão do escopo é de <strong>${horasEstimadasTexto}</strong>.</p>
                <hr>
                <p><strong>CLÁUSULA 3ª - DO VALOR E FORMA DE PAGAMENTO</strong></p>
                <p>Pela prestação dos serviços, a CONTRATANTE pagará à CONTRATADO(A) o valor total de <strong>${this.formatarMoeda(valorTotalFinal)}</strong>.</p>
                <p>A condição de pagamento será: <strong>${dados.condicaoPagamentoText}</strong>, seguindo o detalhamento abaixo:</p>
                <div class="payment-details-preview">${detalhamentoPagamentoHtml}</div>
                ${clausulaUrgencia}
                <hr>
                <p><strong>CLÁUSULA 4ª - DAS ALTERAÇÕES DE ESCOPO</strong></p>
                <p>${dados.clausulaAlteracoes}</p>
                <hr>
                <p><strong>CLÁUSULA 5ª - DA PROPRIEDADE INTELECTUAL</strong></p>
                <p>${dados.clausulaPropriedade}</p>
                <hr>
                <p>E por estarem justas e contratadas, as partes assinam o presente instrumento.</p>
                <br>
                <p>_________________________<br>${dados.clienteNome}</p>
                <br>
                <p>_________________________<br>${dados.freelancerNome}</p>
            `;

            $('#contrato-gerado').html(template);
        },
        
        copiarContrato: function() {
            const contratoHtml = $('#contrato-gerado').html();
            const contratoTexto = contratoHtml
                .replace(/<br>/g, '\n')
                .replace(/<hr>/g, '\n----------------------------------------\n')
                .replace(/<h3>(.*?)<\/h3>/g, '### $1 ###\n')
                .replace(/<p><strong>(.*?)<\/strong>(.*?)<\/p>/g, '**$1**$2\n')
                .replace(/<strong>/g, '**').replace(/<\/strong>/g, '**')
                .replace(/<p>|<\/p>|<div.*?>|<\/div>/g, '')
                .replace(/\n\s*\n/g, '\n')
                .trim();

            navigator.clipboard.writeText(contratoTexto).then(() => {
                const $btn = $('#btn-copiar');
                const originalText = $btn.html();
                $btn.html('<i class="fas fa-check me-2"></i>Copiado!');
                setTimeout(() => { $btn.html(originalText); }, 2000);
            });
        },

        // Funções auxiliares
        formatarData: (data) => data ? data.split('-').reverse().join('/') : "a ser definida",
        formatarMoeda: (valor) => (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),

        init: function() {
            $('#form-contrato').on('keyup change', 'input, textarea, select', this.gerarContrato.bind(this));
            $('#btn-copiar').on('click', this.copiarContrato.bind(this));
            this.gerarContrato(); // Gera um preview inicial
        }
    };

    App.init();
});