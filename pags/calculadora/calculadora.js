$(document).ready(function(){
    // Variáveis globais
    let custos = []; // Array para armazenar todos os custos adicionados
    let valorHora = 0; // Variável para armazenar o valor calculado da hora de trabalho
    
    // Configuração do formulário em etapas
    var etapaAtual, proximaEtapa, etapaAnterior; // Variáveis para controle das etapas
    var passoAtual = 1; // Contador da etapa atual (começa na etapa 1)
    var totalPassos = $("fieldset").length; // Conta quantas etapas existem no formulário
    
    // Inicializa a barra de progresso
    atualizarBarraProgresso(passoAtual);
    
    // Botão Próximo - avança para próxima etapa do formulário
    $(".next").click(function(){
        // Validação antes de avançar
        if(passoAtual === 1) {
            // Valida os dados da etapa 1 antes de prosseguir
            if(!validarEtapa1()) return;
            // Calcula o valor da hora com os dados informados
            calcularValorHora();
            // Atualiza o preview do valor da hora
            atualizarPreviaValorHora();
        } else if(passoAtual === 2) {
            // Validação opcional para custos (não implementada)
        } else if(passoAtual === 3) {
            // Na última etapa, calcula o valor total do projeto
            calcularValorProjeto();
        }
        
        // Obtém a etapa atual e a próxima
        etapaAtual = $(this).parent();
        proximaEtapa = $(this).parent().next();
        
        // Atualiza a barra de progresso visual
        $("#progressbar li").eq($("fieldset").index(proximaEtapa)).addClass("active");
        
        // Animação de transição entre etapas
        proximaEtapa.show();
        etapaAtual.animate({opacity: 0}, {
            step: function(now) {
                etapaAtual.css({
                    'display': 'none',
                    'position': 'relative'
                });
                proximaEtapa.css({'opacity': 1});
            },
            duration: 500 // Duração da animação em milissegundos
        });
        // Atualiza o contador de etapas e a barra de progresso
        atualizarBarraProgresso(++passoAtual);
    });
    
    // Botão Anterior - volta para etapa anterior do formulário
    $(".previous").click(function(){
        // Obtém a etapa atual e a anterior
        etapaAtual = $(this).parent();
        etapaAnterior = $(this).parent().prev();
        
        // Remove a classe 'active' da etapa atual na barra de progresso
        $("#progressbar li").eq($("fieldset").index(etapaAtual)).removeClass("active");
        
        // Animação de transição entre etapas
        etapaAnterior.show();
        etapaAtual.animate({opacity: 0}, {
            step: function(now) {
                etapaAtual.css({
                    'display': 'none',
                    'position': 'relative'
                });
                etapaAnterior.css({'opacity': 1});
            },
            duration: 500 // Duração da animação em milissegundos
        });
        // Atualiza o contador de etapas e a barra de progresso
        atualizarBarraProgresso(--passoAtual);
    });
    
    // Função para atualizar a barra de progresso linear
    function atualizarBarraProgresso(passoAtual){
        // Calcula a porcentagem completada
        var percentual = parseFloat(100 / totalPassos) * passoAtual;
        percentual = percentual.toFixed(); // Arredonda para número inteiro
        
        // Atualiza a largura da barra e o atributo ARIA
        $(".progress-bar")
            .css("width",percentual+"%")
            .attr("aria-valuenow", percentual);
    }
    
    // Função para validar os dados da etapa 1
    function validarEtapa1() {
        // Obtém os valores dos campos
        const salario = parseFloat($("#desired-salary").val());
        const horasDia = parseInt($("#daily-hours").val());
        const diasSemana = parseInt($("#work-days").val());
        const diasFerias = parseInt($("#vacation-days").val());
        
        // Validações para cada campo
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
        
        // Se todas as validações passarem
        return true;
    }
    
    // Função para calcular o valor da hora de trabalho
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
    
    // Atualiza o preview do valor hora na interface
    function atualizarPreviaValorHora() {
        // Formata o valor para exibição (R$ 00,00)
        $("#hour-value-preview").text("R$ " + valorHora.toFixed(2).replace(".", ","));
    }
    
    // Evento para adicionar um novo custo
    $("#add-cost").click(function() {
        // Obtém os valores dos campos
        const descricao = $("#cost-description").val().trim();
        const valor = parseFloat($("#cost-value").val());
        const tipo = $("#cost-type").val();
        
        // Validações
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
        
        // Cria objeto do custo
        const custo = {
            id: Date.now(), // ID único baseado no timestamp
            descricao: descricao,
            valor: valor,
            tipo: tipo
        };
        
        // Adiciona ao array de custos
        custos.push(custo);
        // Atualiza a lista na interface
        renderizarCustos();
        
        // Limpa os campos do formulário
        $("#cost-description").val("");
        $("#cost-value").val("");
    });
    
    // Renderiza a lista de custos na interface
    function renderizarCustos() {
        // Limpa o container
        $("#costs-container").empty();
        
        // Para cada custo, cria um elemento HTML
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
            // Adiciona ao container
            $("#costs-container").append(elementoCusto);
        });
        
        // Adiciona evento de clique para os botões de remoção
        $(".remove-cost").click(function() {
            // Obtém o ID do custo a ser removido
            const id = parseInt($(this).parent().attr("data-id"));
            // Filtra o array removendo o custo com este ID
            custos = custos.filter(c => c.id !== id);
            // Re-renderiza a lista
            renderizarCustos();
        });
    }
    
    // Calcula o valor total do projeto
    function calcularValorProjeto() {
        // Obtém os valores dos campos
        const horasDiaProjeto = parseInt($("#project-daily-hours").val());
        const diasProjeto = parseInt($("#project-days").val());
        
        // Validações
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
        
        // Calcular valor base do projeto (horas × valor da hora)
        let valorProjeto = horasTotaisProjeto * valorHora;
        
        // Adicionar custos variáveis ao valor total
        const custosVariaveis = custos.filter(c => c.tipo === 'variable')
                                 .reduce((soma, custo) => soma + parseFloat(custo.valor), 0);
        
        valorProjeto += custosVariaveis;
        
        // Atualizar exibição dos resultados
        $("#project-value-result").text("R$ " + valorProjeto.toFixed(2).replace(".", ","));
        $("#final-hour-value").text("R$ " + valorHora.toFixed(2).replace(".", ","));
        
        // Atualizar o resumo de custos
        renderizarResumoCustos();
    }
    
    // Renderiza o resumo de custos na etapa final
    function renderizarResumoCustos() {
        // Limpa o container
        $("#costs-summary").empty();
        
        // Separa custos fixos e variáveis
        const custosFixos = custos.filter(c => c.tipo === 'fixed');
        const custosVariaveis = custos.filter(c => c.tipo === 'variable');
        
        // Adiciona custos fixos ao resumo
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
        
        // Adiciona custos variáveis ao resumo
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
        
        // Mensagem caso não haja custos
        if(custos.length === 0) {
            $("#costs-summary").append("<p>Nenhum custo adicionado</p>");
        }
    }
    
    // Botão para recomeçar o cálculo
    $("#recalculate").click(function() {
        // Reseta para a primeira etapa
        passoAtual = 1;
        // Esconde todos os fieldsets
        $("fieldset").hide();
        // Mostra apenas o primeiro
        $("fieldset:first").show();
        // Reseta a barra de progresso
        $("#progressbar li").removeClass("active");
        $("#progressbar li:first").addClass("active");
        // Atualiza a barra de progresso linear
        atualizarBarraProgresso(passoAtual);
    });
});