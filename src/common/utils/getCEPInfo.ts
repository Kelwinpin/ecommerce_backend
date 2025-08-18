import axios from 'axios';
import { ViaCep } from '../interfaces/viaCep';

export async function getCEPInfo(cep: string) {
    const url = `https://viacep.com.br/ws/${cep}/json/`;

    const response = await axios.get<ViaCep>(url).then((res) => res.data);

    return response;
}