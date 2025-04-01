document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('calculator-form');
    const containerResultado = document.getElementById('result-container');
    const valorResultado = document.getElementById('result-value');
    
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obter valores do formulário
        const valorProjeto = parseFloat(document.getElementById('project-value').value);
        const horasDiarias = parseFloat(document.getElementById('daily-hours').value);
        const diasTrabalhados = parseFloat(document.getElementById('work-days').value);
        const diasFerias = parseFloat(document.getElementById('vacation-days').value);
        
        // Validar entradas
        if (isNaN(valorProjeto) || isNaN(horasDiarias) || isNaN(diasTrabalhados) || isNaN(diasFerias)) {
            alert('Por favor, preencha todos os campos com valores numéricos válidos.');
            return;
        }
        
        if (valorProjeto <= 0 || horasDiarias <= 0 || diasTrabalhados <= 0 || diasFerias < 0) {
            alert('Por favor, insira valores positivos em todos os campos (exceto dias de férias que pode ser zero).');
            return;
        }
        
        if (horasDiarias > 24) {
            alert('Não é possível trabalhar mais de 24 horas por dia.');
            return;
        }
        
        if (diasTrabalhados > 7) {
            alert('Não há mais que 7 dias na semana.');
            return;
        }
        
        // Calcular valor da hora
        const valorHora = calcularValorHora(valorProjeto, horasDiarias, diasTrabalhados, diasFerias);
        
        // Exibir resultado
        valorResultado.textContent = `R$ ${valorHora.toFixed(2)}`;
        containerResultado.style.display = 'block';
        containerResultado.classList.remove('hidden');
        
        // Rolagem suave para o resultado
        containerResultado.scrollIntoView({ behavior: 'smooth' });
    });
    
    function calcularValorHora(valorTotal, horasPorDia, diasPorSemana, diasDeFerias) {
        /* 
        Fórmula do desafio:
        valorHora = (valorProjeto / (diasEfetivos * 4 * horasDiarias)) + ((diasFerias * diasEfetivos * horasDiarias))
        
        Onde:
        - 4 representa as semanas do mês
        - Primeira parte: valor base por hora trabalhada
        - Segunda parte: compensação por dias de férias
        */
        
        const semanasNoMes = 4;
        
        // Valor base por hora trabalhada
        const valorBase = valorTotal / (diasPorSemana * semanasNoMes * horasPorDia);
        
        // Compensação por dias de férias
        const compensacaoFerias = (diasDeFerias * diasPorSemana * horasPorDia);
        
        // Valor final da hora
        const valorFinalHora = valorBase + compensacaoFerias;
        
        return valorFinalHora;
    }
    
    // Validação em tempo real para aceitar apenas números
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9.]/g, '');
            
            // Garantir que há apenas um ponto decimal
            if ((this.value.match(/\./g) || []).length > 1) {
                this.value = this.value.substring(0, this.value.lastIndexOf('.'));
            }
        });
    });
});