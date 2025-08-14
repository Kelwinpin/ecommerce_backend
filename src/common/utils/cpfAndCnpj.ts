type DocumentType = 'CPF' | 'CNPJ' | false;

export function validateCPF(value: string): boolean {
    // Garante que o valor é uma string e remove caracteres inválidos
    const cleanValue = value.toString().replace(/[^0-9]/g, '');

    // Verifica se tem 11 dígitos
    if (cleanValue.length !== 11) {
        return false;
    }

    // Verifica se não são todos dígitos iguais (CPFs inválidos conhecidos)
    if (/^(\d)\1{10}$/.test(cleanValue)) {
        return false;
    }

    // Captura os 9 primeiros dígitos
    const firstNineDigits = cleanValue.substr(0, 9);

    // Calcula o primeiro dígito verificador
    const firstCheckDigit = calculateDigitPositions(firstNineDigits, 10);

    // Calcula o segundo dígito verificador
    const secondCheckDigit = calculateDigitPositions(firstCheckDigit, 11);

    // Verifica se o CPF gerado é idêntico ao enviado
    return secondCheckDigit === cleanValue;
}

export function validateCNPJ(value: string): boolean {
    // Garante que o valor é uma string e remove caracteres inválidos
    const cleanValue = value.toString().replace(/[^0-9]/g, '');

    // Verifica se tem 14 dígitos
    if (cleanValue.length !== 14) {
        return false;
    }

    // Verifica se não são todos dígitos iguais (CNPJs inválidos conhecidos)
    if (/^(\d)\1{13}$/.test(cleanValue)) {
        return false;
    }

    // Captura os primeiros 12 números do CNPJ
    const firstTwelveDigits = cleanValue.substr(0, 12);

    // Faz o primeiro cálculo (posição inicial 5)
    const firstCalculation = calculateDigitPositions(firstTwelveDigits, 5);

    // O segundo cálculo começa na posição 6
    const secondCalculation = calculateDigitPositions(firstCalculation, 6);

    // Verifica se o CNPJ gerado é idêntico ao enviado
    return secondCalculation === cleanValue;
}

export function validateCPForCNPJ(value: string): boolean {
    const documentType = checkDocumentType(value);

    if (documentType === 'CPF') {
        return validateCPF(value);
    }

    if (documentType === 'CNPJ') {
        return validateCNPJ(value);
    }

    return false;
}

export function formatCPForCNPJ(value: string): string | false {
    const documentType = checkDocumentType(value);
    const cleanValue = value.toString().replace(/[^0-9]/g, '');

    if (documentType === 'CPF' && validateCPF(value)) {
        // Formata o CPF ###.###.###-##
        return `${cleanValue.substr(0, 3)}.${cleanValue.substr(3, 3)}.${cleanValue.substr(6, 3)}-${cleanValue.substr(9, 2)}`;
    }

    if (documentType === 'CNPJ' && validateCNPJ(value)) {
        // Formata o CNPJ ##.###.###/####-##
        return `${cleanValue.substr(0, 2)}.${cleanValue.substr(2, 3)}.${cleanValue.substr(5, 3)}/${cleanValue.substr(8, 4)}-${cleanValue.substr(12, 2)}`;
    }

    return false;
}

// Funções auxiliares
function checkDocumentType(value: string): DocumentType {
    const cleanValue = value.toString().replace(/[^0-9]/g, '');

    if (cleanValue.length === 11) {
        return 'CPF';
    }

    if (cleanValue.length === 14) {
        return 'CNPJ';
    }

    return false;
}

function calculateDigitPositions(digits: string, initialPosition: number = 10, digitSum: number = 0): string {
    let currentPosition = initialPosition;
    let sum = digitSum;

    // Faz a soma dos dígitos com a posição
    for (let i = 0; i < digits.length; i++) {
        sum += parseInt(digits[i]) * currentPosition;
        currentPosition--;

        // Parte específica para CNPJ - reinicia posição quando menor que 2
        if (currentPosition < 2) {
            currentPosition = 9;
        }
    }

    // Captura o resto da divisão por 11
    const remainder = sum % 11;

    // Calcula o dígito verificador
    const checkDigit = remainder < 2 ? 0 : 11 - remainder;

    // Retorna os dígitos originais concatenados com o dígito verificador
    return digits + checkDigit.toString();
}