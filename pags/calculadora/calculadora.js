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
    $(".proximo").click(function(){
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
        $("#barra-progresso li").eq($("fieldset").index(proximaEtapa)).addClass("ativo");
        
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
    $(".anterior").click(function(){
        // Obtém a etapa atual e a anterior
        etapaAtual = $(this).parent();
        etapaAnterior = $(this).parent().prev();
        
        // Remove a classe 'active' da etapa atual na barra de progresso
        $("#barra-progresso li").eq($("fieldset").index(etapaAtual)).removeClass("ativo");
        
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
    function atualizarBarraProgresso(passoAtual) {
        // Calcula a porcentagem completada
        var percentual = parseFloat(100 / totalPassos) * passoAtual;
        percentual = percentual.toFixed(); // Arredonda para número inteiro
        
        // Atualiza a largura da barra e o atributo ARIA
        
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
    
    // Função para validar os dados da etapa 1
    function validarEtapa1() {
        // Obtém os valores dos campos
        const salario = parseFloat($("#salario-desejado").val());
        const horasDia = parseInt($("#horas-diarias").val());
        const diasSemana = parseInt($("#dias-trabalho").val());
        const diasFerias = parseInt($("#dias-ferias").val());
        
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
    
    // Atualiza o preview do valor hora na interface
    function atualizarPreviaValorHora() {
        // Formata o valor para exibição (R$ 00,00)
        $("#previa-valor-hora").text("R$ " + valorHora.toFixed(2).replace(".", ","));
    }
    
    // Evento para adicionar um novo custo
    $("#adicionar-custo").click(function() {
        // Obtém os valores dos campos
        const descricao = $("#descricao-custo").val().trim();
        const valor = parseFloat($("#valor-custo").val());
        const tipo = $("#tipo-custo").val();
        
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
        $("#descricao-custo").val("");
        $("#valor-custo").val("");
    });
    
    // Renderiza a lista de custos na interface
    function renderizarCustos() {
        // Limpa o container
        $("#container-custos").empty();
        
        // Para cada custo, cria um elemento HTML
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
            // Adiciona ao container
            $("#container-custos").append(elementoCusto);
        });
        
        // Adiciona evento de clique para os botões de remoção
        $(".remover-custo").click(function() {
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
        const horasDiaProjeto = parseInt($("#horas-diarias-projeto").val());
        const diasProjeto = parseInt($("#dias-projeto").val());
        
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
        const custosVariaveis = custos.filter(c => c.tipo === 'variavel')
                                 .reduce((soma, custo) => soma + parseFloat(custo.valor), 0);
        
        valorProjeto += custosVariaveis;
        
        // Atualizar exibição dos resultados
        $("#resultado-valor-projeto").text("R$ " + valorProjeto.toFixed(2).replace(".", ","));
        $("#valor-hora-final").text("R$ " + valorHora.toFixed(2).replace(".", ","));
        
        // Atualizar o resumo de custos
        renderizarResumoCustos();
    }
    
    // Renderiza o resumo de custos na etapa final
    function renderizarResumoCustos() {
        // Limpa o container
        $("#resumo-custos").empty();
        
        // Separa custos fixos e variáveis
        const custosFixos = custos.filter(c => c.tipo === 'fixo');
        const custosVariaveis = custos.filter(c => c.tipo === 'variavel');
        
        // Adiciona custos fixos ao resumo
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
        
        // Adiciona custos variáveis ao resumo
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
        
        // Mensagem caso não haja custos
        if(custos.length === 0) {
            $("#resumo-custos").append("<p>Nenhum custo adicionado</p>");
        }
    }
    
    // Botão para recomeçar o cálculo
    $("#recalcular").click(function() {
        // Reseta para a primeira etapa
        passoAtual = 1;
        // Esconde todos os fieldsets
        $("fieldset").hide();
        // Mostra apenas o primeiro
        $("fieldset:first").show();
        // Reseta a barra de progresso
        $("#barra-progresso li").removeClass("ativo");
        $("#barra-progresso li:first").addClass("ativo");
        // Atualiza a barra de progresso linear
        atualizarBarraProgresso(passoAtual);
    });
});