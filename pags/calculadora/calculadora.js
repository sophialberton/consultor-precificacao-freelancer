$(document).ready(function(){
    // Variáveis globais
    let custos = [];
    let valorHora = 0;
    //Comentário init
    // Configuração do formulário em etapas
    var etapaAtual, proximaEtapa, etapaAnterior;
    var passoAtual = 1;
    var totalPassos = $("fieldset").length;
    
    atualizarBarraProgresso(passoAtual);
    
    // Botão Próximo
    $(".next").click(function(){
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
        
        $("#progressbar li").eq($("fieldset").index(proximaEtapa)).addClass("active");
        
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
    $(".previous").click(function(){
        etapaAtual = $(this).parent();
        etapaAnterior = $(this).parent().prev();
        
        $("#progressbar li").eq($("fieldset").index(etapaAtual)).removeClass("active");
        
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
    function atualizarBarraProgresso(passoAtual){
        var percentual = parseFloat(100 / totalPassos) * passoAtual;
        percentual = percentual.toFixed();
        $(".progress-bar")
            .css("width",percentual+"%")
            .attr("aria-valuenow", percentual);
    }
    
    // Validação da Etapa 1
    function validarEtapa1() {
        const salario = parseFloat($("#desired-salary").val());
        const horasDia = parseInt($("#daily-hours").val());
        const diasSemana = parseInt($("#work-days").val());
        const diasFerias = parseInt($("#vacation-days").val());
        
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
    const salarioLiquido = parseFloat($("#desired-salary").val()) || 0;
    const horasDia = parseInt($("#daily-hours").val()) || 8;
    const diasSemana = parseInt($("#work-days").val()) || 5;
    const diasFerias = parseInt($("#vacation-days").val()) || 30;
    
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
    const custosFixos = custos.filter(c => c.tipo === 'fixed')
                          .reduce((soma, custo) => soma + parseFloat(custo.valor), 0);
    
    // 6. Cálculo final com margem de segurança
    valorHora = (salarioLiquido + custosFixos) * margemSeguranca / (horasProdutivasAno / 12);
    
    return valorHora;
}
    
    // Atualiza o preview do valor hora
    function atualizarPreviaValorHora() {
        $("#hour-value-preview").text("R$ " + valorHora.toFixed(2).replace(".", ","));
    }
    
    // Adicionar custo
    $("#add-cost").click(function() {
        const descricao = $("#cost-description").val().trim();
        const valor = parseFloat($("#cost-value").val());
        const tipo = $("#cost-type").val();
        
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
        $("#cost-description").val("");
        $("#cost-value").val("");
    });
    
    // Renderiza a lista de custos
    function renderizarCustos() {
        $("#costs-container").empty();
        
        custos.forEach(custo => {
            const elementoCusto = $(`
                <div class="cost-item" data-id="${custo.id}">
                    <div>
                        <strong>${custo.descricao}</strong><br>
                        R$ ${custo.valor.toFixed(2).replace(".", ",")} (${custo.tipo === 'fixed' ? 'Fixo' : 'Variável'})
                    </div>
                    <button class="remove-cost">Remover</button>
                </div>
            `);
            $("#costs-container").append(elementoCusto);
        });
        
        // Adiciona evento de remoção
        $(".remove-cost").click(function() {
            const id = parseInt($(this).parent().attr("data-id"));
            custos = custos.filter(c => c.id !== id);
            renderizarCustos();
        });
    }
    
    // Cálculo do valor do projeto
    function calcularValorProjeto() {
        const horasDiaProjeto = parseInt($("#project-daily-hours").val());
        const diasProjeto = parseInt($("#project-days").val());
        
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
        const custosVariaveis = custos.filter(c => c.tipo === 'variable')
                                 .reduce((soma, custo) => soma + parseFloat(custo.valor), 0);
        
        valorProjeto += custosVariaveis;
        
        // Atualizar exibição
        $("#project-value-result").text("R$ " + valorProjeto.toFixed(2).replace(".", ","));
        $("#final-hour-value").text("R$ " + valorHora.toFixed(2).replace(".", ","));
        
        // Atualizar resumo de custos
        renderizarResumoCustos();
    }
    
    // Renderiza o resumo de custos
    function renderizarResumoCustos() {
        $("#costs-summary").empty();
        
        const custosFixos = custos.filter(c => c.tipo === 'fixed');
        const custosVariaveis = custos.filter(c => c.tipo === 'variable');
        
        if(custosFixos.length > 0) {
            $("#costs-summary").append("<h5>Custos Fixos</h5>");
            custosFixos.forEach(custo => {
                $("#costs-summary").append(`
                    <div class="cost-item">
                        <div>${custo.descricao}</div>
                        <div>R$ ${custo.valor.toFixed(2).replace(".", ",")}</div>
                    </div>
                `);
            });
        }
        
        if(custosVariaveis.length > 0) {
            $("#costs-summary").append("<h5 class='mt-3'>Custos Variáveis</h5>");
            custosVariaveis.forEach(custo => {
                $("#costs-summary").append(`
                    <div class="cost-item">
                        <div>${custo.descricao}</div>
                        <div>R$ ${custo.valor.toFixed(2).replace(".", ",")}</div>
                    </div>
                `);
            });
        }
        
        if(custos.length === 0) {
            $("#costs-summary").append("<p>Nenhum custo adicionado</p>");
        }
    }
    
    // Botão recalculcar
    $("#recalculate").click(function() {
        // Volta para a primeira etapa
        passoAtual = 1;
        $("fieldset").hide();
        $("fieldset:first").show();
        $("#progressbar li").removeClass("active");
        $("#progressbar li:first").addClass("active");
        atualizarBarraProgresso(passoAtual);
    });
});