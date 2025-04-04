$(document).ready(function(){
    // Variáveis globais
    let costs = [];
    let hourValue = 0;
    
    // Configuração do formulário em etapas
    var current_fs, next_fs, previous_fs;
    var current = 1;
    var steps = $("fieldset").length;
    
    setProgressBar(current);
    
    // Botão Próximo
    $(".next").click(function(){
        // Validação antes de avançar
        if(current === 1) {
            if(!validateStep1()) return;
            calculateHourValue();
            updateHourValuePreview();
        } else if(current === 2) {
            // Validação opcional para custos
        } else if(current === 3) {
            calculateProjectValue();
        }
        
        current_fs = $(this).parent();
        next_fs = $(this).parent().next();
        
        $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
        
        next_fs.show();
        current_fs.animate({opacity: 0}, {
            step: function(now) {
                current_fs.css({
                    'display': 'none',
                    'position': 'relative'
                });
                next_fs.css({'opacity': 1});
            },
            duration: 500
        });
        setProgressBar(++current);
    });
    
    // Botão Anterior
    $(".previous").click(function(){
        current_fs = $(this).parent();
        previous_fs = $(this).parent().prev();
        
        $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
        
        previous_fs.show();
        current_fs.animate({opacity: 0}, {
            step: function(now) {
                current_fs.css({
                    'display': 'none',
                    'position': 'relative'
                });
                previous_fs.css({'opacity': 1});
            },
            duration: 500
        });
        setProgressBar(--current);
    });
    
    // Atualiza a barra de progresso
    function setProgressBar(curStep){
        var percent = parseFloat(100 / steps) * curStep;
        percent = percent.toFixed();
        $(".progress-bar")
            .css("width",percent+"%")
            .attr("aria-valuenow", percent);
    }
    
    // Validação da Etapa 1
    function validateStep1() {
        const salary = parseFloat($("#desired-salary").val());
        const dailyHours = parseInt($("#daily-hours").val());
        const workDays = parseInt($("#work-days").val());
        const vacationDays = parseInt($("#vacation-days").val());
        
        if(isNaN(salary)) {
            alert("Por favor, insira um salário válido.");
            return false;
        }
        
        if(salary <= 0) {
            alert("O salário deve ser maior que zero.");
            return false;
        }
        
        if(isNaN(dailyHours)){ 
            alert("Por favor, insira horas diárias válidas.");
            return false;
        }
        
        if(dailyHours <= 0 || dailyHours > 24) {
            alert("As horas diárias devem estar entre 1 e 24.");
            return false;
        }
        
        if(isNaN(workDays)) {
            alert("Por favor, insira dias de trabalho válidos.");
            return false;
        }
        
        if(workDays <= 0 || workDays > 7) {
            alert("Os dias de trabalho devem estar entre 1 e 7.");
            return false;
        }
        
        if(isNaN(vacationDays)) {
            alert("Por favor, insira dias de férias válidos.");
            return false;
        }
        
        if(vacationDays < 0 || vacationDays > 365) {
            alert("Os dias de férias devem estar entre 0 e 365.");
            return false;
        }
        
        return true;
    }
    
    // Cálculo do valor da hora
    function calculateHourValue() {
        const salary = parseFloat($("#desired-salary").val());
        const dailyHours = parseInt($("#daily-hours").val());
        const workDays = parseInt($("#work-days").val());
        const vacationDays = parseInt($("#vacation-days").val());
        
        // 1. Calcular dias úteis no ano (365 dias - fins de semana - férias)
        const weeksPerYear = 52;
        const weekendDaysPerWeek = 7 - workDays;
        const totalWeekendDays = weeksPerYear * weekendDaysPerWeek;
        const workingDaysPerYear = 365 - totalWeekendDays - vacationDays;
        
        // 2. Calcular horas trabalhadas por ano
        const hoursPerYear = workingDaysPerYear * dailyHours;
        
        // 3. Calcular valor da hora (salário desejado / horas trabalhadas)
        hourValue = salary / (hoursPerYear / 12); // Valor por mês
        
        // 4. Adicionar custos fixos
        const fixedCosts = costs.filter(c => c.type === 'fixed')
                              .reduce((sum, cost) => sum + parseFloat(cost.value), 0);
        
        hourValue += fixedCosts / (hoursPerYear / 12);
        
        return hourValue;
    }
    
    // Atualiza o preview do valor hora
    function updateHourValuePreview() {
        $("#hour-value-preview").text("R$ " + hourValue.toFixed(2).replace(".", ","));
    }
    
    // Adicionar custo
    $("#add-cost").click(function() {
        const description = $("#cost-description").val().trim();
        const value = parseFloat($("#cost-value").val());
        const type = $("#cost-type").val();
        
        if(!description) {
            alert("Por favor, insira uma descrição para o custo.");
            return;
        }
        
        if(isNaN(value)) {
            alert("Por favor, insira um valor válido para o custo.");
            return;
        }
        
        if(value <= 0) {
            alert("O valor do custo deve ser maior que zero.");
            return;
        }
        
        const cost = {
            id: Date.now(),
            description,
            value,
            type
        };
        
        costs.push(cost);
        renderCosts();
        
        // Limpar campos
        $("#cost-description").val("");
        $("#cost-value").val("");
    });
    
    // Renderiza a lista de custos
    function renderCosts() {
        $("#costs-container").empty();
        
        costs.forEach(cost => {
            const costElement = $(`
                <div class="cost-item" data-id="${cost.id}">
                    <div>
                        <strong>${cost.description}</strong><br>
                        R$ ${cost.value.toFixed(2).replace(".", ",")} (${cost.type === 'fixed' ? 'Fixo' : 'Variável'})
                    </div>
                    <button class="remove-cost">Remover</button>
                </div>
            `);
            $("#costs-container").append(costElement);
        });
        
        // Adiciona evento de remoção
        $(".remove-cost").click(function() {
            const id = parseInt($(this).parent().attr("data-id"));
            costs = costs.filter(c => c.id !== id);
            renderCosts();
        });
    }
    
    // Cálculo do valor do projeto
    function calculateProjectValue() {
        const projectDailyHours = parseInt($("#project-daily-hours").val());
        const projectDays = parseInt($("#project-days").val());
        
        if(isNaN(projectDailyHours)) {
            alert("Por favor, insira horas diárias válidas para o projeto.");
            return;
        }
        
        if(projectDailyHours <= 0 || projectDailyHours > 24) {
            alert("As horas diárias do projeto devem estar entre 1 e 24.");
            return;
        }
        
        if(isNaN(projectDays)) {
            alert("Por favor, insira dias válidos para o projeto.");
            return;
        }
        
        if(projectDays <= 0) {
            alert("O projeto deve ter pelo menos 1 dia de duração.");
            return;
        }
        
        // Calcular horas totais do projeto
        const totalHours = projectDailyHours * projectDays;
        
        // Calcular valor base do projeto
        let projectValue = totalHours * hourValue;
        
        // Adicionar custos variáveis
        const variableCosts = costs.filter(c => c.type === 'variable')
                                 .reduce((sum, cost) => sum + parseFloat(cost.value), 0);
        
        projectValue += variableCosts;
        
        // Atualizar exibição
        $("#project-value-result").text("R$ " + projectValue.toFixed(2).replace(".", ","));
        $("#final-hour-value").text("R$ " + hourValue.toFixed(2).replace(".", ","));
        
        // Atualizar resumo de custos
        renderCostsSummary();
    }
    
    // Renderiza o resumo de custos
    function renderCostsSummary() {
        $("#costs-summary").empty();
        
        const fixedCosts = costs.filter(c => c.type === 'fixed');
        const variableCosts = costs.filter(c => c.type === 'variable');
        
        if(fixedCosts.length > 0) {
            $("#costs-summary").append("<h5>Custos Fixos</h5>");
            fixedCosts.forEach(cost => {
                $("#costs-summary").append(`
                    <div class="cost-item">
                        <div>${cost.description}</div>
                        <div>R$ ${cost.value.toFixed(2).replace(".", ",")}</div>
                    </div>
                `);
            });
        }
        
        if(variableCosts.length > 0) {
            $("#costs-summary").append("<h5 class='mt-3'>Custos Variáveis</h5>");
            variableCosts.forEach(cost => {
                $("#costs-summary").append(`
                    <div class="cost-item">
                        <div>${cost.description}</div>
                        <div>R$ ${cost.value.toFixed(2).replace(".", ",")}</div>
                    </div>
                `);
            });
        }
        
        if(costs.length === 0) {
            $("#costs-summary").append("<p>Nenhum custo adicionado</p>");
        }
    }
    
    // Botão recalculcar
    $("#recalculate").click(function() {
        // Volta para a primeira etapa
        current = 1;
        $("fieldset").hide();
        $("fieldset:first").show();
        $("#progressbar li").removeClass("active");
        $("#progressbar li:first").addClass("active");
        setProgressBar(current);
    });
});