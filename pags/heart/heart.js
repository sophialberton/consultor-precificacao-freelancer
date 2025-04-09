document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formulario-calculadora');
    const containerResultado = document.getElementById('container-resultado');
    const valorResultado = document.getElementById('valor-resultado');
    
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obter valores do formulário
        const valorProjeto = parseFloat(document.getElementById('valor-projeto').value);
        const horasDiarias = parseFloat(document.getElementById('horas-diarias').value);
        const diasTrabalho = parseFloat(document.getElementById('dias-trabalho').value);
        const diasFerias = parseFloat(document.getElementById('dias-ferias').value);
        
        // Validar entradas
        if (isNaN(valorProjeto) || isNaN(horasDiarias) || isNaN(diasTrabalho) || isNaN(diasFerias)) {
            alert('Por favor, preencha todos os campos com valores numéricos válidos.');
            return;
        }
        
        if (valorProjeto <= 0 || horasDiarias <= 0 || diasTrabalho <= 0 || diasFerias < 0) {
            alert('Por favor, insira valores positivos em todos os campos (exceto dias de férias que pode ser zero).');
            return;
        }
        
        if (horasDiarias > 24) {
            alert('Não é possível trabalhar mais de 24 horas por dia.');
            return;
        }
        
        if (diasTrabalho > 7) {
            alert('Não há mais que 7 dias na semana.');
            return;
        }
        
        // Calcular valor da hora
        const valorHora = calcularValorHora(valorProjeto, horasDiarias, diasTrabalho, diasFerias);
        
        // Exibir resultado
        valorResultado.textContent = `R$ ${valorHora.toFixed(2).replace('.', ',')}`;
        containerResultado.style.display = 'block';
        containerResultado.classList.remove('oculto');
        
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