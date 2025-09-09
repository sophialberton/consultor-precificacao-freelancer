// Objeto principal para encapsular a lógica do Consultor de Precificação
const Consultor = {
    // Estado da aplicação
    passoAtual: 1,
    totalPassos: 0,
    dadosCalculo: {},

    // Constantes
    SEL: { 
        FIELDSET: "fieldset",
        PROXIMO_BTN: ".proximo",
        ANTERIOR_BTN: ".anterior",
        BARRA_PROG: "#barra-progresso li",
        PROGRESS_BAR: ".progress-bar",
        BTN_IMPRIMIR: "#btn-imprimir",
        SUGESTOES_CONTAINER: "#valor-hora-sugestoes",
        RELATORIO_DETALHADO: "#cartilha-detalhada",
    },
    MULTIPLICADORES: { 
        iniciante: 1.25,
        intermediario: 1.5,
        avancado: 2.0
    },

    // Inicialização
    init: function() {
        this.totalPassos = $(this.SEL.FIELDSET).length;
        this.bindEvents();
        this.atualizarBarraProgresso();
    },

    bindEvents: function() {
        $(this.SEL.PROXIMO_BTN).on("click", this.proximoPasso.bind(this));
        $(this.SEL.ANTERIOR_BTN).on("click", this.passoAnterior.bind(this));
        $(this.SEL.BTN_IMPRIMIR).on("click", () => window.print());
        // Evento para quando o usuário escolher um valor/hora
        $(this.SEL.SUGESTOES_CONTAINER).on("change", 'input[name="valor-hora-escolha"]', this.handleValorEscolhido.bind(this));
    },

    proximoPasso: function() {
        if (this.passoAtual === 1 && !this.validarEtapa1()) return;

        if (this.passoAtual === 1) {
            this.calcularCustosBase();
            $("#previa-valor-hora-custo").text(this.formatarMoeda(this.dadosCalculo.valorMinimo));
        }
        
        if (this.passoAtual === 2) {
            this.calcularValoresSugeridos();
            this.apresentarSugestoes(); 
        }

        if (this.passoAtual < this.totalPassos) {
            const $etapaAtual = $(this.SEL.FIELDSET).eq(this.passoAtual - 1);
            const $proximaEtapa = $etapaAtual.next();
            this.transicaoEtapa($etapaAtual, $proximaEtapa);
            this.passoAtual++;
            this.atualizarBarraProgresso();
        }
    },

    passoAnterior: function() {
        if (this.passoAtual > 1) {
            $(this.SEL.RELATORIO_DETALHADO).slideUp();
            $(this.SEL.BTN_IMPRIMIR).fadeOut();
            const $etapaAtual = $(this.SEL.FIELDSET).eq(this.passoAtual - 1);
            const $etapaAnterior = $etapaAtual.prev();
            this.transicaoEtapa($etapaAtual, $etapaAnterior);
            this.passoAtual--;
            this.atualizarBarraProgresso();
        }
    },
    
    transicaoEtapa: function($saida, $entrada) {
        $saida.fadeOut(200, () => $entrada.fadeIn(200));
    },

    atualizarBarraProgresso: function() {
        const percentual = (this.passoAtual / this.totalPassos) * 100;
        $(this.SEL.PROGRESS_BAR).css("width", percentual + "%");
        $(this.SEL.BARRA_PROG).removeClass("ativo").slice(0, this.passoAtual).addClass("ativo");
    },

    validarEtapa1: function() {
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

    // Etapa 1: Calcula todos os custos e o valor mínimo
    calcularCustosBase: function() {
        const d = this.dadosCalculo;
        d.salarioLiquido = parseFloat($('#salario-desejado').val()) || 0;
        d.beneficios = parseFloat($('#beneficios-mensais').val()) || 0;
        d.custosFixos = parseFloat($('#custos-fixos').val()) || 0;
        d.impostoPercent = parseFloat($('#impostos-percentual').val()) || 0;
        
        d.provisaoMensal = (d.salarioLiquido / 12) * 2;
        const baseCalculoImposto = d.salarioLiquido + d.beneficios + d.provisaoMensal;
        d.valorImpostos = baseCalculoImposto * (d.impostoPercent / 100);
        
        d.horasDia = parseInt($('#horas-diarias').val());
        d.diasSemana = parseInt($('#dias-trabalho').val());
        d.diasFeriasAno = parseInt($('#dias-ferias').val());
        
        const diasUteisAno = (d.diasSemana * 52) - d.diasFeriasAno;
        d.horasProdutivasMes = (diasUteisAno * d.horasDia * 0.75) / 12;

        const custoTotalMensal = d.custosFixos + d.beneficios + d.provisaoMensal + d.valorImpostos;
        d.valorMinimo = (d.horasProdutivasMes > 0) ? (d.salarioLiquido + custoTotalMensal) / d.horasProdutivasMes : 0;
    },
    
    // Etapa 2: Calcula os valores de mercado e premium
    calcularValoresSugeridos: function() {
        const nivel = $('#nivel-experiencia').val();
        const multiplicador = this.MULTIPLICADORES[nivel];
        this.dadosCalculo.valorMercado = this.dadosCalculo.valorMinimo * multiplicador;
        this.dadosCalculo.valorPremium = this.dadosCalculo.valorMercado * 1.35;
    },

    // Etapa 3 (Início): Mostra as opções de valor/hora para o usuário
    apresentarSugestoes: function() {
        const d = this.dadosCalculo;
        const nivel = $('#nivel-experiencia').val();

        // Valores de mercado baseados em pesquisa para o mercado BR de tecnologia/design.
        const VALORES_MERCADO_BR = {
            iniciante:    { baixo: 45, medio: 60, alto: 80 },
            intermediario: { baixo: 70, medio: 90, alto: 120 },
            avancado:     { baixo: 100, medio: 150, alto: 200 }
        };

        const mercado = VALORES_MERCADO_BR[nivel];

        const sugestoes = [
            { id: 'calculo', label: 'Resultado do seu Cálculo (Equilíbrio)', valor: d.valorMinimo },
            { id: 'mercado-baixo', label: 'Valor/Hora Baixo da média no mercado', valor: mercado.baixo },
            { id: 'mercado-media', label: 'Valor/Hora na Média do mercado', valor: mercado.medio },
            { id: 'mercado-alto', label: 'Valor/Hora Alto da média no mercado', valor: mercado.alto }
        ];

        let html = '';
        sugestoes.forEach(s => {
            html += `
                <div class="valor-item-selectable ${s.id}">
                    <input type="radio" id="escolha-${s.id}" name="valor-hora-escolha" value="${s.valor.toFixed(2)}">
                    <label for="escolha-${s.id}">
                        <p>${s.label}</p>
                        <strong>${this.formatarMoeda(s.valor)}</strong>
                    </label>
                </div>`;
        });
        $(this.SEL.SUGESTOES_CONTAINER).html(html);
    },

    // Etapa 3 (Ação): Usuário escolheu um valor, agora gera o relatório
    handleValorEscolhido: function(e) {
        const valorEscolhido = parseFloat(e.target.value);
        this.gerarRelatorioDetalhado(valorEscolhido);
        $(this.SEL.RELATORIO_DETALHADO).slideDown();
        $(this.SEL.BTN_IMPRIMIR).fadeIn();
    },
    
    // Etapa 3 (Final): Preenche o relatório com base no valor/hora escolhido
    gerarRelatorioDetalhado: function(valorHoraEscolhido) {
        const d = this.dadosCalculo;
        const faturamentoBruto = valorHoraEscolhido * d.horasProdutivasMes;
        const valorImpostosFinal = faturamentoBruto * (d.impostoPercent / 100);
        const totalSaidas = d.custosFixos + d.beneficios + d.provisaoMensal + valorImpostosFinal;
        const valorLiquidoFinal = faturamentoBruto - totalSaidas;

        $('#cartilha-valor-hora-escolhido').text(this.formatarMoeda(valorHoraEscolhido));

        // Demonstrativo
        $('#cartilha-bruto').text(this.formatarMoeda(faturamentoBruto));
        $('#cartilha-custos-fixos').text(this.formatarMoeda(d.custosFixos));
        $('#cartilha-beneficios').text(this.formatarMoeda(d.beneficios));
        $('#cartilha-provisao').text(this.formatarMoeda(d.provisaoMensal));
        $('#cartilha-imposto-percent').text(d.impostoPercent);
        $('#cartilha-impostos-valor').text(this.formatarMoeda(valorImpostosFinal));
        $('#cartilha-liquido').text(this.formatarMoeda(valorLiquidoFinal));

        // Jornada
        $('#cartilha-jornada-texto').text(`${d.horasDia}h/dia, ${d.diasSemana} dias/semana`);
        $('#cartilha-horas-mes').text(d.horasProdutivasMes.toFixed(1).replace('.', ',') + 'h');
    },
    
    formatarMoeda: (valor) => (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
};

$(document).ready(() => Consultor.init());

