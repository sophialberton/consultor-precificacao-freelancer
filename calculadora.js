/**
 * @file Script para a Calculadora de Precificação Freelancer
 * @author Sophia Picasky Alberton (Refatorado por Gemini)
 * @version 2.2.0
 */

// Encapsula toda a lógica da aplicação em um objeto para evitar poluir o escopo global.
const CalculadoraFreela = {
    // --- PROPRIEDADES E ESTADO ---
    
    SELECTORS: {
        FORM: "#formulario-calculadora",
        FIELDSET: "fieldset",
        PROXIMO_BTN: ".proximo",
        ANTERIOR_BTN: ".anterior",
        BARRA_PROG_ITEMS: "#barra-progresso li",
        PROGRESS_BAR: ".progress-bar",
        BTN_IMPRIMIR: "#btn-imprimir",
        SUGESTOES_CONTAINER: "#valor-hora-sugestoes",
        RELATORIO_DETALHADO: "#cartilha-detalhada",
        NIVEL_EXPERIENCIA: "#nivel-experiencia",
        PREVIA_VALOR_CUSTO: "#previa-valor-hora-custo",
        PREVIA_BOX: ".result-box-preview",
        // NOVO SELETOR
        RELATORIO_TIPO_CHOOSER: "input[name='relatorio-tipo']",
    },

    MARGENS_EXPERIENCIA: {
        iniciante: 1.15,     // Custo + 15%
        intermediario: 1.35, // Custo + 35%
        avancado: 1.60,      // Custo + 60%
    },
    
    VALORES_MERCADO_BR: {
        iniciante:    { baixo: 35, medio: 50, alto: 70 },
        intermediario: { baixo: 60, medio: 80, alto: 110 },
        avancado:     { baixo: 90, medio: 130, alto: 180 }
    },

    passoAtual: 1,
    totalPassos: 0,
    dadosCalculados: {}, // Armazena os resultados dos cálculos para reuso

    // --- MÉTODOS DE INICIALIZAÇÃO E EVENTOS ---

    init() {
        if (typeof jQuery === 'undefined') {
            console.error("jQuery não está carregado. A calculadora não funcionará.");
            return;
        }

        $(document).ready(() => {
            this.totalPassos = $(this.SELECTORS.FIELDSET).length;
            this.bindEvents();
            this.atualizarBarraProgresso();
        });
    },

    bindEvents() {
        const { FORM, PROXIMO_BTN, ANTERIOR_BTN, BTN_IMPRIMIR, SUGESTOES_CONTAINER, NIVEL_EXPERIENCIA, RELATORIO_TIPO_CHOOSER } = this.SELECTORS;
        
        $(FORM)
            .on("click", PROXIMO_BTN, () => this.navegarParaPasso(this.passoAtual + 1))
            .on("click", ANTERIOR_BTN, () => this.navegarParaPasso(this.passoAtual - 1))
            .on("change", NIVEL_EXPERIENCIA, this.handleExperienciaChange.bind(this))
            .on("change", `${SUGESTOES_CONTAINER} input[name="valor-hora-escolha"]`, this.handleValorEscolhido.bind(this))
            // NOVO EVENTO
            .on("change", RELATORIO_TIPO_CHOOSER, this.handleTipoRelatorioChange.bind(this));


        $(BTN_IMPRIMIR).on("click", () => window.print());
    },

    // --- MÉTODOS DE NAVEGAÇÃO E UI ---

    navegarParaPasso(proximoPasso) {
        if (proximoPasso > this.passoAtual) {
            if (this.passoAtual === 1 && !this.validarEtapa1()) return;
            if (this.passoAtual === 2) {
                if (!this.dadosCalculados.valorCustoAjustado) {
                    this.handleExperienciaChange(); 
                }
                 if (!$(this.SELECTORS.NIVEL_EXPERIENCIA).val()) {
                    alert("Por favor, selecione seu nível de experiência para continuar.");
                    return;
                }
                this.apresentarSugestoes();
            }
        }
        
        if (proximoPasso > 0 && proximoPasso <= this.totalPassos) {
            const $etapaAtual = $(this.SELECTORS.FIELDSET).eq(this.passoAtual - 1);
            const $proximaEtapa = $(this.SELECTORS.FIELDSET).eq(proximoPasso - 1);

            $etapaAtual.fadeOut(200, () => $proximaEtapa.fadeIn(200));
            this.passoAtual = proximoPasso;
            this.atualizarBarraProgresso();
        }
    },

    atualizarBarraProgresso() {
        const percentual = ((this.passoAtual - 1) / (this.totalPassos - 1)) * 100;
        $(this.SELECTORS.PROGRESS_BAR).css("width", `${percentual}%`);
        $(this.SELECTORS.BARRA_PROG_ITEMS).removeClass("ativo").slice(0, this.passoAtual).addClass("ativo");
    },
    
    validarEtapa1() {
        let ehValido = true;
        const campos = [
            { id: '#salario-desejado', min: 1, msg: 'Salário deve ser maior que zero.' },
            { id: '#horas-diarias', min: 1, max: 24, msg: 'Horas devem ser entre 1 e 24.' },
            { id: '#dias-trabalho', min: 1, max: 7, msg: 'Dias devem ser entre 1 e 7.' },
            { id: '#dias-ferias', min: 0, max: 365, msg: 'Férias devem ser entre 0 e 365.' }
        ];

        $('.form-control').removeClass('is-invalid');
        $('.error-message').text('');

        campos.forEach(campo => {
            const $input = $(campo.id);
            const valor = parseFloat($input.val());
            if (isNaN(valor) || valor < campo.min || (campo.max && valor > campo.max)) {
                $input.addClass('is-invalid');
                $input.next('.error-message').text(campo.msg);
                ehValido = false;
            }
        });
        return ehValido;
    },

    // --- MÉTODOS DE LÓGICA E CÁLCULO ---

    getDadosFormulario() {
        return {
            salarioLiquido: parseFloat($('#salario-desejado').val()) || 0,
            beneficios: parseFloat($('#beneficios-mensais').val()) || 0,
            custosFixos: parseFloat($('#custos-fixos').val()) || 0,
            impostoPercent: parseFloat($('#impostos-percentual').val()) || 0,
            horasDia: parseInt($('#horas-diarias').val()) || 0,
            diasSemana: parseInt($('#dias-trabalho').val()) || 0,
            diasFeriasAno: parseInt($('#dias-ferias').val()) || 0,
            nivelExperiencia: $(this.SELECTORS.NIVEL_EXPERIENCIA).val() || 'intermediario',
        };
    },

    executarCalculos() {
        const dados = this.getDadosFormulario();
        
        const provisaoMensal = (dados.salarioLiquido / 12) * 2; // 13º + Férias
        const baseCalculoImposto = dados.salarioLiquido + dados.beneficios + provisaoMensal;
        const valorImpostos = baseCalculoImposto * (dados.impostoPercent / 100);
        const custoTotalMensal = dados.custosFixos + dados.beneficios + provisaoMensal + valorImpostos;

        const diasUteisAno = (dados.diasSemana * 52) - dados.diasFeriasAno;
        const horasProdutivasMes = (diasUteisAno * dados.horasDia * 0.75) / 12; // Fator 75% para tempo não faturável
        const horasProdutivasDia = dados.horasDia * 0.75;

        const valorMinimo = (horasProdutivasMes > 0) 
            ? (dados.salarioLiquido + custoTotalMensal) / horasProdutivasMes 
            : 0;

        const multiplicador = this.MARGENS_EXPERIENCIA[dados.nivelExperiencia];
        const valorCustoAjustado = valorMinimo * multiplicador;

        this.dadosCalculados = { ...dados, provisaoMensal, valorImpostos, custoTotalMensal, horasProdutivasMes, horasProdutivasDia, valorMinimo, valorCustoAjustado };
    },

    handleExperienciaChange() {
        if (!$(this.SELECTORS.NIVEL_EXPERIENCIA).val()) {
            $(this.SELECTORS.PREVIA_BOX).slideUp();
            return;
        }
        this.executarCalculos();
        $(this.SELECTORS.PREVIA_VALOR_CUSTO).text(this.formatarMoeda(this.dadosCalculados.valorCustoAjustado));
        $(this.SELECTORS.PREVIA_BOX).slideDown();
    },

    apresentarSugestoes() {
        const { valorCustoAjustado, nivelExperiencia } = this.dadosCalculados;
        const mercado = this.VALORES_MERCADO_BR[nivelExperiencia];

        const sugestoes = [
            { id: 'calculo', label: 'Mínimo para seus objetivos', valor: valorCustoAjustado },
            { id: 'mercado-baixo', label: `Média Baixa do Mercado (${nivelExperiencia})`, valor: mercado.baixo },
            { id: 'mercado-media', label: `Média do Mercado (${nivelExperiencia})`, valor: mercado.medio },
            { id: 'mercado-alto', label: `Média Alta do Mercado (${nivelExperiencia})`, valor: mercado.alto }
        ];

        const html = sugestoes.map(s => `
            <div class="valor-item-selectable ${s.id}">
                <input type="radio" id="escolha-${s.id}" name="valor-hora-escolha" value="${s.valor.toFixed(2)}">
                <label for="escolha-${s.id}">
                    <p>${s.label}</p>
                    <strong>${this.formatarMoeda(s.valor)}</strong>
                </label>
            </div>`
        ).join('');
        
        $(this.SELECTORS.SUGESTOES_CONTAINER).html(html);
    },

    handleValorEscolhido(e) {
        const valorHoraEscolhido = parseFloat(e.target.value);
        this.gerarRelatorioDetalhado(valorHoraEscolhido);
    },

    // NOVA FUNÇÃO para controlar a exibição dos blocos
    handleTipoRelatorioChange() {
        const tipoEscolhido = $(this.SELECTORS.RELATORIO_TIPO_CHOOSER + ":checked").val();
        const $content = $('.cartilha-content');
        const $mensal = $('#bloco-mensal');
        const $hora = $('#bloco-hora');
        const $jornada = $('#bloco-jornada');

        // Reseta o estado
        $content.removeClass('view-ambos');
        $mensal.hide();
        $hora.hide();
        $jornada.hide();

        if (tipoEscolhido === 'ambos') {
            $content.addClass('view-ambos');
            $mensal.fadeIn(200);
            $hora.fadeIn(200);
            $jornada.fadeIn(200);
        } else if (tipoEscolhido === 'mensal') {
            $mensal.fadeIn(200);
            $jornada.fadeIn(200);
        } else if (tipoEscolhido === 'hora') {
            $hora.fadeIn(200);
            $jornada.fadeIn(200);
        }
    },

    gerarRelatorioDetalhado(valorHoraEscolhido) {
        const d = this.dadosCalculados;
        
        // --- CÁLCULOS MENSAIS ---
        const faturamentoBrutoMensal = valorHoraEscolhido * d.horasProdutivasMes;
        const valorImpostosFinalMensal = faturamentoBrutoMensal * (d.impostoPercent / 100);
        const totalSaidasMensal = d.custosFixos + d.beneficios + d.provisaoMensal + valorImpostosFinalMensal;
        const valorLiquidoFinalMensal = faturamentoBrutoMensal - totalSaidasMensal;

        // --- CÁLCULOS POR HORA ---
        const valorBrutoHora = valorHoraEscolhido;
        const custosPorHora = d.horasProdutivasMes > 0 ? d.custosFixos / d.horasProdutivasMes : 0;
        const beneficiosPorHora = d.horasProdutivasMes > 0 ? d.beneficios / d.horasProdutivasMes : 0;
        const provisaoPorHora = d.horasProdutivasMes > 0 ? d.provisaoMensal / d.horasProdutivasMes : 0;
        const impostosPorHora = valorBrutoHora * (d.impostoPercent / 100);
        const valorLiquidoHora = valorBrutoHora - custosPorHora - beneficiosPorHora - provisaoPorHora - impostosPorHora;
        const valorHoraExtra = valorBrutoHora * 1.5;

        // Preenche o Relatório
        $('#cartilha-valor-hora-escolhido').text(this.formatarMoeda(valorHoraEscolhido));
        
        // Visão Mensal
        $('#cartilha-bruto-mensal').text(this.formatarMoeda(faturamentoBrutoMensal));
        $('#cartilha-custos-fixos').text(this.formatarMoeda(d.custosFixos));
        $('#cartilha-beneficios').text(this.formatarMoeda(d.beneficios));
        $('#cartilha-provisao').text(this.formatarMoeda(d.provisaoMensal));
        $('#cartilha-imposto-percent').text(d.impostoPercent);
        $('#cartilha-impostos-valor').text(this.formatarMoeda(valorImpostosFinalMensal));
        $('#cartilha-liquido-mensal').text(this.formatarMoeda(valorLiquidoFinalMensal));

        // Visão por Hora
        $('#cartilha-bruto-hora').text(this.formatarMoeda(valorBrutoHora));
        $('#cartilha-custos-hora').text(this.formatarMoeda(custosPorHora));
        $('#cartilha-beneficios-hora').text(this.formatarMoeda(beneficiosPorHora));
        $('#cartilha-provisao-hora').text(this.formatarMoeda(provisaoPorHora));
        $('#cartilha-impostos-hora').text(this.formatarMoeda(impostosPorHora));
        $('#cartilha-liquido-hora').text(this.formatarMoeda(valorLiquidoHora));
        $('#cartilha-extra-hora').text(this.formatarMoeda(valorHoraExtra));
        
        // Jornada
        $('#cartilha-jornada-texto').text(`${d.horasDia}h/dia, ${d.diasSemana} dias/semana`);
        $('#cartilha-horas-dia').text(d.horasProdutivasDia.toFixed(1).replace('.', ',') + 'h');

        $(this.SELECTORS.RELATORIO_DETALHADO).slideDown();
        $(this.SELECTORS.BTN_IMPRIMIR).fadeIn();
        // ATUALIZADO: Chama a função para exibir o tipo de relatório correto
        this.handleTipoRelatorioChange();
    },

    // --- MÉTODOS AUXILIARES ---

    formatarMoeda: (valor) => (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
};

// Inicia a aplicação.
CalculadoraFreela.init();