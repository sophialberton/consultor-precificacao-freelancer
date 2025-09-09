/**
 * @file Script para a Calculadora de Precificação Freelancer
 * @author Sophia Picasky Alberton (Refatorado por Gemini)
 * @version 2.0.0
 */

// Encapsula toda a lógica da aplicação em um objeto para evitar poluir o escopo global.
const CalculadoraFreela = {
    // --- PROPRIEDADES E ESTADO ---
    
    /**
     * Seletors de CSS para os elementos da interface.
     * @type {Object<string, string>}
     */
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
    },

    /**
     * Multiplicadores baseados no nível de experiência para sugerir valor de mercado.
     * @type {Object<string, number>}
     */
    MARGENS_EXPERIENCIA: {
        iniciante: 1.15,     // Custo + 15%
        intermediario: 1.35, // Custo + 35%
        avancado: 1.60,      // Custo + 60%
    },
    
    /**
     * Valores de mercado (exemplo para BR) para sugestões alternativas.
     * @type {Object<string, Object<string, number>>}
     */
    VALORES_MERCADO_BR: {
        iniciante:    { baixo: 45, medio: 60, alto: 80 },
        intermediario: { baixo: 70, medio: 90, alto: 120 },
        avancado:     { baixo: 100, medio: 150, alto: 200 }
    },

    passoAtual: 1,
    totalPassos: 0,
    dadosCalculados: {}, // Armazena os resultados dos cálculos para reuso

    // --- MÉTODOS DE INICIALIZAÇÃO E EVENTOS ---

    /**
     * Ponto de entrada da aplicação.
     */
    init() {
        // Garante que o jQuery está carregado
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

    /**
     * Vincula todos os eventos de interação do usuário.
     */
    bindEvents() {
        const { FORM, PROXIMO_BTN, ANTERIOR_BTN, BTN_IMPRIMIR, SUGESTOES_CONTAINER, NIVEL_EXPERIENCIA } = this.SELECTORS;
        
        // Usando delegação de eventos para performance
        $(FORM)
            .on("click", PROXIMO_BTN, () => this.navegarParaPasso(this.passoAtual + 1))
            .on("click", ANTERIOR_BTN, () => this.navegarParaPasso(this.passoAtual - 1))
            .on("change", NIVEL_EXPERIENCIA, this.handleExperienciaChange.bind(this))
            .on("change", `${SUGESTOES_CONTAINER} input[name="valor-hora-escolha"]`, this.handleValorEscolhido.bind(this));

        $(BTN_IMPRIMIR).on("click", () => window.print());
    },

    // --- MÉTODOS DE NAVEGAÇÃO E UI ---

    /**
     * Centraliza a lógica de navegação entre os passos.
     * @param {number} proximoPasso - O número do passo para o qual navegar.
     */
    navegarParaPasso(proximoPasso) {
        if (proximoPasso > this.passoAtual) {
            // Validações antes de avançar
            if (this.passoAtual === 1 && !this.validarEtapa1()) return;
            if (this.passoAtual === 2) {
                // Garante que o cálculo foi feito antes de mostrar sugestões
                if (!this.dadosCalculados.valorCustoAjustado) {
                    this.handleExperienciaChange(); 
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

    /**
     * Atualiza a barra de progresso visual.
     */
    atualizarBarraProgresso() {
        const percentual = ((this.passoAtual - 1) / (this.totalPassos - 1)) * 100;
        $(this.SELECTORS.PROGRESS_BAR).css("width", `${percentual}%`);
        $(this.SELECTORS.BARRA_PROG_ITEMS).removeClass("ativo").slice(0, this.passoAtual).addClass("ativo");
    },
    
    /**
     * Valida os campos da primeira etapa do formulário.
     * @returns {boolean} - Retorna true se todos os campos forem válidos.
     */
    validarEtapa1() {
        let ehValido = true;
        const campos = [
            { id: '#salario-desejado', min: 1, msg: 'Salário deve ser maior que zero.' },
            { id: '#horas-diarias', min: 1, max: 24, msg: 'Horas devem ser entre 1 e 24.' },
            { id: '#dias-trabalho', min: 1, max: 7, msg: 'Dias devem ser entre 1 e 7.' },
            { id: '#dias-ferias', min: 0, max: 365, msg: 'Férias devem ser entre 0 e 365.' }
        ];

        // Limpa erros anteriores
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

    /**
     * Coleta os dados do formulário da Etapa 1.
     * @returns {Object} - Um objeto com os valores dos inputs.
     */
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

    /**
     * Executa todos os cálculos principais e armazena os resultados.
     */
    executarCalculos() {
        const dados = this.getDadosFormulario();
        
        // 1. Cálculo de Custos e Provisões
        const provisaoMensal = (dados.salarioLiquido / 12) * 2; // 13º + Férias
        const baseCalculoImposto = dados.salarioLiquido + dados.beneficios + provisaoMensal;
        const valorImpostos = baseCalculoImposto * (dados.impostoPercent / 100);
        const custoTotalMensal = dados.custosFixos + dados.beneficios + provisaoMensal + valorImpostos;

        // 2. Cálculo de Horas Produtivas
        const diasUteisAno = (dados.diasSemana * 52) - dados.diasFeriasAno;
        // Fator de 75% para considerar tempo não-faturável (reuniões, prospecção, etc)
        const horasProdutivasMes = (diasUteisAno * dados.horasDia * 0.75) / 12;

        // 3. Valor da Hora de Custo (Ponto de Equilíbrio)
        const valorMinimo = (horasProdutivasMes > 0) 
            ? (dados.salarioLiquido + custoTotalMensal) / horasProdutivasMes 
            : 0;

        // 4. Valor Ajustado pela Experiência
        const multiplicador = this.MARGENS_EXPERIENCIA[dados.nivelExperiencia];
        const valorCustoAjustado = valorMinimo * multiplicador;

        // Armazena os resultados para uso posterior
        this.dadosCalculados = { ...dados, provisaoMensal, valorImpostos, custoTotalMensal, horasProdutivasMes, valorMinimo, valorCustoAjustado };
    },

    /**
     * Lida com a mudança no nível de experiência, recalculando e atualizando a prévia.
     */
    handleExperienciaChange() {
        this.executarCalculos();
        $(this.SELECTORS.PREVIA_VALOR_CUSTO).text(this.formatarMoeda(this.dadosCalculados.valorCustoAjustado));
        $(this.SELECTORS.PREVIA_BOX).slideDown();
    },

    /**
     * Gera e exibe as sugestões de valor/hora na Etapa 3.
     */
    apresentarSugestoes() {
        const { valorCustoAjustado, nivelExperiencia } = this.dadosCalculados;
        const mercado = this.VALORES_MERCADO_BR[nivelExperiencia];

        const sugestoes = [
            { id: 'calculo', label: 'Resultado do seu Cálculo', valor: valorCustoAjustado },
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

    /**
     * Lida com a escolha de um valor/hora final e gera o relatório detalhado.
     * @param {Event} e - O objeto do evento de 'change'.
     */
    handleValorEscolhido(e) {
        const valorHoraEscolhido = parseFloat(e.target.value);
        this.gerarRelatorioDetalhado(valorHoraEscolhido);
    },

    /**
     * Preenche e exibe o relatório final detalhado.
     * @param {number} valorHoraEscolhido - O valor/hora selecionado pelo usuário.
     */
    gerarRelatorioDetalhado(valorHoraEscolhido) {
        const d = this.dadosCalculados;
        const faturamentoBruto = valorHoraEscolhido * d.horasProdutivasMes;
        const valorImpostosFinal = faturamentoBruto * (d.impostoPercent / 100);
        const totalSaidas = d.custosFixos + d.beneficios + d.provisaoMensal + valorImpostosFinal;
        const valorLiquidoFinal = faturamentoBruto - totalSaidas;

        $('#cartilha-valor-hora-escolhido').text(this.formatarMoeda(valorHoraEscolhido));
        $('#cartilha-bruto').text(this.formatarMoeda(faturamentoBruto));
        $('#cartilha-custos-fixos').text(this.formatarMoeda(d.custosFixos));
        $('#cartilha-beneficios').text(this.formatarMoeda(d.beneficios));
        $('#cartilha-provisao').text(this.formatarMoeda(d.provisaoMensal));
        $('#cartilha-imposto-percent').text(d.impostoPercent);
        $('#cartilha-impostos-valor').text(this.formatarMoeda(valorImpostosFinal));
        $('#cartilha-liquido').text(this.formatarMoeda(valorLiquidoFinal));
        $('#cartilha-jornada-texto').text(`${d.horasDia}h/dia, ${d.diasSemana} dias/semana`);
        $('#cartilha-horas-mes').text(d.horasProdutivasMes.toFixed(1).replace('.', ',') + 'h');

        $(this.SELECTORS.RELATORIO_DETALHADO).slideDown();
        $(this.SELECTORS.BTN_IMPRIMIR).fadeIn();
    },

    // --- MÉTODOS AUXILIARES ---

    /**
     * Formata um número para o padrão de moeda brasileiro (BRL).
     * @param {number} valor - O número a ser formatado.
     * @returns {string} - A string formatada.
     */
    formatarMoeda: (valor) => (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
};

// Inicia a aplicação.
CalculadoraFreela.init();