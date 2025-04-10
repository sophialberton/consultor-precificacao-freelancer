// Aguarda o carregamento completo do DOM antes de executar o código
document.addEventListener('DOMContentLoaded', function() {
    // Obtém referências aos elementos do DOM
    const formulario = document.getElementById('formulario-calculadora'); // Formulário de cálculo
    const containerResultado = document.getElementById('container-resultado'); // Div que mostra o resultado
    const valorResultado = document.getElementById('valor-resultado'); // Elemento que exibe o valor calculado
    
    // Adiciona um listener para o evento de submit do formulário
    formulario.addEventListener('submit', function(e) {
        e.preventDefault(); // Previne o comportamento padrão de submit do formulário
        
        // Obter valores do formulário e converter para float
        const valorProjeto = parseFloat(document.getElementById('valor-projeto').value); // Valor total do projeto
        const horasDiarias = parseFloat(document.getElementById('horas-diarias').value); // Horas trabalhadas por dia
        const diasTrabalho = parseFloat(document.getElementById('dias-trabalho').value); // Dias trabalhados por semana
        const diasFerias = parseFloat(document.getElementById('dias-ferias').value); // Dias de férias
        
        // Validar entradas - verifica se são números válidos
        if (isNaN(valorProjeto) || isNaN(horasDiarias) || isNaN(diasTrabalho) || isNaN(diasFerias)) {
            alert('Por favor, preencha todos os campos com valores numéricos válidos.');
            return; // Interrompe a execução se houver valores inválidos
        }
        
        // Validar se os valores são positivos (exceto dias de férias que pode ser zero)
        if (valorProjeto <= 0 || horasDiarias <= 0 || diasTrabalho <= 0 || diasFerias < 0) {
            alert('Por favor, insira valores positivos em todos os campos (exceto dias de férias que pode ser zero).');
            return;
        }
        
        // Validação específica para horas diárias (não pode ser mais que 24)
        if (horasDiarias > 24) {
            alert('Não é possível trabalhar mais de 24 horas por dia.');
            return;
        }
        
        // Validação específica para dias trabalhados (não pode ser mais que 7)
        if (diasTrabalho > 7) {
            alert('Não há mais que 7 dias na semana.');
            return;
        }
        
        // Se todas as validações passarem, calcula o valor da hora
        const valorHora = calcularValorHora(valorProjeto, horasDiarias, diasTrabalho, diasFerias);
        
        // Exibir resultado formatado com 2 casas decimais
        valorResultado.textContent = `R$ ${valorHora.toFixed(2).replace('.', ',')}`;
        // Mostra o container do resultado
        containerResultado.style.display = 'block';
        // Remove a classe 'hidden' caso exista
        containerResultado.classList.remove('oculto');
        
        // Rolagem suave para o resultado (melhor experiência do usuário)
        containerResultado.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Função que calcula o valor da hora baseado nos parâmetros
    function calcularValorHora(valorTotal, horasPorDia, diasPorSemana, diasDeFerias) {
        /* 
        Fórmula do desafio:
        valorHora = (valorProjeto / (diasEfetivos * 4 * horasDiarias)) + ((diasFerias * diasEfetivos * horasDiarias))
        
        Onde:
        - 4 representa as semanas do mês
        - Primeira parte: valor base por hora trabalhada
        - Segunda parte: compensação por dias de férias
        */
        
        const semanasNoMes = 4; // Considera 4 semanas por mês
        
        // Calcula o valor base por hora trabalhada
        const valorBase = valorTotal / (diasPorSemana * semanasNoMes * horasPorDia);
        
        // Calcula a compensação por dias de férias
        const compensacaoFerias = (diasDeFerias * diasPorSemana * horasPorDia);
        
        // Soma ambas partes para obter o valor final da hora
        const valorFinalHora = valorBase + compensacaoFerias;
        
        return valorFinalHora; // Retorna o valor calculado
    }
    
    // Validação em tempo real para aceitar apenas números nos inputs
    const inputs = document.querySelectorAll('input[type="number"]'); // Seleciona todos inputs do tipo number
    inputs.forEach(input => {
        // Adiciona um listener para o evento de input (digitação)
        input.addEventListener('input', function() {
            // Remove qualquer caractere que não seja número ou ponto
            this.value = this.value.replace(/[^0-9.]/g, '');
            
            // Garantir que há apenas um ponto decimal (para números decimais)
            if ((this.value.match(/\./g) || []).length > 1) {
                // Se houver mais de um ponto, remove o último
                this.value = this.value.substring(0, this.value.lastIndexOf('.'));
            }
        });
    });
});