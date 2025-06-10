const API_BASE_URL = 'http://127.0.0.1:8000'; // URL da sua API FastAPI

// Referências aos elementos HTML
const barbersList = document.getElementById('barbers-list');
const servicesList = document.getElementById('services-list');
const barberSelect = document.getElementById('barber-select');
const serviceSelect = document.getElementById('service-select');
const appointmentDateInput = document.getElementById('appointment-date');
const timeSlotSelect = document.getElementById('time-slot-select');
const clientNameInput = document.getElementById('client-name');
const clientPhoneInput = document.getElementById('client-phone');
const observationsInput = document.getElementById('observations');
const appointmentForm = document.getElementById('appointment-form');
const messageDiv = document.getElementById('message');

// --- Funções para exibir mensagens ---
function displayMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`; // Adiciona classe 'success' ou 'error'
    messageDiv.style.display = 'block'; // Mostra a div de mensagem

    // Esconde a mensagem após alguns segundos
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// --- Funções para carregar dados da API ---

async function fetchBarbers() {
    try {
        const response = await fetch(`${API_BASE_URL}/barbeiros/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const barbers = await response.json();

        barbersList.innerHTML = ''; // Limpa a lista existente
        barberSelect.innerHTML = '<option value="">Selecione um barbeiro</option>'; // Limpa e adiciona opção padrão

        barbers.forEach(barber => {
            // Adiciona na lista de exibição
            const li = document.createElement('li');
            li.textContent = `ID: ${barber.id} - ${barber.nome} (${barber.especialidade || 'Geral'})`;
            barbersList.appendChild(li);

            // Adiciona no select do formulário
            const option = document.createElement('option');
            option.value = barber.id;
            option.textContent = barber.nome;
            barberSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar barbeiros:', error);
        barbersList.innerHTML = '<li>Erro ao carregar barbeiros.</li>';
        displayMessage('Erro ao carregar barbeiros.', 'error');
    }
}

async function fetchServices() {
    try {
        const response = await fetch(`${API_BASE_URL}/servicos/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const services = await response.json();

        servicesList.innerHTML = ''; // Limpa a lista existente
        serviceSelect.innerHTML = '<option value="">Selecione um serviço</option>'; // Limpa e adiciona opção padrão

        services.forEach(service => {
            // Adiciona na lista de exibição
            const li = document.createElement('li');
            li.textContent = `ID: ${service.id} - ${service.nome} (${service.duracao_minutos} min) - R$ ${service.preco.toFixed(2)}`;
            servicesList.appendChild(li);

            // Adiciona no select do formulário
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.nome} (R$ ${service.preco.toFixed(2)})`;
            serviceSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        servicesList.innerHTML = '<li>Erro ao carregar serviços.</li>';
        displayMessage('Erro ao carregar serviços.', 'error');
    }
}

async function fetchAvailableSlots() {
    const selectedBarberId = barberSelect.value;
    const selectedDate = appointmentDateInput.value;

    timeSlotSelect.innerHTML = '<option value="">Carregando horários...</option>';
    timeSlotSelect.disabled = true;

    if (!selectedBarberId || !selectedDate) {
        timeSlotSelect.innerHTML = '<option value="">Selecione a data e o barbeiro</option>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/horarios_disponiveis/?barbeiro_id=${selectedBarberId}&data=${selectedDate}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const slots = await response.json();

        timeSlotSelect.innerHTML = '<option value="">Selecione um horário</option>';
        if (slots.length === 0) {
            timeSlotSelect.innerHTML = '<option value="">Nenhum horário disponível</option>';
        } else {
            // Simplificando: Apenas listamos os blocos disponíveis.
            // Em uma app real, você precisaria quebrar isso em slots menores (ex: 30 em 30 minutos)
            // e verificar a duração do serviço e outros agendamentos.
            slots.forEach(slot => {
                const option = document.createElement('option');
                // A data_hora do agendamento precisa ser um datetime completo.
                // Aqui, estamos pegando o hora_inicio do slot como o ponto de agendamento.
                // A validação de "tempo suficiente para o serviço" está no backend.
                const dateTimeValue = `${selectedDate}T${slot.hora_inicio}`;
                option.value = dateTimeValue;
                option.textContent = `Das ${slot.hora_inicio.substring(0, 5)} às ${slot.hora_fim.substring(0, 5)}`;
                timeSlotSelect.appendChild(option);
            });
        }
        timeSlotSelect.disabled = false;

    } catch (error) {
        console.error('Erro ao carregar horários disponíveis:', error);
        timeSlotSelect.innerHTML = '<option value="">Erro ao carregar horários</option>';
        displayMessage('Erro ao carregar horários disponíveis.', 'error');
    }
}


// --- Lógica de submissão do formulário de agendamento ---

appointmentForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário

    const appointmentData = {
        cliente_nome: clientNameInput.value,
        cliente_telefone: clientPhoneInput.value,
        data_hora: timeSlotSelect.value, // Já vem no formato YYYY-MM-DDTHH:MM:SS
        barbeiro_id: parseInt(barberSelect.value),
        servico_id: parseInt(serviceSelect.value),
        observacoes: observationsInput.value || null, // Se vazio, envia null
        status: "confirmado" // Padrão
    };

    // Validações básicas no frontend (adicione mais se quiser)
    if (!appointmentData.cliente_nome || !appointmentData.data_hora || !appointmentData.barbeiro_id || !appointmentData.servico_id) {
        displayMessage('Por favor, preencha todos os campos obrigatórios (Nome, Barbeiro, Serviço, Data, Horário).', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/agendamentos/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointmentData)
        });

        const result = await response.json();

        if (response.ok) {
            displayMessage('Agendamento realizado com sucesso!', 'success');
            appointmentForm.reset(); // Limpa o formulário
            timeSlotSelect.innerHTML = '<option value="">Selecione a data e o barbeiro</option>';
            timeSlotSelect.disabled = true;
        } else {
            // A API FastAPI retorna mensagens de erro no campo "detail"
            displayMessage(`Erro ao agendar: ${result.detail || 'Verifique os dados.'}`, 'error');
        }
    } catch (error) {
        console.error('Erro na requisição de agendamento:', error);
        displayMessage('Ocorreu um erro ao tentar agendar. Tente novamente mais tarde.', 'error');
    }
});

// --- Event Listeners para carregar horários disponíveis quando barbeiro ou data mudam ---
barberSelect.addEventListener('change', fetchAvailableSlots);
appointmentDateInput.addEventListener('change', fetchAvailableSlots);


// --- Carregar dados iniciais ao carregar a página ---
window.onload = () => {
    fetchBarbers();
    fetchServices();

    // Define a data mínima do input de data para hoje
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Mês é 0-indexado
    const day = String(today.getDate()).padStart(2, '0');
    appointmentDateInput.min = `${year}-${month}-${day}`;
};