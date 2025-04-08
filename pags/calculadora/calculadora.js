$(document).ready(function(){
    // Variáveis globais
    let custos = [];
    let valorHora = 0;
    // Comentário init
    // Configuração do formulário em etapas
    var etapaAtual, proximaEtapa, etapaAnterior;
    var passoAtual = 1;
    var totalPassos = $("fieldset").length;
    
    atualizarBarraProgresso(passoAtual);
    
    // Botão Próximo
    $(".proximo").click(function(){
        // Validação antes de avançar
        if(passoAtual === 1) {
            if(!validarEtapa1()) return;
            calcularValorHora();
            atualizarPreviaValorHora();
        } else if(passoAtual === 2) {
            // Validação opcional para custos
        } else if(passoAtual === 3) {
            calcularValorProjeto();
        }
        
        etapaAtual = $(this).parent();
        proximaEtapa = $(this).parent().next();
        
        $("#barra-progresso li").eq($("fieldset").index(proximaEtapa)).addClass("ativo");
        
        proximaEtapa.show();
        etapaAtual.animate({opacity: 0}, {
            step: function(now) {
                etapaAtual.css({
                    'display': 'none',
                    'position': 'relative'
                });
                proximaEtapa.css({'opacity': 1});
            },
            duration: 500
        });
        atualizarBarraProgresso(++passoAtual);
    });
    
    // Botão Anterior
    $(".anterior").click(function(){
        etapaAtual = $(this).parent();
        etapaAnterior = $(this).parent().prev();
        
        $("#barra-progresso li").eq($("fieldset").index(etapaAtual)).removeClass("ativo");
        
        etapaAnterior.show();
        etapaAtual.animate({opacity: 0}, {
            step: function(now) {
                etapaAtual.css({
                    'display': 'none',
                    'position': 'relative'
                });
                etapaAnterior.css({'opacity': 1});
            },
            duration: 500
        });
        atualizarBarraProgresso(--passoAtual);
    });
    
    // Atualiza a barra de progresso
    function atualizarBarraProgresso(passoAtual) {
        var percentual = parseFloat(100 / totalPassos) * passoAtual;
        percentual = percentual.toFixed();
        
        // Atualiza a barra de progresso visual
        $(".progress-bar")
            .css("width", percentual + "%")
            .attr("aria-valuenow", percentual);
        
        // Atualiza os passos ativos na barra de navegação
        $("#barra-progresso li").removeClass("ativo");
        
        // Adiciona a classe 'ativo' para todos os passos até o atual
        for (var i = 0; i < passoAtual; i++) {
            $("#barra-progresso li").eq(i).addClass("ativo");
        }
    }
    
    // Validação da Etapa 1
    function validarEtapa1() {
        const salario = parseFloat($("#salario-desejado").val());
        const horasDia = parseInt($("#horas-diarias").val());
        const diasSemana = parseInt($("#dias-trabalho").val());
        const diasFerias = parseInt($("#dias-ferias").val());
        
        if(isNaN(salario)) {
            alert("Por favor, insira um salário válido.");
            return false;
        }
        
        if(salario <= 0) {
            alert("O salário deve ser maior que zero.");
            return false;
        }
        
        if(isNaN(horasDia)) {
            alert("Por favor, insira horas diárias válidas.");
            return false;
        }
        
        if(horasDia <= 0 || horasDia > 24) {
            alert("As horas diárias devem estar entre 1 e 24.");
            return false;
        }
        
        if(isNaN(diasSemana)) {
            alert("Por favor, insira dias de trabalho válidos.");
            return false;
        }
        
        if(diasSemana <= 0 || diasSemana > 7) {
            alert("Os dias de trabalho devem estar entre 1 e 7.");
            return false;
        }
        
        if(isNaN(diasFerias)) {
            alert("Por favor, insira dias de férias válidos.");
            return false;
        }
        
        if(diasFerias < 0 || diasFerias > 365) {
            alert("Os dias de férias devem estar entre 0 e 365.");
            return false;
        }
        
        return true;
    }
    
    // Cálculo do valor da hora (versão atualizada e mais realista)
    function calcularValorHora() {
        // 1. Obter valores básicos do formulário
        const salarioLiquido = parseFloat($("#salario-desejado").val()) || 0;
        const horasDia = parseInt($("#horas-diarias").val()) || 8;
        const diasSemana = parseInt($("#dias-trabalho").val()) || 5;
        const diasFerias = parseInt($("#dias-ferias").val()) || 30;
        
        // 2. Configurações adicionais para cálculo realista
        const horasProdutivasPorDia = horasDia * 0.75; // Considera 75% do tempo como produtivo
        const margemSeguranca = 1.4; // 40% para impostos, dias sem trabalho e lucro
        
        // 3. Calcular dias úteis no ano (365 dias - fins de semana - férias)
        const semanasAno = 52;
        const finsDeSemanaPorSemana = 7 - diasSemana;
        const totalFinsDeSemana = semanasAno * finsDeSemanaPorSemana;
        const diasUteisAno = 365 - totalFinsDeSemana - diasFerias;
        
        // 4. Calcular horas produtivas por ano
        const horasProdutivasAno = diasUteisAno * horasProdutivasPorDia;
        
        // 5. Somar todos os custos fixos
        const custosFixos = custos.filter(c => c.tipo === 'fixo')
                              .reduce((soma, custo) => soma + parseFloat(custo.valor), 0);
        
        // 6. Cálculo final com margem de segurança
        valorHora = (salarioLiquido + custosFixos) * margemSeguranca / (horasProdutivasAno / 12);
        
        return valorHora;
    }
    
    // Atualiza o preview do valor hora
    function atualizarPreviaValorHora() {
        $("#previa-valor-hora").text("R$ " + valorHora.toFixed(2).replace(".", ","));
    }
    
    // Adicionar custo
    $("#adicionar-custo").click(function() {
        const descricao = $("#descricao-custo").val().trim();
        const valor = parseFloat($("#valor-custo").val());
        const tipo = $("#tipo-custo").val();
        
        if(!descricao) {
            alert("Por favor, insira uma descrição para o custo.");
            return;
        }
        
        if(isNaN(valor)) {
            alert("Por favor, insira um valor válido para o custo.");
            return;
        }
        
        if(valor <= 0) {
            alert("O valor do custo deve ser maior que zero.");
            return;
        }
        
        const custo = {
            id: Date.now(),
            descricao: descricao,
            valor: valor,
            tipo: tipo
        };
        
        custos.push(custo);
        renderizarCustos();
        
        // Limpar campos
        $("#descricao-custo").val("");
        $("#valor-custo").val("");
    });
    
    // Renderiza a lista de custos
    function renderizarCustos() {
        $("#container-custos").empty();
        
        custos.forEach(custo => {
            const elementoCusto = $(`
                <div class="item-custo" data-id="${custo.id}">
                    <div>
                        <strong>${custo.descricao}</strong><br>
                        R$ ${custo.valor.toFixed(2).replace(".", ",")} (${custo.tipo === 'fixo' ? 'Fixo' : 'Variável'})
                    </div>
                    <button class="remover-custo">Remover</button>
                </div>
            `);
            $("#container-custos").append(elementoCusto);
        });
        
        // Adiciona evento de remoção
        $(".remover-custo").click(function() {
            const id = parseInt($(this).parent().attr("data-id"));
            custos = custos.filter(c => c.id !== id);
            renderizarCustos();
        });
    }
    
    // Cálculo do valor do projeto
    function calcularValorProjeto() {
        const horasDiaProjeto = parseInt($("#horas-diarias-projeto").val());
        const diasProjeto = parseInt($("#dias-projeto").val());
        
        if(isNaN(horasDiaProjeto)) {
            alert("Por favor, insira horas diárias válidas para o projeto.");
            return;
        }
        
        if(horasDiaProjeto <= 0 || horasDiaProjeto > 24) {
            alert("As horas diárias do projeto devem estar entre 1 e 24.");
            return;
        }
        
        if(isNaN(diasProjeto)) {
            alert("Por favor, insira dias válidos para o projeto.");
            return;
        }
        
        if(diasProjeto <= 0) {
            alert("O projeto deve ter pelo menos 1 dia de duração.");
            return;
        }
        
        // Calcular horas totais do projeto
        const horasTotaisProjeto = horasDiaProjeto * diasProjeto;
        
        // Calcular valor base do projeto
        let valorProjeto = horasTotaisProjeto * valorHora;
        
        // Adicionar custos variáveis
        const custosVariaveis = custos.filter(c => c.tipo === 'variavel')
                                 .reduce((soma, custo) => soma + parseFloat(custo.valor), 0);
        
        valorProjeto += custosVariaveis;
        
        // Atualizar exibição
        $("#resultado-valor-projeto").text("R$ " + valorProjeto.toFixed(2).replace(".", ","));
        $("#valor-hora-final").text("R$ " + valorHora.toFixed(2).replace(".", ","));
        
        // Atualizar resumo de custos
        renderizarResumoCustos();
    }
    
    // Renderiza o resumo de custos
    function renderizarResumoCustos() {
        $("#resumo-custos").empty();
        
        const custosFixos = custos.filter(c => c.tipo === 'fixo');
        const custosVariaveis = custos.filter(c => c.tipo === 'variavel');
        
        if(custosFixos.length > 0) {
            $("#resumo-custos").append("<h5>Custos Fixos</h5>");
            custosFixos.forEach(custo => {
                $("#resumo-custos").append(`
                    <div class="item-custo">
                        <div>${custo.descricao}</div>
                        <div>R$ ${custo.valor.toFixed(2).replace(".", ",")}</div>
                    </div>
                `);
            });
        }
        
        if(custosVariaveis.length > 0) {
            $("#resumo-custos").append("<h5 class='mt-3'>Custos Variáveis</h5>");
            custosVariaveis.forEach(custo => {
                $("#resumo-custos").append(`
                    <div class="item-custo">
                        <div>${custo.descricao}</div>
                        <div>R$ ${custo.valor.toFixed(2).replace(".", ",")}</div>
                    </div>
                `);
            });
        }
        
        if(custos.length === 0) {
            $("#resumo-custos").append("<p>Nenhum custo adicionado</p>");
        }
    }
    
    // Botão recalculcar
    $("#recalcular").click(function() {
        // Volta para a primeira etapa
        passoAtual = 1;
        $("fieldset").hide();
        $("fieldset:first").show();
        $("#barra-progresso li").removeClass("ativo");
        $("#barra-progresso li:first").addClass("ativo");
        atualizarBarraProgresso(passoAtual);
    });
});